from fastapi import APIRouter, HTTPException

from proficiv.db import prisma_client
from proficiv.depes import ConfigDep, UserDep
from proficiv.domain.records.schema import Record, RecordEvaluation
from proficiv.entity import RecordID

router = APIRouter(
    prefix="/records",
    tags=["records"],
)


@router.get("")
async def get_record_list(user: UserDep, cfg: ConfigDep) -> list[Record]:
    records = await prisma_client.record.find_many(
        where={"user_id": user.user_id}, order={"id": "desc"}
    )
    res = [Record.from_db_entity(r, cfg) for r in records]
    return res


@router.get("/{record_id}")
async def get_record(record_id: RecordID, user: UserDep, cfg: ConfigDep) -> Record:
    record = await prisma_client.record.find_unique({"id": record_id})

    if record is None or record.user_id != user.user_id:
        raise HTTPException(404)

    return Record.from_db_entity(record, cfg)


@router.get("/{record_id}/evaluation")
async def get_evaluation(record_id: RecordID) -> RecordEvaluation:
    del record_id
    raise NotImplementedError()
