from pydantic import BaseModel

from app.utils.constants import FormType, RequestStatus, Source


class RequestSummary(BaseModel):
    request_number: str
    form_type: FormType
    submitted_by: str
    source: Source
    submitted_date: str
    submitted_time: str
    status: RequestStatus


class RequestDetail(RequestSummary):
    data: dict
    admin_note: str | None = None
    last_updated: str | None = None


class DashboardCounts(BaseModel):
    total_requests: int
    new_requests: int
    on_hold_requests: int
    completed_requests: int
    cancelled_requests: int
    hadahan_requests: int
    porondam_requests: int
    guest_submissions: int
    registered_user_submissions: int
    recent_requests: list[RequestSummary]


class ResetRequestsResponse(BaseModel):
    deleted_requests: int
