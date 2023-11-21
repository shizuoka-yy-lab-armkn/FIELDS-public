from typing import assert_never

from fastapi import APIRouter, HTTPException

from proficiv import kvs
from proficiv.db import prisma_client
from proficiv.depes import ConfigDep, RedisDep, UserDep
from proficiv.domain.records.schema import (
    MissingSegment,
    Record,
    RecordEvaluation,
    Segment,
    ValidOrderSegment,
    WrongOrderSegment,
)
from proficiv.domain.records.usecase import compare_action_seq_by_lcs
from proficiv.entity import RecordID
from proficiv.utils.logging import get_colored_logger

router = APIRouter(
    prefix="/records",
    tags=["records"],
)

_log = get_colored_logger(__name__)


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
async def get_record_evaluation(
    record_id: RecordID, redis: RedisDep
) -> RecordEvaluation:
    recog_segs = await prisma_client.recordsegment.find_many(
        where={"record_id": record_id}, order={"begin_frame": "asc"}
    )
    if len(recog_segs) == 0:
        progress = kvs.RecordEvalProgress.get_or_none(record_id, redis)
        if progress is None:
            _log.warn("Cannot find RecordEvalProgress in Redis")
        return RecordEvaluation(
            segs=[],
            job_progress_percentage=progress.percentage if progress is not None else 0,
        )

    record = await prisma_client.record.find_unique({"id": record_id})
    if record is None:
        raise HTTPException(404)

    master_actions = await prisma_client.action.find_many(
        where={"subject_id": record.subject_id}, order={"seq": "asc"}
    )

    aid2a = {a.id: a for a in master_actions}

    recog_action_seqs = [aid2a[s.action_id].seq for s in recog_segs]
    master_action_seqs = [m.seq for m in master_actions]
    matchings = compare_action_seq_by_lcs(src=recog_action_seqs, tgt=master_action_seqs)

    eval_segs: list[Segment] = []
    for m in matchings:
        recog = recog_segs[m.src_idx]
        if m.type == "matched":
            seg = ValidOrderSegment(
                action_seq=m.action, begin=recog.begin_frame, end=recog.end_frame
            )
        elif m.type == "wrong":
            seg = WrongOrderSegment(
                action_seq=m.action, begin=recog.begin_frame, end=recog.end_frame
            )
        elif m.type == "missing":
            seg = MissingSegment(action_seq=m.action)
        else:
            assert_never(m.type)

        eval_segs.append(Segment(root=seg))

    return RecordEvaluation(segs=eval_segs, job_progress_percentage=100)
