from typing import Literal

from pydantic import BaseModel, Field, HttpUrl, RootModel

from proficiv.entity import ActionID, RecordID, SubjectID


class IRecord(BaseModel):
    record_id: RecordID
    subject_id: SubjectID
    fps: float = Field(description="Frames per second; 一秒間あたりのサンプリングレート")
    head_camera_video_url: HttpUrl


class IValidSegment(BaseModel):
    type: Literal["valid"] = "valid"
    action_id: ActionID
    begin: int
    end: int


class IExtraSegment(BaseModel):
    type: Literal["extra"] = "extra"
    action_id: ActionID
    begin: int
    end: int


class IMissingSegment(BaseModel):
    type: Literal["missing"] = "missing"
    action_id: ActionID


class IWrongSegment(BaseModel):
    type: Literal["wrong"] = "wrong"
    recog_action_id: ActionID = Field(description="認識されたアクション")
    expected_action_id: ActionID = Field(description="期待されたアクション")
    begin: int
    end: int


class ISegment(RootModel):
    root: IValidSegment | IExtraSegment | IMissingSegment | IWrongSegment = Field(
        discriminator="type"
    )


class IEvaluation(BaseModel):
    segs: list[ISegment]
