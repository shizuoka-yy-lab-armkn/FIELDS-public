from fastapi import APIRouter

from proficiv.domain.subjects.schema import Subject
from proficiv.entity import SubjectID

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"],
)


@router.get("/{subject_id}")
async def get_subject(subject_id: SubjectID) -> Subject:
    del subject_id
    raise NotImplementedError()
