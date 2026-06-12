from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

try:
    APP_TIMEZONE = ZoneInfo("Asia/Colombo")
except ZoneInfoNotFoundError:
    APP_TIMEZONE = timezone(timedelta(hours=5, minutes=30))


def now_local() -> datetime:
    return datetime.now(APP_TIMEZONE)


def today_parts() -> tuple[str, str]:
    now = now_local()
    return now.strftime("%Y-%m-%d"), now.strftime("%H:%M:%S")


def iso_now() -> str:
    return now_local().isoformat()
