import asyncio
import gc

import cv2
import numpy as np
import torch
from typing_extensions import override

from fields import kvs
from fields.config import Config
from fields.domain.record_eval.worker_base import RecordEvalResult, RecordEvalWorkerBase
from fields.domain.records.usecase import (
    resolve_forehead_camera_blip2_npy_path,
    resolve_forehead_camera_prelude_wav_path,
    resolve_tas_likelihood_npy_path,
)
from fields.entity import ActionID
from fields.ml.blip2 import Blip2FeatureExtractor
from fields.ml.mstcn import MsTcn
from fields.utils.algo import RunlengthBlock, runlength
from fields.utils.logging import get_colored_logger
from prisma import Prisma, types

from . import usecase

ACTIONS = [0] + list(range(5, 39 + 1))
assert len(ACTIONS) == 36

_PROGRESS_WEIGHT_DETECTING_CLAP_TIME = 10
_PROGRESS_WEIGHT_VIDEO_FEATURE_EXTRACTION = 85

_log = get_colored_logger(__name__)


class RecordEvalWorker(RecordEvalWorkerBase):
    def __init__(self, cfg: Config) -> None:
        super().__init__(cfg)
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.blip2 = Blip2FeatureExtractor(self.device)
        self.mstcn = MsTcn.from_file(
            self.cfg.pretrained_mstcn_path,
            features_dim=256,
            num_classes=len(ACTIONS),
        )

    @override
    async def eval(self, job: kvs.RecordEvalJob, prisma: Prisma) -> RecordEvalResult:
        progress = kvs.RecordEvalProgress(record_id=job.record_id, percentage=0)
        progress.save(self.redis)

        # 収録用の ffmpeg が kill されるのを待つ
        await asyncio.sleep(self.cfg.ffmpeg_recording_kill_delay_sec + 1.5)

        # 拍手までの時間を求める
        wav_path = resolve_forehead_camera_prelude_wav_path(
            self.cfg, job.username, job.record_seq, job.recording_start_at
        )
        prelude_dur_secs = usecase.detect_triple_clap_timepoint_in_sec(
            video_path=job.forehead_video_path, tmp_wav_save_path=wav_path
        )
        progress.percentage = _PROGRESS_WEIGHT_DETECTING_CLAP_TIME
        progress.save(self.redis)

        # 動画のメタデータ取得
        video = cv2.VideoCapture(str(job.forehead_video_path))
        assert video.isOpened

        fps = video.get(cv2.CAP_PROP_FPS)
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        prelude_frames = int(prelude_dur_secs * fps)
        _log.info(f"{fps=}, {total_frames=}, {prelude_frames=}")

        # 動画の埋め込みを生成する
        blip2_npy_path = resolve_forehead_camera_blip2_npy_path(
            self.cfg, job.username, job.record_seq, job.recording_start_at
        )
        _log.info(f"{blip2_npy_path=}")

        if self.cfg.mock_video_feature_extraction:
            video_embedding = np.load(self.cfg.mock_video_feature_npy_path)
        else:
            _log.info("-------------------------------------")

            def blip2_batch_done_callback(processed_frame_count: int) -> None:
                progress.percentage = _PROGRESS_WEIGHT_DETECTING_CLAP_TIME + (
                    processed_frame_count * _PROGRESS_WEIGHT_VIDEO_FEATURE_EXTRACTION
                ) // (total_frames - prelude_frames)
                progress.save(self.redis)

            video_embedding = usecase.extract_video_feature(
                self.blip2,
                video,
                batch_size=self.cfg.blip2_batch_size,
                skip_prefix_frames=prelude_frames,
                batch_done_callback=blip2_batch_done_callback,
            )
        video.release()
        del video
        gc.collect()

        blip2_npy_path.parent.mkdir(exist_ok=True, parents=True)
        np.save(blip2_npy_path, video_embedding)

        master_actions = await prisma.action.find_many(
            where={"subject_id": job.subject_id}, order={"seq": "asc"}
        )
        aseq2aid = {a.seq: ActionID(a.id) for a in master_actions}

        # 行動分節
        _log.info("Start mstcn prediction")
        preds, likelihoods = self.mstcn.predict(video_embedding, self.device)

        tas_likelihood_path = resolve_tas_likelihood_npy_path(
            self.cfg, job.username, job.record_seq, job.recording_start_at
        )
        tas_likelihood_path.parent.mkdir(exist_ok=True, parents=True)
        np.save(tas_likelihood_path, likelihoods)

        segs: list[types.RecordSegmentCreateWithoutRelationsInput] = [
            {
                "action_id": aseq2aid[ACTIONS[seg.val]],
                "record_id": job.record_id,
                "begin_frame": prelude_frames + seg.begin,
                "end_frame": prelude_frames + seg.begin + seg.len,
                "tas_likelihood": _calc_likelihood_mean(likelihoods, seg),
            }
            for seg in runlength(preds)
            if seg.val != 0  # 添字0は action_seq = 0 となるが，これはダミー工程
        ]

        return RecordEvalResult(
            segs=segs,
            forehead_camera_fps=fps,
            forehead_camera_total_frames=total_frames,
            forehead_camera_prelude_frames=prelude_frames,
            progress=progress,
        )


def _calc_likelihood_mean(likelihoods: torch.Tensor, seg: RunlengthBlock[int]) -> float:
    # セグメントの境界の3フレームは除外する
    class_idx = seg.val
    begin = seg.begin + 3
    end = seg.end - 3

    if begin < end:
        return float(torch.mean(likelihoods[class_idx, begin:end]))

    return 0
