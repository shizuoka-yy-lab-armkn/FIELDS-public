from fields.domain.records.usecase import SegmentMatchType, mark_wrong_order_by_greedy


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
