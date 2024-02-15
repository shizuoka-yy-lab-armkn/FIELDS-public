import functools
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel
from redis import Redis

from fields.entity import RecordID, SubjectID, UserID
from fields.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


@functools.cache
def get_redis_client(host: str, port: int, db: int) -> Redis:
    return Redis(host=host, port=port, db=db)


class Recording(BaseModel):
    subject_id: SubjectID
    user_id: UserID
    username: str
    daily_seq: int
    start_at: datetime
    forehead_video_path: Path
    forehead_video_ffmpeg_pid: int

    @staticmethod
    def _redis_key() -> str:
        return "Recording"

    @classmethod
    def get_or_none(cls, redis: Redis) -> "Recording | None":
        s = redis.get(cls._redis_key())
        if s is None:
            return None

        assert isinstance(s, bytes)
        return cls.model_validate_json(s)

    @classmethod
    def exists(cls, redis: Redis) -> bool:
        return redis.get(cls._redis_key()) is not None

    @classmethod
    def delete(cls, redis: Redis) -> None:
        _log.info("delete Recording")
        redis.delete(cls._redis_key())

    def save(self, redis: Redis) -> None:
        key = self._redis_key()
        value = self.model_dump_json()
        redis.set(key, value)


class RecordEvalJob(BaseModel):
    record_id: RecordID
    subject_id: SubjectID
    user_id: UserID
    username: str
    record_seq: int
    recording_start_at: datetime
    eval_start_at: datetime
    forehead_video_path: Path

    @staticmethod
    def _redis_key() -> str:
        return "RecordEvalTaskQueue"

    def enqueue(self, redis: Redis) -> None:
        key = self._redis_key()
        value = self.model_dump_json()
        _log.info("Enqueueing a job")
        redis.lpush(key, value)

    @classmethod
    def dequeue_blocking(cls, redis: Redis) -> "RecordEvalJob":
        res = redis.brpop([cls._redis_key()])
        _log.info("Popped a job")

        assert isinstance(res, tuple)
        _, serialized = res

        return RecordEvalJob.model_validate_json(serialized)


class RecordEvalProgress(BaseModel):
    record_id: RecordID
    percentage: int

    @staticmethod
    def _redis_key(record_id: RecordID) -> str:
        return f"RecordEvalProgress/{record_id}"

    @classmethod
    def get_or_none(
        cls, record_id: RecordID, redis: Redis
    ) -> "RecordEvalProgress | None":
        s = redis.get(cls._redis_key(record_id))
        if s is None:
            return None

        assert isinstance(s, bytes)
        return cls.model_validate_json(s)

    def delete(self, redis: Redis) -> None:
        _log.info("delete Recording")
        redis.delete(self._redis_key(self.record_id))

    def save(self, redis: Redis) -> None:
        key = self._redis_key(self.record_id)
        value = self.model_dump_json()
        redis.set(key, value)
