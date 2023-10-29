from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_404_NOT_FOUND

from proficiv.config import cfg
from proficiv.domain.subjects import usecase
from proficiv.domain.subjects.schema import ISubjectDetail
from proficiv.entity import SubjectID

router = APIRouter(
    prefix="/subjects",
    tags=["subjects"],
)


@router.get("/{subject_id}")
async def get_subject(subject_id: SubjectID) -> ISubjectDetail:
    subj = usecase.get_subject_or_none(cfg, subject_id)
    if subj is None:
        raise HTTPException(HTTP_404_NOT_FOUND)

    return subj
