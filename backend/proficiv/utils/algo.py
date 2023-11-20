from typing import Generator, Generic, NamedTuple, Sequence, TypeVar

_T = TypeVar("_T")


class RunlengthBlock(NamedTuple, Generic[_T]):
    val: _T
    begin: int
    len: int


def runlength(xs: Sequence[_T]) -> Generator[RunlengthBlock[_T], None, None]:
    if len(xs) == 0:
        return

    last, begin = xs[0], 0
    for i, x in enumerate(xs):
        if x != last:
            yield RunlengthBlock(val=last, begin=begin, len=i - begin)
            last, begin = x, i

    yield RunlengthBlock(val=last, begin=begin, len=len(xs) - begin)
