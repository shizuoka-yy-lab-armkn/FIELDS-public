import csv
import tomllib
from pathlib import Path

from pydantic import HttpUrl

from proficiv.config import Config
from proficiv.entity import ActionID, RecordID, SubjectID

from .schema import IEvaluation, IRecord, ISegment, IValidSegment


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


def get_evaluation(cfg: Config, record_id: RecordID) -> IEvaluation:
    with open(cfg.fake_db_dir / "records" / "records.toml", "rb") as f:
        db = tomllib.load(f)

    record_info = db["records"][record_id - 1]
    path = str(record_info["path"])
    fps = float(record_info["fps"])

    segs: list[ISegment] = []

    with open(cfg.fake_db_dir / "records" / path / "recog.tsv") as f:
        for row in csv.reader(f, delimiter="\t"):
            begin_sec, end_sec, aid = row
            aid = ActionID(int(aid))
            begin_sec = float(begin_sec)
            end_sec = float(end_sec)

            seg = IValidSegment(
                action_id=aid, begin=int(begin_sec * fps), end=int(end_sec * fps)
            )
            segs.append(ISegment(root=seg))

    return IEvaluation(segs=segs)
