from fastapi import APIRouter

from proficiv.config import cfg
from proficiv.domain.records import usecase
from proficiv.domain.records.schema import IRecord

router = APIRouter(
    prefix="/records",
    tags=["records"],
)


@router.get("")
def list_records() -> list[IRecord]:
    return usecase.list_records(cfg)
