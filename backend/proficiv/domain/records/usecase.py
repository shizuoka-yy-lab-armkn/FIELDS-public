from datetime import datetime
from pathlib import Path

from proficiv.config import Config


def _resolve_forehead_camera_resource_path(
    static_root: Path,
    username: str,
    seq: int,
    record_at: datetime,
    suffix: str,
) -> Path:
    return (
        static_root
        / "records"
        / "forehead_camera"
        / record_at.strftime("%Y_%m%d")
        / username
        / f"{username}_{seq:03}_{record_at.strftime('%Y%m%d_%H%M%S')}{suffix}"
    )


def resolve_forehead_camera_video_path(
    cfg: Config, username: str, seq: int, record_at: datetime
) -> Path:
    return _resolve_forehead_camera_resource_path(
        cfg.public_static_dir, username, seq, record_at, ".mp4"
    )


def resolve_forehead_camera_prelude_wav_path(
    cfg: Config, username: str, seq: int, record_at: datetime
) -> Path:
    return _resolve_forehead_camera_resource_path(
        cfg.private_static_dir, username, seq, record_at, "_prelude.mp4"
    )


def resolve_forehead_camera_blip2_npy(
    cfg: Config, username: str, seq: int, record_at: datetime
) -> Path:
    return _resolve_forehead_camera_resource_path(
        cfg.private_static_dir, username, seq, record_at, "_blip2.npy"
    )
