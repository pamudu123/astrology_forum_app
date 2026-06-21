from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.dependencies import activity_log, admin_user, requests_repo
from app.schemas.admin import DashboardCounts, RequestDetail, RequestSummary, ResetRequestsResponse
from app.schemas.common import StatusUpdate
from app.utils.constants import FormType, RequestStatus, Source

router = APIRouter(prefix="/api/admin", tags=["admin-requests"])


@router.get("/requests", response_model=list[RequestSummary])
async def list_requests(
    status_filter: RequestStatus | None = Query(default=None, alias="status"),
    form_type: FormType | None = None,
    source: Source | None = None,
    _admin=Depends(admin_user),
):
    return await requests_repo().list(status=status_filter, form_type=form_type, source=source)


@router.get("/requests/{request_number}", response_model=RequestDetail)
async def get_request(request_number: str, _admin=Depends(admin_user)):
    detail = await requests_repo().get(request_number)
    if not detail:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    return detail


@router.patch("/requests/{request_number}/status", response_model=RequestDetail)
async def update_status(request_number: str, payload: StatusUpdate, admin=Depends(admin_user)):
    try:
        payload.validate_note_required()
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    previous = await requests_repo().get(request_number)
    if not previous:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    updated = await requests_repo().update_status(request_number, payload.status, payload.admin_note)
    await activity_log().add(
        "STATUS_UPDATED",
        request_number=request_number,
        changed_by=admin.username,
        previous_status=previous.status,
        new_status=payload.status,
        note=payload.admin_note or "",
    )
    return updated


@router.get("/dashboard", response_model=DashboardCounts)
async def dashboard(_admin=Depends(admin_user)):
    return await requests_repo().dashboard()


@router.delete("/requests", response_model=ResetRequestsResponse)
async def reset_requests(admin=Depends(admin_user)):
    deleted = await requests_repo().reset_all()
    await activity_log().add("REQUESTS_RESET", changed_by=admin.username, note=f"Deleted {deleted} requests")
    return ResetRequestsResponse(deleted_requests=deleted)
