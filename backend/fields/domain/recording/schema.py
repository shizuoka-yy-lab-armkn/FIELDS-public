from datetime import datetime
from pathlib import Path
from typing import Literal

from pydantic import Field, RootModel

from fields.base.schema import CamelizedPydanticModel
from fields.entity import RecordID, SubjectID


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
    subject_slug: SubjectID
    username: str


class FinishRecordingResp(CamelizedPydanticModel):
    record_id: RecordID


class PostRecordingFromLocalVideoReq(CamelizedPydanticModel):
    subject_slug: SubjectID
    username: str
    local_video_abs_path: Path
