from pydantic import Field

from proficiv.base.schema import CamelizedPydanticModel
from proficiv.entity import ActionID, SubjectID


class ActionMeta(CamelizedPydanticModel):
    action_id: ActionID
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
