from abc import ABCMeta, abstractmethod
from typing import Any


class Comparable(metaclass=ABCMeta):
    @abstractmethod
    def __lt__(
        self,
        other: Any,  # noqa: ANN401 Dynamically typed expressions (typing.Any) are disallowed
    ) -> bool:
        ...
