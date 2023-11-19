import functools
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel
from redis import Redis

from proficiv.entity import SubjectID, UserID
from proficiv.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


@functools.cache
def get_redis_client(host: str, port: int, db: int) -> Redis:
    return Redis(host=host, port=port, db=db)


class Recording(BaseModel):
    subject_id: SubjectID
    user_id: UserID
    username: str
    seq: int
    start_at: datetime
    forehead_video_path: Path
    forehead_video_ffmpeg_pid: int

    @staticmethod
    def _redis_key() -> str:
        return "recording"

    @classmethod
    def get_or_none(cls, redis: Redis) -> "Recording | None":
        s = redis.get(cls._redis_key())
        if s is None:
            return None

        assert isinstance(s, bytes)
        return Recording.model_validate_json(s)

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
