import logging
import sys
from typing import IO

from proficiv.utils.color import BOLD_BRIGHT_RED, CYAN, GREY, RED, RESET, YELLOW


class ColoredLogFormatter(logging.Formatter):
    DEFAULT_FMT = "%(asctime)s [%(levelname)s] %(message)s  (%(name)s:%(lineno)d)"
    DEFAULT_DATE_FMT = "%Y%m%d-%H:%M:%S"

    COLORS = {
        logging.DEBUG: GREY,
        logging.INFO: CYAN,
        logging.WARNING: YELLOW,
        logging.ERROR: RED,
        logging.CRITICAL: BOLD_BRIGHT_RED,
    }

    def __init__(self, fmt: str | None = None, datefmt: str | None = None) -> None:
        super().__init__(fmt or self.DEFAULT_FMT, datefmt or self.DEFAULT_DATE_FMT)

    def format(self, record: logging.LogRecord) -> str:
        s = super().format(record)
        return self.COLORS[record.levelno] + s + RESET


def create_colored_handler(
    stream: IO = sys.stderr,
    *,
    fmt: str | None = None,
    datefmt: str | None = None,
) -> logging.Handler:
    h = logging.StreamHandler(stream)
    h.setFormatter(ColoredLogFormatter(fmt=fmt, datefmt=datefmt))
    return h


def get_colored_logger(name: str, level: int = logging.INFO) -> logging.Logger:
    lg = logging.getLogger(name)
    lg.setLevel(level)
    lg.addHandler(create_colored_handler())
    return lg
