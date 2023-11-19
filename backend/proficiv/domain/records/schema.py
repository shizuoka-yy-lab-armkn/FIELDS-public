from datetime import datetime
from typing import Literal

from pydantic import Field, HttpUrl, RootModel

from prisma import models
from proficiv.base.schema import CamelizedPydanticModel
from proficiv.config import Config
from proficiv.entity import RecordID, SubjectID


class Record(CamelizedPydanticModel):
    record_id: RecordID
    subject_id: SubjectID
    forehead_video_fps: float
    forehead_video_url: HttpUrl
    started_at: datetime
    finished_at: datetime
    seq: int = Field(description="このユーザの中で何回目の収録か")

    @staticmethod
    def from_db_entity(r: models.Record, cfg: Config) -> "Record":
        return Record(
            record_id=RecordID(r.id),
            subject_id=SubjectID(r.subject_id),
            forehead_video_fps=r.forehead_camera_fps,
            forehead_video_url=HttpUrl(
                cfg.static_base_url + r.forehead_camera_public_video_path
            ),
            started_at=r.recording_started_at,
            finished_at=r.recording_finished_at,
            seq=r.seq,
        )


class ValidOrderSegment(CamelizedPydanticModel):
    type: Literal["valid"] = "valid"
    action_seq: int
    begin: int
    end: int


class WrongOrderSegment(CamelizedPydanticModel):
    type: Literal["wrong"] = "wrong"
    action_seq: int
    begin: int
    end: int


class MissingSegment(CamelizedPydanticModel):
    type: Literal["missing"] = "missing"
    action_seq: int


class Segment(RootModel):
    root: ValidOrderSegment | WrongOrderSegment | MissingSegment = Field(
        discriminator="type"
    )


class RecordEvaluation(CamelizedPydanticModel):
    segs: list[Segment]
    job_progress_percentage: int
