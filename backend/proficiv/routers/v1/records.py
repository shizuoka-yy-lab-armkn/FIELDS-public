from fastapi import APIRouter

from proficiv.config import cfg
from proficiv.domain.records import usecase
from proficiv.domain.records.schema import IEvaluation, IRecord
from proficiv.entity import RecordID

router = APIRouter(
    prefix="/records",
    tags=["records"],
)


@router.get("")
def list_records() -> list[IRecord]:
    return usecase.list_records(cfg)


@router.get("/{record_id}/evaluation")
def get_evaluation(record_id: RecordID) -> IEvaluation:
    return usecase.get_evaluation(cfg, record_id)
