from pydantic import Field

from fields.base.schema import CamelizedPydanticModel
from fields.entity import SubjectID


class ActionMeta(CamelizedPydanticModel):
    ord_serial: int
    display_no: int
    short_name: str
    long_name: str
    manual_markdown: str
    master_dur_mean: float = Field(description="平均値 (sec)")
    master_dur_std: float = Field(description="標準偏差 (sec)")


class Subject(CamelizedPydanticModel):
    id: SubjectID
    slug: str
    name: str
    actions: list[ActionMeta]


class SubjectBrief(CamelizedPydanticModel):
    id: SubjectID
    slug: str
    name: str
