import os
import signal
import time

from fields.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


def kill_ffmpeg_process_later(pid: int) -> None:
    """ストリームの受信には遅延があるので数秒遅らせてからkillする"""
    _log.info(f"sleep some seconds for killing ffmpeg proc... ({pid=})")
    time.sleep(15)
    _log.info(f"killing {pid=}")
    if pid > 0:
        os.kill(pid, signal.SIGKILL)
