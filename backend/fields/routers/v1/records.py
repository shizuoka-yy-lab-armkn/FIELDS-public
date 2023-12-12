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
from fields.domain.records.usecase import compare_action_seq_by_lcs
from fields.entity import RecordID
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
        where={"subject_id": record.subject_id}, order={"seq": "asc"}
    )

    aid2a = {a.id: a for a in master_actions}

    recog_action_seqs = [aid2a[s.action_id].seq for s in recog_segs]
    master_action_seqs = [m.seq for m in master_actions]
    # NOTE: 工程19, 18 は模範の順番が逆転している
    p18 = master_action_seqs.index(18)
    p19 = master_action_seqs.index(19)
    master_action_seqs[p18], master_action_seqs[p19] = (
        master_action_seqs[p19],
        master_action_seqs[p18],
    )
    _log.info(f"\n{recog_action_seqs=}")
    _log.info(f"\n{master_action_seqs=}")

    matchings = compare_action_seq_by_lcs(src=recog_action_seqs, tgt=master_action_seqs)
    _log.info(f"\n{matchings=}")

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
