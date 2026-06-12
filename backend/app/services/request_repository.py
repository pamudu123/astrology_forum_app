import uuid
from typing import Protocol

from app.config import get_settings
from app.schemas.admin import DashboardCounts, RequestDetail, RequestSummary
from app.utils.constants import ACTIVE_STATUSES, FormType, RequestStatus, Source
from app.utils.datetime_utils import iso_now, today_parts


class RequestRepository(Protocol):
    async def create(self, form_type: FormType, source: Source, submitted_by: str, request_number: str, payload: dict) -> RequestDetail: ...
    async def list(self, status: RequestStatus | None = None, form_type: FormType | None = None, source: Source | None = None) -> list[RequestSummary]: ...
    async def get(self, request_number: str) -> RequestDetail | None: ...
    async def update_status(self, request_number: str, status: RequestStatus, admin_note: str | None) -> RequestDetail: ...
    async def dashboard(self) -> DashboardCounts: ...


class LocalRequestRepository:
    def __init__(self, store) -> None:
        self.store = store

    def _load(self) -> list[dict]:
        return self.store.read("requests", [])

    def _save(self, rows: list[dict]) -> None:
        self.store.write("requests", rows)

    async def create(self, form_type: FormType, source: Source, submitted_by: str, request_number: str, payload: dict) -> RequestDetail:
        date, time = today_parts()
        row = {
            "internal_id": str(uuid.uuid4()),
            "request_number": request_number,
            "form_type": form_type,
            "submitted_date": date,
            "submitted_time": time,
            "source": source,
            "submitted_by": submitted_by,
            "status": RequestStatus.NEW,
            "admin_note": None,
            "last_updated": iso_now(),
            "data": payload,
        }
        rows = self._load()
        rows.append(row)
        self._save(rows)
        return RequestDetail(**row)

    async def list(self, status: RequestStatus | None = None, form_type: FormType | None = None, source: Source | None = None) -> list[RequestSummary]:
        rows = self._load()
        filtered = []
        for row in rows:
            if status and row["status"] != status:
                continue
            if form_type and row["form_type"] != form_type:
                continue
            if source and row["source"] != source:
                continue
            filtered.append(RequestSummary(**row))
        return list(reversed(filtered))

    async def get(self, request_number: str) -> RequestDetail | None:
        for row in self._load():
            if row["request_number"] == request_number:
                return RequestDetail(**row)
        return None

    async def update_status(self, request_number: str, status: RequestStatus, admin_note: str | None) -> RequestDetail:
        rows = self._load()
        for row in rows:
            if row["request_number"] == request_number:
                row["status"] = status
                row["admin_note"] = admin_note
                row["last_updated"] = iso_now()
                self._save(rows)
                return RequestDetail(**row)
        raise ValueError("Request not found.")

    async def dashboard(self) -> DashboardCounts:
        rows = self._load()
        summaries = [RequestSummary(**row) for row in rows]
        return DashboardCounts(
            total_requests=len(rows),
            new_requests=sum(row["status"] == RequestStatus.NEW for row in rows),
            on_hold_requests=sum(row["status"] == RequestStatus.ON_HOLD for row in rows),
            completed_requests=sum(row["status"] == RequestStatus.DONE for row in rows),
            cancelled_requests=sum(row["status"] == RequestStatus.CANCELLED for row in rows),
            hadahan_requests=sum(row["form_type"] == FormType.HADAHAN for row in rows),
            porondam_requests=sum(row["form_type"] == FormType.PORONDAM for row in rows),
            guest_submissions=sum(row["source"] == Source.GUEST for row in rows),
            registered_user_submissions=sum(row["source"] == Source.USER for row in rows),
            recent_requests=list(reversed(summaries[-5:])),
        )


class SheetsRequestRepository(LocalRequestRepository):
    def __init__(self, store, sheets_client) -> None:
        super().__init__(store)
        self.sheets_client = sheets_client

    async def create(self, form_type: FormType, source: Source, submitted_by: str, request_number: str, payload: dict) -> RequestDetail:
        detail = await super().create(form_type, source, submitted_by, request_number, payload)
        sheet = "Hadahan" if form_type == FormType.HADAHAN else "Porondam"
        self.sheets_client.append_row(sheet, self._to_sheet_row(detail))
        return detail

    async def update_status(self, request_number: str, status: RequestStatus, admin_note: str | None) -> RequestDetail:
        detail = await super().update_status(request_number, status, admin_note)
        self.sheets_client.append_row("ActivityLog", [iso_now(), "STATUS_UPDATED", request_number, status, admin_note or ""])
        return detail

    def _to_sheet_row(self, detail: RequestDetail) -> list:
        data = detail.data
        if detail.form_type == FormType.HADAHAN:
            return [
                detail.request_number, detail.submitted_date, detail.submitted_time, detail.source, detail.submitted_by,
                data.get("preferred_language"), data.get("full_name"), data.get("address"), data.get("contact_number"),
                data.get("additional_contact_number"), data.get("date_of_birth"), data.get("time_of_birth"),
                data.get("place_of_birth"), data.get("additional_notes"), detail.status, detail.admin_note or "", detail.last_updated,
            ]
        return [
            detail.request_number, detail.submitted_date, detail.submitted_time, detail.source, detail.submitted_by,
            data.get("preferred_language"), data.get("contact_person_name"), data.get("address"), data.get("contact_number"),
            data.get("additional_contact_number"), data.get("girl", {}).get("full_name"), data.get("girl", {}).get("date_of_birth"),
            data.get("girl", {}).get("time_of_birth"), data.get("girl", {}).get("place_of_birth"),
            data.get("boy", {}).get("full_name"), data.get("boy", {}).get("date_of_birth"),
            data.get("boy", {}).get("time_of_birth"), data.get("boy", {}).get("place_of_birth"),
            detail.status, detail.admin_note or "", detail.last_updated,
        ]


def get_request_repository(store):
    if get_settings().google_sheets_enabled:
        from app.services.google_sheets import GoogleSheetsClient

        return SheetsRequestRepository(store, GoogleSheetsClient())
    return LocalRequestRepository(store)
