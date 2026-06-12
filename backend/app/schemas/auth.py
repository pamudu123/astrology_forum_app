from pydantic import BaseModel, Field

from app.utils.constants import AccountStatus, Role


class UserPublic(BaseModel):
    user_id: str
    full_name: str
    username: str
    role: Role
    account_status: AccountStatus


class CheckUsernameRequest(BaseModel):
    username: str = Field(min_length=1)


class CheckUsernameResponse(BaseModel):
    username: str
    account_status: AccountStatus


class ActivateRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1)
    password: str = Field(min_length=1)


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class CreateUserRequest(BaseModel):
    full_name: str = Field(min_length=1)
    username: str = Field(min_length=1)
    role: Role = Role.USER
