import shutil
import subprocess

from fastapi import APIRouter, BackgroundTasks, HTTPException
from starlette.status import HTTP_400_BAD_REQUEST, HTTP_423_LOCKED

from fields import kvs
from fields.db import prisma_client
from fields.depes import ConfigDep, RedisDep
from fields.domain.recording.schema import (
    FinishRecordingResp,
    NowRecording,
    PostRecordingFromLocalVideoReq,
    RecordingAvailability,
    RecordingAvailable,
    StartRecordingReq,
)
from fields.domain.recording.usecase import kill_ffmpeg_process_later
from fields.domain.records.usecase import resolve_forehead_camera_video_path
from fields.entity import RecordID, SubjectID, UserID
from fields.utils.datetime import jst_now
from fields.utils.logging import get_colored_logger

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
    cfg: ConfigDep,
    redis: RedisDep,
) -> None:
    if kvs.Recording.exists(redis):
        raise HTTPException(HTTP_423_LOCKED, detail="Now recording")

    subject = await prisma_client.subject.find_unique(
        where={"slug": payload.subject_slug}
    )
    if subject is None:
        raise HTTPException(
            HTTP_400_BAD_REQUEST,
            f"No such subject (subject_slug={payload.subject_slug})",
        )
    user = await prisma_client.user.find_unique({"username": payload.username})
    if user is None:
        raise HTTPException(HTTP_400_BAD_REQUEST, "User not found")

    record_count = await prisma_client.record.count(
        where={"user_id": user.id, "subject_id": subject.id}
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
        # abspath で symlink すると，nginx のセキュリティ機構
        # により document root 外扱いされて 404 になってしまう
        # TODO relative path の計算が少し複雑だったので symlink ではなく copy で代用
        shutil.copy(src=cfg.mock_record_video_path, dst=forehead_video_save_path)
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
        subject_id=SubjectID(subject.id),
        user_id=UserID(user.id),
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
    cfg: ConfigDep,
    redis: RedisDep,
    background_tasks: BackgroundTasks,
) -> FinishRecordingResp:
    rec = kvs.Recording.get_or_none(redis)
    if rec is None:
        raise HTTPException(HTTP_400_BAD_REQUEST, detail="Not recording")

    _log.info(f"Fetched a running recording: {rec=}")

    # if user.user_id != rec.user_id:
    #     raise HTTPException(HTTP_401_UNAUTHORIZED, detail="Not recording owner")

    background_tasks.add_task(
        kill_ffmpeg_process_later,
        rec.forehead_video_ffmpeg_pid,
        cfg.ffmpeg_recording_kill_delay_sec,
    )

    rec.delete(redis)

    now = jst_now()

    forehead_video_rel_path = str(
        rec.forehead_video_path.relative_to(cfg.public_static_dir)
    )

    record = await prisma_client.record.create(
        data={
            "subject_id": rec.subject_id,
            "user_id": rec.user_id,
            "recording_started_at": rec.start_at,
            "recording_finished_at": now,
            "seq": rec.seq,
            "forehead_camera_fps": 29.97,
            "forehead_camera_orig_video_path": forehead_video_rel_path,
            "forehead_camera_public_video_path": forehead_video_rel_path,
        }
    )

    job = kvs.RecordEvalJob(
        record_id=RecordID(record.id),
        subject_id=rec.subject_id,
        user_id=rec.user_id,
        username=rec.username,
        record_seq=rec.seq,
        recording_start_at=rec.start_at,
        eval_start_at=now,
        forehead_video_path=rec.forehead_video_path,
    )
    _log.info(f"{job=}")
    job.enqueue(redis)

    return FinishRecordingResp(record_id=RecordID(record.id))


@router.post("/local_video")
async def post_record(
    payload: PostRecordingFromLocalVideoReq,
    cfg: ConfigDep,
    redis: RedisDep,
) -> FinishRecordingResp:
    subj = await prisma_client.subject.find_unique({"slug": payload.subject_slug})
    if subj is None:
        raise HTTPException(400, "Subject not found")

    user = await prisma_client.user.find_unique({"username": payload.username})
    if user is None:
        raise HTTPException(400, "User not found")

    if not payload.local_video_abs_path.is_absolute():
        raise HTTPException(400, "Local video path is not absolute")

    if not payload.local_video_abs_path.exists():
        raise HTTPException(400, "Local video not found")

    now = jst_now()

    record_count = await prisma_client.record.count(
        where={"user_id": user.id, "subject_id": subj.id}
    )
    seq = record_count + 1

    forehead_video_save_path = resolve_forehead_camera_video_path(
        cfg, user.username, seq, now
    )
    _log.info(f"{forehead_video_save_path=}")
    forehead_video_save_path.parent.mkdir(exist_ok=True, parents=True)

    _log.info(
        f"Copying:\n  {payload.local_video_abs_path}\n  -> {forehead_video_save_path}"
    )
    shutil.copy(src=payload.local_video_abs_path, dst=forehead_video_save_path)

    forehead_video_rel_path = str(
        forehead_video_save_path.relative_to(cfg.public_static_dir)
    )

    record = await prisma_client.record.create(
        data={
            "subject_id": subj.id,
            "user_id": user.id,
            "recording_started_at": now,
            "recording_finished_at": now,
            "seq": seq,
            "forehead_camera_fps": 29.97,
            "forehead_camera_orig_video_path": forehead_video_rel_path,
            "forehead_camera_public_video_path": forehead_video_rel_path,
        }
    )

    job = kvs.RecordEvalJob(
        record_id=RecordID(record.id),
        subject_id=SubjectID(subj.id),
        user_id=UserID(user.id),
        username=payload.username,
        record_seq=seq,
        recording_start_at=now,
        eval_start_at=now,
        forehead_video_path=forehead_video_save_path,
    )
    _log.info(f"{job=}")
    job.enqueue(redis)

    return FinishRecordingResp(record_id=RecordID(record.id))
