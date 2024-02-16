from pydantic import Field, HttpUrl

from fields.base.schema import CamelizedPydanticModel
from fields.config import get_config
from fields.entity import ActionID, ExemplarVideoID, SubjectID
from prisma import models


class ActionMeta(CamelizedPydanticModel):
    id: ActionID
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


class ExemplarVideoSegment(CamelizedPydanticModel):
    opstep_id: str
    begin_sec: float
    end_sec: float


class ExemplarVideo(CamelizedPydanticModel):
    id: ExemplarVideoID
    slug: str
    subject: SubjectBrief
    video_url: HttpUrl
    fps: float
    segs: list[ExemplarVideoSegment]

    @staticmethod
    def from_prisma_model(v: models.ExemplarVideo) -> "ExemplarVideo":
        assert v.subject is not None

        if v.segments is None:
            segs = []
        else:
            segs = [
                ExemplarVideoSegment(
                    opstep_id=s.opstep_id,
                    begin_sec=s.begin_sec,
                    end_sec=s.end_sec,
                )
                for s in v.segments
            ]

        cfg = get_config()

        return ExemplarVideo(
            id=ExemplarVideoID(v.id),
            slug=v.slug,
            subject=SubjectBrief(
                id=SubjectID(v.subject.id), slug=v.subject.slug, name=v.subject.name
            ),
            video_url=HttpUrl(
                f"{cfg.static_base_url}/subjects/{v.subject.slug}/{v.slug}.mp4"
            ),
            fps=v.fps,
            segs=segs,
        )
