from datetime import datetime
from typing import Literal

from pydantic import Field, RootModel

from proficiv.base.schema import CamelizedPydanticModel
from proficiv.entity import RecordID, SubjectID


class RecordingAvailable(CamelizedPydanticModel):
    type: Literal["available"] = "available"
    available: Literal[True] = True


class NowRecording(CamelizedPydanticModel):
    type: Literal["recording"] = "recording"
    available: Literal[False] = False
    username: str = Field(description="収録中のユーザのusername")
    start_at: datetime


class RecordingAvailability(RootModel):
    root: RecordingAvailable | NowRecording = Field(discriminator="type")


class StartRecordingReq(CamelizedPydanticModel):
    subject_id: SubjectID


class FinishRecordingResp(CamelizedPydanticModel):
    record_id: RecordID
