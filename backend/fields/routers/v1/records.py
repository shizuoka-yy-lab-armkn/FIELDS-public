from typing import assert_never

from fastapi import APIRouter, HTTPException

from fields import kvs
from fields.db import prisma_client
from fields.depes import ConfigDep, RedisDep
from fields.domain.records.schema import (
    MissingSegment,
    Record,
    RecordEvaluation,
    Segment,
    ValidOrderSegment,
    WrongOrderSegment,
)
from fields.domain.records.usecase import mark_wrong_order_by_greedy, merge_missings
from fields.entity import ActionID, RecordID
from fields.utils.logging import get_colored_logger

router = APIRouter(
    prefix="/records",
    tags=["records"],
)

_log = get_colored_logger(__name__)


@router.get("")
async def get_record_list(cfg: ConfigDep) -> list[Record]:
    records = await prisma_client.record.find_many(
        order={"id": "desc"},
        include={"user": True},
    )
    res = [Record.from_db_entity(r, cfg) for r in records]
    return res


@router.get("/{record_id}")
async def get_record(record_id: RecordID, cfg: ConfigDep) -> Record:
    record = await prisma_client.record.find_unique(
        {"id": record_id}, include={"user": True}
    )
    if record is None:
        raise HTTPException(404)

    assert record.user is not None

    # if record is None or record.user_id != record.user.id:
    #     raise HTTPException(404)

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
        where={"subject_id": record.subject_id}, order={"ord_serial": "asc"}
    )

    aid2a = {a.id: a for a in master_actions}

    recog_seq = [aid2a[s.action_id].ord_serial for s in recog_segs]
    correct_first_proc = master_actions[0].ord_serial
    correct_last_proc = master_actions[-1].ord_serial

    wrong_order_marks = mark_wrong_order_by_greedy(
        recog_seq, correct_first_proc, correct_last_proc
    )

    matchings = merge_missings(
        recog_seq,
        wrong_order_marks,
        correct_first_proc,
        correct_last_proc,
    )

    eval_segs: list[Segment] = []
    for m in matchings:
        recog = recog_segs[m.src_idx]
        if m.type == "ok":
            seg = ValidOrderSegment(
                action_id=ActionID(recog.action_id),
                display_no=aid2a[recog.action_id].display_no,
                begin=recog.begin_frame,
                end=recog.end_frame,
                likelihood=recog.tas_likelihood,
            )
        elif m.type == "wrong":
            seg = WrongOrderSegment(
                action_id=ActionID(recog.action_id),
                display_no=aid2a[recog.action_id].display_no,
                begin=recog.begin_frame,
                end=recog.end_frame,
                likelihood=recog.tas_likelihood,
            )
        elif m.type == "missing":
            seg = MissingSegment(
                action_id=ActionID(recog.action_id),
                display_no=aid2a[recog.action_id].display_no,
            )
        else:
            assert_never(m.type)

        eval_segs.append(Segment(root=seg))

    return RecordEvaluation(
        segs=eval_segs,
        job_progress_percentage=100,
    )
