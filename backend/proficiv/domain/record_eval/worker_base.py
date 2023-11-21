import abc
import asyncio
from time import sleep

from pydantic import BaseModel

from prisma import Prisma, types
from proficiv import kvs
from proficiv.config import Config
from proficiv.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


class RecordEvalResult(BaseModel):
    segs: list[types.RecordSegmentCreateWithoutRelationsInput]
    forehead_camera_fps: float
    forehead_camera_total_frames: int
    forehead_camera_prelude_frames: int
    progress: kvs.RecordEvalProgress


class RecordEvalWorkerBase(metaclass=abc.ABCMeta):
    def __init__(self, cfg: Config) -> None:
        self.cfg = cfg
        self.redis = kvs.get_redis_client(
            host=self.cfg.redis_host, port=self.cfg.redis_port, db=self.cfg.redis_db
        )

    @abc.abstractmethod
    async def eval(self, job: kvs.RecordEvalJob, prisma: Prisma) -> RecordEvalResult:
        ...

    async def __eval_and_save(self, job: kvs.RecordEvalJob, prisma: Prisma) -> None:
        res = await self.eval(job, prisma)
        _log.info(f"Predicted segs: {len(res.segs)=}")

        await prisma.record.update(
            data={
                "forehead_camera_fps": res.forehead_camera_fps,
                "forehead_camera_total_frames": res.forehead_camera_total_frames,
                "forehead_camera_prelude_frames": res.forehead_camera_prelude_frames,
            },
            where={"id": job.record_id},
        )
        await prisma.recordsegment.create_many(data=res.segs)

        res.progress.percentage = 100
        res.progress.save(self.redis)

        sleep(1)
        _log.info("Deleting progress from kvs")
        res.progress.delete(self.redis)

    async def process_async(self, job: kvs.RecordEvalJob) -> None:
        async with Prisma() as db:
            await self.__eval_and_save(job, db)

    def process(self, job: kvs.RecordEvalJob) -> None:
        asyncio.run(self.process_async(job))

    def loop(self) -> None:
        _log.info("Start job subscribing loop")
        while True:
            _log.info("\n\nWaiting job...")

            try:
                job = kvs.RecordEvalJob.dequeue_blocking(self.redis)
            except KeyboardInterrupt:
                exit(0)

            _log.info(f"Got a job: {job=}")
            try:
                self.process(job)
            except Exception as e:  # noqa: BLE001 Do not catch blind exception
                _log.error(e)
