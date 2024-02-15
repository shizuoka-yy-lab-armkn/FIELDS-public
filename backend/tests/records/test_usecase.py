from typing import Sequence

from fields.domain.records.usecase import (
    SegmentMatching,
    SegmentMatchType,
    mark_wrong_order_by_greedy,
    merge_missings,
)


def test_mark_wrong_order_by_greedy() -> None:
    def check(
        src: list[int],
        correct_first_proc: int,
        correct_last_proc: int,
        expected: list[SegmentMatchType],
    ) -> None:
        assert (
            mark_wrong_order_by_greedy(
                src,
                correct_first_proc,
                correct_last_proc,
            )
            == expected
        )

    check(
        [1],
        1,
        1,
        ["ok"],
    )
    check(
        [3, 4, 5, 3],
        3,
        5,
        ["ok", "ok", "ok", "wrong"],
    )
    check(
        [3, 7],
        3,
        7,
        ["ok", "ok"],
    )
    check(
        [5, 7, 8, 6, 9, 10, 12, 11],
        5,
        12,
        [
            "ok",  # 5
            "wrong",  # 7
            "wrong",  # 8
            "ok",  # 6
            "ok",  # 9
            "ok",  # 10
            "wrong",  # 12
            "ok",  # 11
        ],
    )


def test_merge_missings() -> None:
    def check(
        procs: Sequence[int],
        marks: Sequence[SegmentMatchType],
        correct_first_proc: int,
        correct_last_proc: int,
        expected: list[SegmentMatching],
    ) -> None:
        assert (
            merge_missings(
                procs,
                marks,
                correct_first_proc,
                correct_last_proc,
            )
            == expected
        )

    check(
        [1],
        ["ok"],
        correct_first_proc=1,
        correct_last_proc=1,
        expected=[SegmentMatching("ok", 1, 0)],
    )
    check(
        [3, 4],
        ["ok", "wrong"],
        correct_first_proc=2,
        correct_last_proc=5,
        expected=[
            SegmentMatching("missing", 2, -1),
            SegmentMatching("ok", 3, 0),
            SegmentMatching("wrong", 4, 1),
            SegmentMatching("missing", 5, -1),
        ],
    )
    # 5:工程抜け、4:工程順序間違い(2より先にやってしまた)
    # のときに 5 が 4 の直後ではなく 3 の後に来ること
    check(
        [1, 4, 2, 3, 6],
        ["ok", "wrong", "ok", "ok", "ok"],
        correct_first_proc=1,
        correct_last_proc=6,
        expected=[
            SegmentMatching("ok", 1, 0),
            SegmentMatching("wrong", 4, 1),
            SegmentMatching("ok", 2, 2),
            SegmentMatching("ok", 3, 3),
            SegmentMatching("missing", 5, -1),
            SegmentMatching("ok", 6, 4),
        ],
    )
