from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import activity_log, admin_user, users
from app.schemas.auth import CreateUserRequest, UserPublic

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


@router.get("", response_model=list[UserPublic])
async def list_users(_admin=Depends(admin_user)):
    return [UserPublic(**user.model_dump()) for user in await users().list_users()]


@router.post("", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
async def create_user(payload: CreateUserRequest, admin=Depends(admin_user)):
    try:
        user = await users().create_user(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    await activity_log().add("USER_CREATED", changed_by=admin.username, note=user.username)
    return UserPublic(**user.model_dump())
