from typing import Literal

from pydantic import Field, HttpUrl, RootModel

from proficiv.base.schema import CamelizedPydanticModel
from proficiv.entity import ActionID, RecordID, SubjectID


class IRecord(CamelizedPydanticModel):
    record_id: RecordID
    subject_id: SubjectID
    fps: float = Field(description="Frames per second; 一秒間あたりのサンプリングレート")
    head_camera_video_url: HttpUrl


class IValidSegment(CamelizedPydanticModel):
    type: Literal["valid"] = "valid"
    action_id: ActionID
    begin: int
    end: int


class IExtraSegment(CamelizedPydanticModel):
    type: Literal["extra"] = "extra"
    action_id: ActionID
    begin: int
    end: int


class IMissingSegment(CamelizedPydanticModel):
    type: Literal["missing"] = "missing"
    action_id: ActionID


class IWrongSegment(CamelizedPydanticModel):
    type: Literal["wrong"] = "wrong"
    recog_action_id: ActionID = Field(description="認識されたアクション")
    expected_action_id: ActionID = Field(description="期待されたアクション")
    begin: int
    end: int


class ISegment(RootModel):
    root: IValidSegment | IExtraSegment | IMissingSegment | IWrongSegment = Field(
        discriminator="type"
    )


class IEvaluation(CamelizedPydanticModel):
    segs: list[ISegment]
