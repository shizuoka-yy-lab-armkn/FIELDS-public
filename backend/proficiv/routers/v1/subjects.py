from fastapi import APIRouter

from proficiv.domain.subjects.schema import ISubjectDetail
from proficiv.entity import SubjectID

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"],
)


@router.get("/{subject_id}")
async def get_subject(subject_id: SubjectID) -> ISubjectDetail:
    raise NotImplementedError()
