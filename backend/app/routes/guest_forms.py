from fastapi import APIRouter

from app.dependencies import activity_log, notifications, request_numbers, requests_repo
from app.schemas.common import SubmissionResponse
from app.schemas.hadahan import HadahanCreate
from app.schemas.porondam import PorondamCreate
from app.utils.constants import FormType, Source

router = APIRouter(prefix="/api/guest/forms", tags=["guest-forms"])


@router.post("/hadahan", response_model=SubmissionResponse)
async def submit_guest_hadahan(payload: HadahanCreate):
    request_number = request_numbers().next_number(FormType.HADAHAN)
    await requests_repo().create(FormType.HADAHAN, Source.GUEST, "Guest", request_number, payload.model_dump(mode="json"))
    await activity_log().add("FORM_SUBMITTED", request_number=request_number, changed_by="Guest", new_status="NEW")
    try:
        await notifications().notify_new_submission(request_number, FormType.HADAHAN, "Guest")
    except Exception:
        pass
    return SubmissionResponse(request_number=request_number)


@router.post("/porondam", response_model=SubmissionResponse)
async def submit_guest_porondam(payload: PorondamCreate):
    request_number = request_numbers().next_number(FormType.PORONDAM)
    await requests_repo().create(FormType.PORONDAM, Source.GUEST, "Guest", request_number, payload.model_dump(mode="json"))
    await activity_log().add("FORM_SUBMITTED", request_number=request_number, changed_by="Guest", new_status="NEW")
    try:
        await notifications().notify_new_submission(request_number, FormType.PORONDAM, "Guest")
    except Exception:
        pass
    return SubmissionResponse(request_number=request_number)
