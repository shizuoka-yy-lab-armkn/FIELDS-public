import functools
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel
from redis import Redis

from proficiv.entity import SubjectID, UserID


@functools.cache
def get_redis_client(host: str, port: int, db: int) -> Redis:
    return Redis(host=host, port=port, db=db)


class Recording(BaseModel):
    subject_id: SubjectID
    user_id: UserID
    user_wise_seq: int
    start_at: datetime
    forehead_video_path: Path
    forehead_video_ffmpeg_pid: int

    @staticmethod
    def redis_key() -> str:
        return "recording"

    @classmethod
    def get_or_none(cls, redis: Redis) -> "Recording | None":
        s = redis.get(cls.redis_key())
        if s is None:
            return None

        assert isinstance(s, bytes)
        return Recording.model_validate_json(s)

    @classmethod
    def delete(cls, redis: Redis) -> None:
        redis.delete(cls.redis_key())

    def save(self, redis: Redis) -> None:
        key = self.redis_key()
        value = self.model_dump_json()
        redis.set(key, value)
