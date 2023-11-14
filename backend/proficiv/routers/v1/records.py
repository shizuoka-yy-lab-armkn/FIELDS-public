from fastapi import APIRouter

from proficiv.domain.records.schema import Record, RecordEvaluation
from proficiv.entity import RecordID

router = APIRouter(
    prefix="/records",
    tags=["records"],
)


@router.get("")
def get_record_list() -> list[Record]:
    raise NotImplementedError()


@router.get("/{record_id}")
def get_record(record_id: RecordID) -> Record:
    del record_id
    raise NotImplementedError()


@router.get("/{record_id}/evaluation")
def get_evaluation(record_id: RecordID) -> RecordEvaluation:
    del record_id
    raise NotImplementedError()
