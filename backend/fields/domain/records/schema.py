from datetime import datetime
from typing import Literal

from pydantic import Field, HttpUrl, RootModel

from fields.base.schema import CamelizedPydanticModel
from fields.config import Config
from fields.entity import ActionID, RecordID, SubjectID
from fields.utils.string import prepend_slash_if_not_exists
from prisma import models


class Record(CamelizedPydanticModel):
    record_id: RecordID
    subject_id: SubjectID
    username: str
    forehead_video_fps: float
    forehead_video_url: HttpUrl
    started_at: datetime
    finished_at: datetime
    daily_seq: int = Field(description="このユーザのこの日の中で何回目の収録か")

    @staticmethod
    def from_db_entity(r: models.Record, cfg: Config) -> "Record":
        forehead_video_path = prepend_slash_if_not_exists(
            r.forehead_camera_public_video_path
        )
        assert r.user is not None

        return Record(
            record_id=RecordID(r.id),
            subject_id=SubjectID(r.subject_id),
            username=r.user.username,
            forehead_video_fps=r.forehead_camera_fps,
            forehead_video_url=HttpUrl(cfg.static_base_url + forehead_video_path),
            started_at=r.recording_started_at,
            finished_at=r.recording_finished_at,
            daily_seq=r.daily_seq,
        )


class ValidOrderSegment(CamelizedPydanticModel):
    type: Literal["valid"] = "valid"
    action_id: ActionID
    display_no: int
    begin: int
    end: int
    likelihood: float


class WrongOrderSegment(CamelizedPydanticModel):
    type: Literal["wrong"] = "wrong"
    action_id: ActionID
    display_no: int
    begin: int
    end: int
    likelihood: float


class MissingSegment(CamelizedPydanticModel):
    type: Literal["missing"] = "missing"
    action_id: ActionID
    display_no: int


class Segment(RootModel):
    root: ValidOrderSegment | WrongOrderSegment | MissingSegment = Field(
        discriminator="type"
    )


class RecordEvaluation(CamelizedPydanticModel):
    segs: list[Segment]
    job_progress_percentage: int
