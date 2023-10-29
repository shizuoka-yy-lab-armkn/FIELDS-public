from fastapi import APIRouter

from proficiv.domain.records.schema import IRecord

router = APIRouter(
    prefix="/records",
    tags=["records"],
)


@router.get("/")
def list_records() -> list[IRecord]:
    raise NotImplementedError()
