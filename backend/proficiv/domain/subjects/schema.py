from pydantic import BaseModel, Field

from proficiv.entity import ActionID, SubjectID


class IActionMeta(BaseModel):
    short_name: str
    long_name: str


class IExemplarAction(BaseModel):
    """熟練者をお手本とした各アクションの詳細"""

    action_id: ActionID
    dur_mean: float = Field(description="平均値 (sec)")
    dur_std: float = Field(description="標準偏差 (sec)")
    dur_min: float = Field(description="最小値 (sec)")
    dur_max: float = Field(description="最大値 (sec)")
    dur_median: float = Field(description="中央値 (sec)")


class ISubjectDetail(BaseModel):
    id: SubjectID
    name: str
    actions: dict[ActionID, IActionMeta]
    exemplar: list[IExemplarAction]
