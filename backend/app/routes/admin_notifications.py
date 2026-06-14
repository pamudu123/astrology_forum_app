from fastapi import APIRouter, Depends

from app.dependencies import admin_user, notifications
from app.schemas.common import ApiMessage
from app.schemas.notifications import PushTokenPayload
from app.services.user_repository import UserRecord

router = APIRouter(prefix="/api/admin/notifications", tags=["admin-notifications"])


@router.post("/register-token", response_model=ApiMessage)
async def register_token(payload: PushTokenPayload, admin: UserRecord = Depends(admin_user)):
    await notifications().register_admin_token(admin.user_id, payload.expo_push_token, payload.device_name, payload.platform)
    return ApiMessage(message="Notification token registered.")


@router.post("/unregister-token", response_model=ApiMessage)
async def unregister_token(payload: PushTokenPayload, _admin: UserRecord = Depends(admin_user)):
    await notifications().unregister_admin_token(payload.expo_push_token)
    return ApiMessage(message="Notification token unregistered.")
