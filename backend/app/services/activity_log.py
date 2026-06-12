from app.utils.datetime_utils import today_parts


class ActivityLogRepository:
    def __init__(self, store) -> None:
        self.store = store

    async def add(self, action: str, request_number: str = "", changed_by: str = "", previous_status: str = "", new_status: str = "", note: str = "") -> None:
        date, time = today_parts()
        rows = self.store.read("activity_log", [])
        rows.append(
            {
                "date": date,
                "time": time,
                "action": action,
                "request_number": request_number,
                "changed_by": changed_by,
                "previous_status": previous_status,
                "new_status": new_status,
                "note": note,
            }
        )
        self.store.write("activity_log", rows)
