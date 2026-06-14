from datetime import datetime
from typing import Protocol

import httpx

from app.config import get_settings
from app.schemas.admin import DashboardCounts, RequestDetail, RequestSummary
from app.utils.constants import FormType, RequestStatus, Source
from app.utils.datetime_utils import iso_now, today_parts


class RequestRepository(Protocol):
    async def create(self, form_type: FormType, source: Source, submitted_by: str, request_number: str, payload: dict, submitted_by_user_id: str | None = None) -> RequestDetail: ...
    async def list(self, status: RequestStatus | None = None, form_type: FormType | None = None, source: Source | None = None) -> list[RequestSummary]: ...
    async def get(self, request_number: str) -> RequestDetail | None: ...
    async def update_status(self, request_number: str, status: RequestStatus, admin_note: str | None) -> RequestDetail: ...
    async def dashboard(self) -> DashboardCounts: ...


class SupabaseFormSubmissionRepository:
    def __init__(self, sheets_client=None) -> None:
        settings = get_settings()
        self.base_url = settings.supabase_url.rstrip("/") if settings.supabase_url else ""
        self.headers = {
            "apikey": settings.supabase_service_role_key or "",
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json",
            "Prefer": "return=representation",
        }
        self.sheets_client = sheets_client

    async def _request(self, method: str, path: str, **kwargs):
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.request(method, f"{self.base_url}/rest/v1/{path}", headers=self.headers, **kwargs)
        response.raise_for_status()
        return response.json() if response.content else None

    def _timestamp_parts(self, value: str | None) -> tuple[str, str]:
        if not value:
            return today_parts()
        try:
            parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
            return parsed.date().isoformat(), parsed.time().replace(microsecond=0).isoformat()
        except ValueError:
            return today_parts()

    def _payload_to_row(self, form_type: FormType, source: Source, submitted_by: str, request_number: str, payload: dict, submitted_by_user_id: str | None) -> dict:
        row = {
            "submission_code": request_number,
            "form_type": form_type,
            "submitted_by_type": source,
            "submitted_by_user_id": submitted_by_user_id,
            "submitted_by_name": submitted_by,
            "status": RequestStatus.NEW,
            "admin_note": None,
            "preferred_language": payload.get("preferred_language"),
            "address": payload.get("address"),
            "contact_number": payload.get("contact_number"),
            "additional_contact_number": payload.get("additional_contact_number"),
            "submitted_at": iso_now(),
            "updated_at": iso_now(),
        }
        if form_type == FormType.HADAHAN:
            row.update(
                {
                    "full_name": payload.get("full_name"),
                    "date_of_birth": payload.get("date_of_birth"),
                    "time_of_birth": payload.get("time_of_birth"),
                    "place_of_birth": payload.get("place_of_birth"),
                    "additional_notes": payload.get("additional_notes"),
                }
            )
        else:
            girl = payload.get("girl", {})
            boy = payload.get("boy", {})
            row.update(
                {
                    "contact_person_name": payload.get("contact_person_name"),
                    "girl_full_name": girl.get("full_name"),
                    "girl_date_of_birth": girl.get("date_of_birth"),
                    "girl_time_of_birth": girl.get("time_of_birth"),
                    "girl_place_of_birth": girl.get("place_of_birth"),
                    "boy_full_name": boy.get("full_name"),
                    "boy_date_of_birth": boy.get("date_of_birth"),
                    "boy_time_of_birth": boy.get("time_of_birth"),
                    "boy_place_of_birth": boy.get("place_of_birth"),
                }
            )
        return row

    def _row_to_payload(self, row: dict) -> dict:
        if row["form_type"] == FormType.HADAHAN:
            return {
                "preferred_language": row.get("preferred_language"),
                "full_name": row.get("full_name"),
                "address": row.get("address"),
                "contact_number": row.get("contact_number"),
                "additional_contact_number": row.get("additional_contact_number"),
                "date_of_birth": row.get("date_of_birth"),
                "time_of_birth": row.get("time_of_birth"),
                "place_of_birth": row.get("place_of_birth"),
                "additional_notes": row.get("additional_notes"),
            }
        return {
            "preferred_language": row.get("preferred_language"),
            "contact_person_name": row.get("contact_person_name"),
            "address": row.get("address"),
            "contact_number": row.get("contact_number"),
            "additional_contact_number": row.get("additional_contact_number"),
            "girl": {
                "full_name": row.get("girl_full_name"),
                "date_of_birth": row.get("girl_date_of_birth"),
                "time_of_birth": row.get("girl_time_of_birth"),
                "place_of_birth": row.get("girl_place_of_birth"),
            },
            "boy": {
                "full_name": row.get("boy_full_name"),
                "date_of_birth": row.get("boy_date_of_birth"),
                "time_of_birth": row.get("boy_time_of_birth"),
                "place_of_birth": row.get("boy_place_of_birth"),
            },
        }

    def _row_to_detail(self, row: dict) -> RequestDetail:
        date, time = self._timestamp_parts(row.get("submitted_at"))
        return RequestDetail(
            request_number=row["submission_code"],
            form_type=row["form_type"],
            submitted_by=row.get("submitted_by_name") or "Guest",
            source=row["submitted_by_type"],
            submitted_date=date,
            submitted_time=time,
            status=row["status"],
            admin_note=row.get("admin_note"),
            last_updated=row.get("updated_at"),
            data=self._row_to_payload(row),
        )

    def _to_sheet_row(self, detail: RequestDetail) -> list:
        data = detail.data
        submitted_at = f"{detail.submitted_date} {detail.submitted_time}"
        if detail.form_type == FormType.HADAHAN:
            return [
                detail.request_number,
                submitted_at,
                detail.source,
                detail.submitted_by,
                data.get("preferred_language"),
                data.get("full_name"),
                data.get("address"),
                data.get("contact_number"),
                data.get("additional_contact_number"),
                data.get("date_of_birth"),
                data.get("time_of_birth"),
                data.get("place_of_birth"),
                data.get("additional_notes"),
                detail.status,
                detail.admin_note or "",
            ]
        return [
            detail.request_number,
            submitted_at,
            detail.source,
            detail.submitted_by,
            data.get("preferred_language"),
            data.get("contact_person_name"),
            data.get("address"),
            data.get("contact_number"),
            data.get("additional_contact_number"),
            data.get("girl", {}).get("full_name"),
            data.get("girl", {}).get("date_of_birth"),
            data.get("girl", {}).get("time_of_birth"),
            data.get("girl", {}).get("place_of_birth"),
            data.get("boy", {}).get("full_name"),
            data.get("boy", {}).get("date_of_birth"),
            data.get("boy", {}).get("time_of_birth"),
            data.get("boy", {}).get("place_of_birth"),
            detail.status,
            detail.admin_note or "",
        ]

    async def create(self, form_type: FormType, source: Source, submitted_by: str, request_number: str, payload: dict, submitted_by_user_id: str | None = None) -> RequestDetail:
        row = self._payload_to_row(form_type, source, submitted_by, request_number, payload, submitted_by_user_id)
        rows = await self._request("POST", "form_submissions", json=row, params={"select": "*"})
        detail = self._row_to_detail(rows[0])
        if self.sheets_client:
            sheet = "Hadahan" if form_type == FormType.HADAHAN else "Porondam"
            self.sheets_client.append_row(sheet, self._to_sheet_row(detail))
        return detail

    async def list(self, status: RequestStatus | None = None, form_type: FormType | None = None, source: Source | None = None) -> list[RequestSummary]:
        params = {"select": "*", "order": "submitted_at.desc"}
        if status:
            params["status"] = f"eq.{status}"
        if form_type:
            params["form_type"] = f"eq.{form_type}"
        if source:
            params["submitted_by_type"] = f"eq.{source}"
        rows = await self._request("GET", "form_submissions", params=params)
        return [RequestSummary(**self._row_to_detail(row).model_dump(exclude={"data", "admin_note", "last_updated"})) for row in rows]

    async def get(self, request_number: str) -> RequestDetail | None:
        rows = await self._request("GET", "form_submissions", params={"select": "*", "submission_code": f"eq.{request_number}", "limit": "1"})
        return self._row_to_detail(rows[0]) if rows else None

    async def update_status(self, request_number: str, status: RequestStatus, admin_note: str | None) -> RequestDetail:
        rows = await self._request(
            "PATCH",
            "form_submissions",
            params={"submission_code": f"eq.{request_number}", "select": "*"},
            json={"status": status, "admin_note": admin_note, "updated_at": iso_now()},
        )
        if not rows:
            raise ValueError("Request not found.")
        return self._row_to_detail(rows[0])

    async def dashboard(self) -> DashboardCounts:
        rows = await self._request("GET", "form_submissions", params={"select": "*", "order": "submitted_at.desc"})
        summaries = [RequestSummary(**self._row_to_detail(row).model_dump(exclude={"data", "admin_note", "last_updated"})) for row in rows]
        return DashboardCounts(
            total_requests=len(rows),
            new_requests=sum(row["status"] == RequestStatus.NEW for row in rows),
            on_hold_requests=sum(row["status"] == RequestStatus.ON_HOLD for row in rows),
            completed_requests=sum(row["status"] == RequestStatus.DONE for row in rows),
            cancelled_requests=sum(row["status"] == RequestStatus.CANCELLED for row in rows),
            hadahan_requests=sum(row["form_type"] == FormType.HADAHAN for row in rows),
            porondam_requests=sum(row["form_type"] == FormType.PORONDAM for row in rows),
            guest_submissions=sum(row["submitted_by_type"] == Source.GUEST for row in rows),
            registered_user_submissions=sum(row["submitted_by_type"] == Source.USER for row in rows),
            recent_requests=summaries[:5],
        )


def get_request_repository() -> RequestRepository:
    if not get_settings().supabase_enabled:
        raise RuntimeError("Supabase is required. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.")
    sheets_client = None
    if get_settings().google_sheets_enabled:
        from app.services.google_sheets import GoogleSheetsClient

        sheets_client = GoogleSheetsClient()
    return SupabaseFormSubmissionRepository(sheets_client)
