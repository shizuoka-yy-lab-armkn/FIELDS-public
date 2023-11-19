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
    record_at: datetime
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
            record_at=r.created_at,
            seq=r.user_wise_seq,
        )


class ValidSegment(CamelizedPydanticModel):
    type: Literal["valid"] = "valid"
    action_seq: int
    begin: int
    end: int


class ExtraSegment(CamelizedPydanticModel):
    type: Literal["extra"] = "extra"
    action_seq: int
    begin: int
    end: int


class MissingSegment(CamelizedPydanticModel):
    type: Literal["missing"] = "missing"
    action_seq: int


class WrongSegment(CamelizedPydanticModel):
    type: Literal["wrong"] = "wrong"
    action_seq: int = Field(description="認識されたアクション")
    expected_action_seq: int = Field(description="期待されたアクション")
    begin: int
    end: int


class Segment(RootModel):
    root: ValidSegment | ExtraSegment | MissingSegment | WrongSegment = Field(
        discriminator="type"
    )


class RecordEvaluation(CamelizedPydanticModel):
    segs: list[Segment]
