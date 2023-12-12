import os
import signal
import time

from fields.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


def kill_ffmpeg_process_later(pid: int, delay: float) -> None:
    """ストリームの受信には遅延があるので `delay` 秒遅らせてからkillする"""
    _log.info(f"sleep some seconds for killing ffmpeg proc... ({pid=})")
    time.sleep(delay)
    _log.info(f"killing {pid=}")
    if pid > 0:
        os.kill(pid, signal.SIGTERM)
        os.waitpid(pid, 0)  # waitpid しないとゾンビプロセスになるので注意
