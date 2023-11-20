import asyncio
from time import sleep

import cv2
import numpy as np
import torch

from prisma import Prisma, types
from proficiv import kvs
from proficiv.config import get_config
from proficiv.domain.records.usecase import (
    resolve_forehead_camera_blip2_npy_path,
    resolve_forehead_camera_prelude_wav_path,
)
from proficiv.entity import ActionID
from proficiv.ml.blip2 import Blip2FeatureExtractor
from proficiv.ml.mstcn import MsTcn
from proficiv.utils.algo import runlength
from proficiv.utils.logging import get_colored_logger

from . import usecase

_PROGRESS_WEIGHT_DETECTING_CLAP_TIME = 10
_PROGRESS_WEIGHT_VIDEO_FEATURE_EXTRACTION = 85

_log = get_colored_logger(__name__)


ACTIONS = [0] + list(range(5, 39 + 1))
assert len(ACTIONS) == 36


class RecordEvalJobConsumer:
    def __init__(self) -> None:
        self.cfg = get_config()
        self.redis = kvs.get_redis_client(
            host=self.cfg.redis_host, port=self.cfg.redis_port, db=self.cfg.redis_db
        )
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.blip2 = Blip2FeatureExtractor(self.device)
        self.mstcn = MsTcn.from_file(
            self.cfg.pretrained_mstcn_path, features_dim=256, num_classes=len(ACTIONS)
        )

    async def consume_async(self, job: kvs.RecordEvalJob) -> None:
        async with Prisma() as db:
            await self._comsume_async(job, db)

    async def _comsume_async(self, job: kvs.RecordEvalJob, prisma: Prisma) -> None:
        progress = kvs.RecordEvalProgress(
            record_id=job.record_id, progress_percentage=0
        )
        progress.save(self.redis)

        # 拍手までの時間を求める
        wav_path = resolve_forehead_camera_prelude_wav_path(
            self.cfg, job.username, job.record_seq, job.recording_start_at
        )
        prelude_dur_secs = usecase.detect_triple_clap_timepoint_in_sec(
            video_path=job.forehead_video_path, tmp_wav_save_path=wav_path
        )
        progress.progress_percentage = _PROGRESS_WEIGHT_DETECTING_CLAP_TIME
        progress.save(self.redis)

        # 動画のメタデータ取得
        video = cv2.VideoCapture(str(job.forehead_video_path))
        fps = video.get(cv2.CAP_PROP_FPS)
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        prelude_frames = int(prelude_dur_secs * fps)

        # 動画の埋め込みを生成する
        blip2_npy_path = resolve_forehead_camera_blip2_npy_path(
            self.cfg, job.username, job.record_seq, job.recording_start_at
        )
        video_embed = usecase.extract_video_feature(
            self.blip2,
            video,
            skip_prefix_frames=prelude_frames,
        )
        video.release()
        del video
        np.save(blip2_npy_path, video_embed)
        progress.progress_percentage = (
            _PROGRESS_WEIGHT_DETECTING_CLAP_TIME
            + _PROGRESS_WEIGHT_VIDEO_FEATURE_EXTRACTION
        )
        progress.save(self.redis)

        master_actions = await prisma.action.find_many(
            where={"subject_id": job.subject_id}
        )
        aseq2aid = {a.seq: ActionID(a.id) for a in master_actions}

        # 行動分節
        _log.info(f"Start mstcn prediction")
        preds = self.mstcn.predict(video_embed, self.device)
        segs: list[types.RecordSegmentCreateWithoutRelationsInput] = [
            {
                "action_id": aseq2aid[ACTIONS[seg.val]],
                "record_id": job.record_id,
                "begin_frame": prelude_frames + seg.begin,
                "end_frame": prelude_frames + seg.begin + seg.len,
            }
            for seg in runlength(preds)
            if seg.val != 0  # 添字0の予測結果は無視 (action_seq = 0 となるが，これはダミー工程)
        ]
        _log.info(f"Predicted segs: {len(segs)=}")

        # RDBMS へ保存
        await prisma.record.update(
            data={
                "forehead_camera_fps": fps,
                "forehead_camera_total_frames": total_frames,
                "forehead_camera_prelude_frames": prelude_frames,
            },
            where={"id": job.record_id},
        )
        await prisma.recordsegment.create_many(data=segs)

        progress.progress_percentage = 100
        progress.save(self.redis)

        sleep(1)
        _log.info("Deleting progress from kvs")
        progress.delete(self.redis)

    def consume(self, job: kvs.RecordEvalJob) -> None:
        asyncio.run(self.consume_async(job))

    def loop(self) -> None:
        while True:
            _log.info("Waiting job...")
            job = kvs.RecordEvalJob.dequeue_blocking(self.redis)
            _log.info(f"Got a job: {job=}")
            try:
                self.consume(job)
            except Exception as e:
                _log.error(e)
