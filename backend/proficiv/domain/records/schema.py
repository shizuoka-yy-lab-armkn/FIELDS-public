from datetime import datetime
from typing import Literal

from pydantic import Field, HttpUrl, RootModel

from proficiv.base.schema import CamelizedPydanticModel
from proficiv.entity import ActionID, RecordID, SubjectID


class Record(CamelizedPydanticModel):
    record_id: RecordID
    subject_id: SubjectID
    fps: float = Field(
        description="Frames per second; 一秒間あたりのサンプリングレート",
    )
    head_camera_video_url: HttpUrl
    record_at: datetime
    seq: int = Field(description="何回目の収録か")


class ValidSegment(CamelizedPydanticModel):
    type: Literal["valid"] = "valid"
    action_id: ActionID
    begin: int
    end: int


class ExtraSegment(CamelizedPydanticModel):
    type: Literal["extra"] = "extra"
    action_id: ActionID
    begin: int
    end: int


class MissingSegment(CamelizedPydanticModel):
    type: Literal["missing"] = "missing"
    action_id: ActionID


class WrongSegment(CamelizedPydanticModel):
    type: Literal["wrong"] = "wrong"
    action_id: ActionID = Field(description="認識されたアクション")
    expected_action_id: ActionID = Field(description="期待されたアクション")
    begin: int
    end: int


class Segment(RootModel):
    root: ValidSegment | ExtraSegment | MissingSegment | WrongSegment = Field(
        discriminator="type"
    )


class RecordEvaluation(CamelizedPydanticModel):
    segs: list[Segment]
