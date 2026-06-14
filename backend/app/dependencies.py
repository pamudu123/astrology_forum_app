from functools import lru_cache

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.services.activity_log import ActivityLogRepository
from app.services.authentication import decode_access_token
from app.services.local_store import LocalStore
from app.services.notifications import NotificationService
from app.services.request_numbers import RequestNumberService
from app.services.request_repository import RequestRepository, get_request_repository
from app.services.user_repository import UserRecord, UserRepository, get_user_repository
from app.utils.constants import Role

bearer = HTTPBearer()


@lru_cache
def get_store() -> LocalStore:
    return LocalStore()


@lru_cache
def users() -> UserRepository:
    return get_user_repository(get_store())


@lru_cache
def requests_repo() -> RequestRepository:
    return get_request_repository(get_store())


@lru_cache
def request_numbers() -> RequestNumberService:
    return RequestNumberService(get_store())


@lru_cache
def activity_log() -> ActivityLogRepository:
    return ActivityLogRepository(get_store())


@lru_cache
def notifications() -> NotificationService:
    return NotificationService()


async def current_user(credentials: HTTPAuthorizationCredentials = Depends(bearer)) -> UserRecord:
    payload = decode_access_token(credentials.credentials)
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")
    user = await users().get_by_id(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


async def admin_user(user: UserRecord = Depends(current_user)) -> UserRecord:
    if user.role != Role.ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return user
