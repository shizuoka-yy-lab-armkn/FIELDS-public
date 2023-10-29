from pydantic import BaseModel, Field

from proficiv.entity import ActionID, SubjectID


class IActionMeta(BaseModel):
    short_name: str
    long_name: str


class ISubjectDetail(BaseModel):
    id: SubjectID
    name: str
    actions: dict[ActionID, IActionMeta]


class IExemplarAction(BaseModel):
    action_id: ActionID
    nframes_mean: int = Field(description="熟練者の記録から算出した、本アクションのフレーム数の平均値")
    nframes_std: int = Field(description="熟練者の記録から算出した、本アクションのフレーム数の標準偏差")
