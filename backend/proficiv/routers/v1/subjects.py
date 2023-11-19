from fastapi import APIRouter, HTTPException

from proficiv.db import prisma_client
from proficiv.domain.subjects.schema import ActionMeta, Subject, SubjectBrief
from proficiv.entity import SubjectID

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"],
)


@router.get("")
async def get_subject_list() -> list[SubjectBrief]:
    subjs = await prisma_client.subject.find_many()
    return [SubjectBrief(id=SubjectID(s.id), name=s.name) for s in subjs]


@router.get("/{subject_id}")
async def get_subject(subject_id: SubjectID) -> Subject:
    subj = await prisma_client.subject.find_unique(
        where={"id": subject_id},
        include={"actions": True},
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
            master_dur_min=a.master_dur_min,
            master_dur_max=a.master_dur_max,
            master_dur_median=a.master_dur_median,
        )
        for a in subj.actions
    ]

    return Subject(id=SubjectID(subj.id), name=subj.name, actions=actions)
