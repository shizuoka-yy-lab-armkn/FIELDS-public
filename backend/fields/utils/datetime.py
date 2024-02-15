from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

JST = ZoneInfo("Asia/Tokyo")


def jst_now() -> datetime:
    return datetime.now(JST)


def calc_today(now: datetime) -> datetime:
    """h, m, s, microsecond を ゼロにした datetime を返す"""
    return now.replace(hour=0, minute=0, second=0, microsecond=0)


def calc_tomorrow(now: datetime) -> datetime:
    """h, m, s, microsecond を ゼロにして日付に 1 を加算した datetime を返す"""
    return now.replace(hour=0, minute=0, second=0, microsecond=0) + timedelta(days=1)
