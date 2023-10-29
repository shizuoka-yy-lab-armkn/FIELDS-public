import tomllib
from pathlib import Path

from pydantic import HttpUrl

from proficiv.config import Config
from proficiv.entity import RecordID, SubjectID

from .schema import IRecord


def list_records(cfg: Config) -> list[IRecord]:
    with open(cfg.fake_db_dir / "records" / "records.toml", "rb") as f:
        db = tomllib.load(f)

    records: list[IRecord] = []
    for i, record_info in enumerate(db["records"]):
        subject_id = SubjectID(int(record_info["subject_id"]))
        fps = float(record_info["fps"])
        path = str(record_info["path"])

        url_path = Path("/records") / path / "head_camera" / "synced_untrimmed.mp4"
        rec = IRecord(
            record_id=RecordID(i + 1),
            subject_id=subject_id,
            fps=fps,
            head_camera_video_url=HttpUrl(cfg.static_base_url + str(url_path)),
        )
        records.append(rec)

    return records
