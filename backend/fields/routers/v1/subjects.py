from fastapi import APIRouter, HTTPException

from fields.db import prisma_client
from fields.domain.subjects.schema import ActionMeta, Subject, SubjectBrief
from fields.entity import SubjectID

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"],
)


@router.get("")
async def get_subject_list() -> list[SubjectBrief]:
    subjs = await prisma_client.subject.find_many()
    return [SubjectBrief(id=SubjectID(s.id), slug=s.slug, name=s.name) for s in subjs]


@router.get("/{subject_id}")
async def get_subject(subject_id: SubjectID) -> Subject:
    subj = await prisma_client.subject.find_unique(
        where={"id": subject_id},
        include={
            "actions": {"order_by": {"seq": "asc"}},
        },
    )

    if subj is None:
        raise HTTPException(404)

    assert subj.actions is not None
    actions = [
        ActionMeta(
            seq=a.seq,
            short_name=a.short_name,
            long_name=a.long_name,
            manual_markdown="",
            master_dur_mean=a.master_dur_mean,
            master_dur_std=a.master_dur_std,
        )
        for a in subj.actions
    ]

    return Subject(
        id=SubjectID(subj.id), slug=subj.slug, name=subj.name, actions=actions
    )
