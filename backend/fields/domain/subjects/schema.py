from pydantic import Field

from fields.base.schema import CamelizedPydanticModel
from fields.entity import SubjectID


class ActionMeta(CamelizedPydanticModel):
    seq: int
    short_name: str
    long_name: str
    manual_markdown: str
    master_dur_mean: float = Field(description="平均値 (sec)")
    master_dur_std: float = Field(description="標準偏差 (sec)")
    master_dur_min: float = Field(description="最小値 (sec)")
    master_dur_max: float = Field(description="最大値 (sec)")
    master_dur_median: float = Field(description="中央値 (sec)")


class Subject(CamelizedPydanticModel):
    id: SubjectID
    name: str
    actions: list[ActionMeta]


class SubjectBrief(CamelizedPydanticModel):
    id: SubjectID
    name: str
