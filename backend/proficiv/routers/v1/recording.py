import os
import subprocess

from fastapi import APIRouter, BackgroundTasks, HTTPException
from starlette.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_401_UNAUTHORIZED,
    HTTP_423_LOCKED,
)

from proficiv import kvs
from proficiv.db import prisma_client
from proficiv.depes import ConfigDep, RedisDep, UserDep
from proficiv.domain.recording.schema import (
    FinishRecordingResp,
    NowRecording,
    RecordingAvailability,
    RecordingAvailable,
    StartRecordingReq,
)
from proficiv.domain.recording.usecase import kill_ffmpeg_process_later
from proficiv.domain.records.usecase import resolve_forehead_camera_video_path
from proficiv.entity import RecordID
from proficiv.utils.datetime import jst_now
from proficiv.utils.logging import get_colored_logger

router = APIRouter(
    prefix="/recording",
    tags=["recording"],
)

_log = get_colored_logger(__name__)


@router.get("/availability")
async def get_recording_availability(redis: RedisDep) -> RecordingAvailability:
    rec = kvs.Recording.get_or_none(redis)
    if rec is None:
        return RecordingAvailability(root=RecordingAvailable())

    return RecordingAvailability(
        root=NowRecording(username=rec.username, start_at=rec.start_at)
    )


@router.post("/start")
async def start_recording(
    payload: StartRecordingReq,
    user: UserDep,
    cfg: ConfigDep,
    redis: RedisDep,
) -> None:
    if kvs.Recording.exists(redis):
        raise HTTPException(HTTP_423_LOCKED, detail="Now recording")

    record_count = await prisma_client.record.count(
        where={"user_id": user.user_id, "subject_id": payload.subject_id}
    )
    seq = record_count + 1

    now = jst_now()

    forehead_video_save_path = resolve_forehead_camera_video_path(
        cfg, user.username, seq, now
    )
    _log.info(f"{forehead_video_save_path=}")
    forehead_video_save_path.parent.mkdir(exist_ok=True, parents=True)

    # 動画ストリームを private data storage へ保存
    if cfg.mock_recording:
        os.symlink(
            src=cfg.mock_record_video_path.absolute(), dst=forehead_video_save_path
        )
        pid = -1
    else:
        proc = subprocess.Popen(
            [
                "ffmpeg",
                "-i",
                f"rtmp://localhost:{cfg.rtmp_port}/live/test",
                forehead_video_save_path,
            ]
        )
        pid = proc.pid

    rec = kvs.Recording(
        subject_id=payload.subject_id,
        user_id=user.user_id,
        username=user.username,
        seq=seq,
        start_at=now,
        forehead_video_path=forehead_video_save_path,
        forehead_video_ffmpeg_pid=pid,
    )
    rec.save(redis)

    return None


@router.post("/finish")
async def finish_recording(
    user: UserDep,
    cfg: ConfigDep,
    redis: RedisDep,
    background_tasks: BackgroundTasks,
) -> FinishRecordingResp:
    rec = kvs.Recording.get_or_none(redis)
    if rec is None:
        raise HTTPException(HTTP_400_BAD_REQUEST, detail="Not recording")

    _log.info(f"{rec=}")

    if user.user_id != rec.user_id:
        raise HTTPException(HTTP_401_UNAUTHORIZED, detail="Not recording owner")

    background_tasks.add_task(kill_ffmpeg_process_later, rec.forehead_video_ffmpeg_pid)

    forehead_video_rel_path = str(
        rec.forehead_video_path.relative_to(cfg.public_static_dir)
    )

    rec.delete(redis)

    record = await prisma_client.record.create(
        data={
            "subject_id": rec.subject_id,
            "user_id": rec.user_id,
            "created_at": rec.start_at,
            "user_wise_seq": rec.seq,
            "forehead_camera_fps": 29.97,
            "forehead_camera_orig_video_path": forehead_video_rel_path,
            "forehead_camera_public_video_path": forehead_video_rel_path,
        }
    )

    return FinishRecordingResp(record_id=RecordID(record.id))
