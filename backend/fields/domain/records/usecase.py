from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import Generic, Literal, NamedTuple, Sequence, TypeVar

import numpy as np

from fields.config import Config
from fields.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


def _resolve_resource_path(
    static_root: Path,
    resource_type: Literal["forehead_camera", "tas"],
    username: str,
    seq: int,
    record_at: datetime,
    suffix: str,
) -> Path:
    return (
        static_root
        / "records"
        / resource_type
        / record_at.strftime("%Y_%m%d")
        / username
        / f"{username}_{seq:03}_{record_at.strftime('%Y%m%d_%H%M%S')}{suffix}"
    )


def resolve_forehead_camera_video_path(
    cfg: Config, username: str, seq: int, record_at: datetime
) -> Path:
    return _resolve_resource_path(
        cfg.public_static_dir, "forehead_camera", username, seq, record_at, ".mp4"
    )


def resolve_forehead_camera_prelude_wav_path(
    cfg: Config, username: str, seq: int, record_at: datetime
) -> Path:
    return _resolve_resource_path(
        cfg.private_static_dir,
        "forehead_camera",
        username,
        seq,
        record_at,
        "_prelude.mp4",
    )


def resolve_forehead_camera_blip2_npy_path(
    cfg: Config, username: str, seq: int, record_at: datetime
) -> Path:
    return _resolve_resource_path(
        cfg.private_static_dir,
        "forehead_camera",
        username,
        seq,
        record_at,
        "_blip2.npy",
    )


def resolve_tas_likelihood_npy_path(
    cfg: Config, username: str, seq: int, record_at: datetime
) -> Path:
    return _resolve_resource_path(
        cfg.private_static_dir, "tas", username, seq, record_at, "_likelihood.npy"
    )


SegmentMatchType = Literal["ok", "missing", "wrong"]

_T = TypeVar("_T")


class SegmentMatching(NamedTuple, Generic[_T]):
    type: SegmentMatchType
    action: _T
    src_idx: int


def compare_action_seq_by_lcs(
    src: Sequence[_T], tgt: Sequence[_T]
) -> list[SegmentMatching[_T]]:
    """
    LCS (最長共通部分列) のアルゴリズムを利用する
    src: 比較元の工程番号リスト
    tgt: 目標 (模範) の工程番号リスト

    Helpful visualizer: https://observablehq.com/@stwind/minimum-edit-distance
    """
    h = len(src)
    w = len(tgt)
    dp = np.zeros([h + 1, w + 1], np.int32)

    for i, src_i in enumerate(src, start=1):
        for j, tgt_j in enumerate(tgt, start=1):
            if src_i == tgt_j:
                dp[i, j] = dp[i - 1, j - 1] + 1
            else:
                dp[i, j] = max(dp[i - 1, j], dp[i, j - 1])

    i, j = h, w
    matchings: list[SegmentMatching] = []

    while (i, j) != (0, 0):
        if i > 0 and j > 0 and src[i - 1] == tgt[j - 1]:
            i -= 1
            j -= 1
            matchings.append(SegmentMatching("ok", action=src[i], src_idx=i))
            continue

        if j > 0 and dp[i, j - 1] == dp[i, j]:
            j -= 1
            continue

        if i > 0 and dp[i - 1, j] == dp[i, j]:
            i -= 1
            matchings.append(SegmentMatching("wrong", action=src[i], src_idx=i))
            continue

        raise ValueError("Unreachable!")

    matchings.reverse()

    missing_actions = sorted(set(tgt) - set(src))  # type: ignore
    _log.info(f"{missing_actions=}")

    for x in missing_actions:
        insert_at = 0
        for i, m in enumerate(matchings):
            if m.type == "matched" or m.type == "missing":
                if m.action > x:
                    break
                insert_at = i + 1
        matchings.insert(insert_at, SegmentMatching("missing", action=x, src_idx=-1))

    return matchings


def mark_wrong_order_by_greedy(
    procs: Sequence[int],
    correct_first_proc: int,
    correct_last_proc: int,
) -> list[SegmentMatchType]:
    """貪欲法 (greedy) により工程順序間違いのマーキングをする。
    戻り値の list の長さは len(src) に等しい。
    """
    pos: dict[int, list[int]] = defaultdict(list)

    for i, proc in reversed(list(enumerate(procs))):
        pos[proc].append(i)

    res: list[SegmentMatchType] = ["wrong" for _ in procs]

    i = 0
    next_proc = correct_first_proc

    while next_proc <= correct_last_proc:
        stack = pos[next_proc]
        while len(stack) and stack[-1] < i:
            stack.pop()

        if len(stack) == 0:
            next_proc += 1
            continue

        i = stack.pop()
        res[i] = "ok"
        next_proc += 1

    return res


def merge_missings(
    procs: Sequence[int],
    marks: Sequence[SegmentMatchType],
    correct_first_proc: int,
    correct_last_proc: int,
) -> list[SegmentMatching]:
    """工程順間違いのマーキング結果に工程抜けの情報をマージした結果を生成する"""
    all_collect_procs = set(range(correct_first_proc, correct_last_proc + 1))
    missings = sorted(all_collect_procs - set(procs))

    res: list[SegmentMatching] = []
    i, j = 0, 0

    while i < len(procs) and j < len(missings):
        # 順序間違いの工程の直後には "missing" を挿入しないようにする
        # 例: 認識結果が [1, 4, 2, 3, 6] の場合、5 は 4 の直後ではなく 3 の直後に入れる
        if procs[i] < missings[j] or marks[i] == "wrong":
            res.append(SegmentMatching(marks[i], procs[i], i))
            i += 1
        else:
            res.append(SegmentMatching("missing", missings[j], -1))
            j += 1

    while i < len(procs):
        res.append(SegmentMatching(marks[i], procs[i], i))
        i += 1

    while j < len(missings):
        res.append(SegmentMatching("missing", missings[j], -1))
        j += 1

    return res
