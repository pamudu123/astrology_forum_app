from fastapi import APIRouter, Depends, HTTPException, status

from app.dependencies import activity_log, current_user, users
from app.schemas.auth import ActivateRequest, AuthResponse, CheckUsernameRequest, CheckUsernameResponse, LoginRequest, UserPublic
from app.services.authentication import create_access_token
from app.utils.constants import AccountStatus
from app.utils.password_hash import hash_password, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/check-username", response_model=CheckUsernameResponse)
async def check_username(payload: CheckUsernameRequest):
    user = await users().get_by_username(payload.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return CheckUsernameResponse(username=user.username, account_status=user.account_status)


@router.post("/activate", response_model=AuthResponse)
async def activate(payload: ActivateRequest):
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Passwords do not match.")
    user = await users().get_by_username(payload.username)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.account_status != AccountStatus.PENDING:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Account is already active")
    activated = await users().activate_user(payload.username, hash_password(payload.password))
    await users().update_last_login(activated.user_id)
    await activity_log().add("PASSWORD_ACTIVATED", changed_by=activated.username)
    return AuthResponse(access_token=create_access_token({"sub": activated.user_id, "role": activated.role}), user=UserPublic(**activated.model_dump()))


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest):
    user = await users().get_by_username(payload.username)
    if not user or user.account_status != AccountStatus.ACTIVE or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")
    await users().update_last_login(user.user_id)
    return AuthResponse(access_token=create_access_token({"sub": user.user_id, "role": user.role}), user=UserPublic(**user.model_dump()))


@router.get("/me", response_model=UserPublic)
async def me(user=Depends(current_user)):
    return UserPublic(**user.model_dump())
