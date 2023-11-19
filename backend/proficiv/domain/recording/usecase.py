import os
import time
from signal import signal

from proficiv.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


def kill_ffmpeg_process_later(pid: int) -> None:
    """ストリームの受信には遅延があるので数秒遅らせてからkillする"""
    _log.info(f"sleep some seconds for killing ffmpeg proc... ({pid=})")
    time.sleep(10)
    _log.info(f"killing {pid=}")
    if pid > 0:
        os.kill(pid, signal.SIGKILL)
