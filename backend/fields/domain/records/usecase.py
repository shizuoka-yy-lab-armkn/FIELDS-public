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


SegmentMatchType = Literal["matched", "missing", "wrong"]

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
            matchings.append(SegmentMatching("matched", action=src[i], src_idx=i))
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
