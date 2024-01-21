import random
from time import sleep

import cv2
from typing_extensions import override

from fields import kvs
from fields.config import Config
from prisma import Prisma, types

from .worker_base import RecordEvalResult, RecordEvalWorkerBase


class RecordEvalMockWorker(RecordEvalWorkerBase):
    def __init__(self, cfg: Config) -> None:
        super().__init__(cfg)

    @override
    async def eval(self, job: kvs.RecordEvalJob, prisma: Prisma) -> RecordEvalResult:
        progress = kvs.RecordEvalProgress(record_id=job.record_id, percentage=0)
        while progress.percentage < 90:
            progress.save(self.redis)
            sleep(1)
            progress.percentage += 5
        progress.percentage = 90
        progress.save(self.redis)

        video = cv2.VideoCapture(str(job.forehead_video_path))
        fps = video.get(cv2.CAP_PROP_FPS)
        total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
        prelude_frames = int(total_frames * 0.02)

        master_actions = await prisma.action.find_many(
            where={"subject_id": job.subject_id}, order={"ord_serial": "asc"}
        )

        rem_div_n = (total_frames - prelude_frames) // len(master_actions)

        begin_frame = prelude_frames
        segs: list[types.RecordSegmentCreateWithoutRelationsInput] = []
        for ma in master_actions:
            if begin_frame >= total_frames:
                break

            # 10% の確率で現在の工程番号の登録をスキップ
            if random.random() < 0.1:
                continue

            nframes = random.randint(rem_div_n // 2, rem_div_n * 2)
            end_frame = min(total_frames, begin_frame + nframes)
            segs.append(
                {
                    "record_id": job.record_id,
                    "action_id": ma.id,
                    "begin_frame": begin_frame,
                    "end_frame": end_frame,
                }
            )
            begin_frame = end_frame

        # 工程の順序間違いを再現
        for _ in range(4):
            l = random.randint(0, len(segs) - 1)
            r = random.randint(0, len(segs) - 1)
            segs[l], segs[r] = segs[r], segs[l]

        return RecordEvalResult(
            segs=segs,
            forehead_camera_fps=fps,
            forehead_camera_total_frames=total_frames,
            forehead_camera_prelude_frames=prelude_frames,
            progress=progress,
        )
