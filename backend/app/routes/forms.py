from fastapi import APIRouter, Depends

from app.dependencies import activity_log, current_user, notifications, request_numbers, requests_repo
from app.schemas.common import SubmissionResponse
from app.schemas.hadahan import HadahanCreate
from app.schemas.porondam import PorondamCreate
from app.services.user_repository import UserRecord
from app.utils.constants import FormType, Source

router = APIRouter(prefix="/api/forms", tags=["forms"])


@router.post("/hadahan", response_model=SubmissionResponse)
async def submit_hadahan(payload: HadahanCreate, user: UserRecord = Depends(current_user)):
    request_number = await request_numbers().next_number(FormType.HADAHAN, requests_repo())
    await requests_repo().create(FormType.HADAHAN, Source.USER, user.username, request_number, payload.model_dump(mode="json"), user.user_id)
    await activity_log().add("FORM_SUBMITTED", request_number=request_number, changed_by=user.username, new_status="NEW")
    try:
        await notifications().notify_new_submission(request_number, FormType.HADAHAN, user.username)
    except Exception:
        pass
    return SubmissionResponse(request_number=request_number)


@router.post("/porondam", response_model=SubmissionResponse)
async def submit_porondam(payload: PorondamCreate, user: UserRecord = Depends(current_user)):
    request_number = await request_numbers().next_number(FormType.PORONDAM, requests_repo())
    await requests_repo().create(FormType.PORONDAM, Source.USER, user.username, request_number, payload.model_dump(mode="json"), user.user_id)
    await activity_log().add("FORM_SUBMITTED", request_number=request_number, changed_by=user.username, new_status="NEW")
    try:
        await notifications().notify_new_submission(request_number, FormType.PORONDAM, user.username)
    except Exception:
        pass
    return SubmissionResponse(request_number=request_number)
