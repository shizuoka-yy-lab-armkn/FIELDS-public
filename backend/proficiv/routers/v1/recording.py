from fastapi import APIRouter

from proficiv import kvs
from proficiv.db import prisma_client
from proficiv.depes import RedisDep
from proficiv.domain.recording.schema import (
    NowRecording,
    RecordingAvailability,
    RecordingAvailable,
)

router = APIRouter(
    prefix="/recording",
    tags=["recording"],
)


@router.get("/availability")
async def get_recording_availability(redis: RedisDep) -> RecordingAvailability:
    rec = kvs.Recording.get_or_none(redis)
    if rec is None:
        return RecordingAvailability(root=RecordingAvailable())

    user = await prisma_client.user.find_unique_or_raise({"id": rec.user_id})

    return RecordingAvailability(
        root=NowRecording(username=user.username, start_at=rec.start_at)
    )


@router.post("/start")
async def start_recording():
    # 動画ストリームを private data storage へ保存
    # ffmpeg の pid を取得
    # DB の record テーブルへ create
    # Redis に保存する内容:
    #   - forehead_video_ffmpeg_pid
    #   - record_id
    raise NotImplementedError()


@router.post("/finish")
async def finish_recording():
    raise NotImplementedError()
