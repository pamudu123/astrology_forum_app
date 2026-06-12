import uuid
from typing import Protocol

import httpx

from app.config import get_settings
from app.schemas.auth import CreateUserRequest, UserPublic
from app.utils.constants import AccountStatus, Role
from app.utils.datetime_utils import iso_now


class UserRecord(UserPublic):
    password_hash: str | None = None
    created_at: str | None = None
    last_login: str | None = None


class UserRepository(Protocol):
    async def get_by_username(self, username: str) -> UserRecord | None: ...
    async def get_by_id(self, user_id: str) -> UserRecord | None: ...
    async def create_user(self, payload: CreateUserRequest) -> UserRecord: ...
    async def activate_user(self, username: str, password_hash: str) -> UserRecord: ...
    async def update_last_login(self, user_id: str) -> None: ...
    async def list_users(self) -> list[UserRecord]: ...


class LocalUserRepository:
    def __init__(self, store) -> None:
        self.store = store
        self._ensure_seed_admin()

    def _load(self) -> list[dict]:
        return self.store.read("users", [])

    def _save(self, users: list[dict]) -> None:
        self.store.write("users", users)

    def _ensure_seed_admin(self) -> None:
        users = self._load()
        if users:
            return
        self._save([
            {
                "user_id": str(uuid.uuid4()),
                "full_name": "Local Admin",
                "username": "admin",
                "password_hash": None,
                "role": Role.ADMIN,
                "account_status": AccountStatus.PENDING,
                "created_at": iso_now(),
                "last_login": None,
            }
        ])

    async def get_by_username(self, username: str) -> UserRecord | None:
        username = username.strip().lower()
        for user in self._load():
            if user["username"].lower() == username:
                return UserRecord(**user)
        return None

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        for user in self._load():
            if user["user_id"] == user_id:
                return UserRecord(**user)
        return None

    async def create_user(self, payload: CreateUserRequest) -> UserRecord:
        users = self._load()
        if any(user["username"].lower() == payload.username.lower() for user in users):
            raise ValueError("Username already exists.")
        record = {
            "user_id": str(uuid.uuid4()),
            "full_name": payload.full_name.strip(),
            "username": payload.username.strip(),
            "password_hash": None,
            "role": payload.role,
            "account_status": AccountStatus.PENDING,
            "created_at": iso_now(),
            "last_login": None,
        }
        users.append(record)
        self._save(users)
        return UserRecord(**record)

    async def activate_user(self, username: str, password_hash: str) -> UserRecord:
        users = self._load()
        for user in users:
            if user["username"].lower() == username.strip().lower():
                user["password_hash"] = password_hash
                user["account_status"] = AccountStatus.ACTIVE
                self._save(users)
                return UserRecord(**user)
        raise ValueError("User not found.")

    async def update_last_login(self, user_id: str) -> None:
        users = self._load()
        for user in users:
            if user["user_id"] == user_id:
                user["last_login"] = iso_now()
                self._save(users)
                return

    async def list_users(self) -> list[UserRecord]:
        return [UserRecord(**user) for user in self._load()]


class SupabaseUserRepository:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = settings.supabase_url.rstrip("/") if settings.supabase_url else ""
        self.table = settings.supabase_users_table
        self.headers = {
            "apikey": settings.supabase_service_role_key or "",
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json",
        }

    async def _request(self, method: str, path: str, **kwargs):
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.request(method, f"{self.base_url}/rest/v1/{path}", headers=self.headers, **kwargs)
        response.raise_for_status()
        return response.json() if response.content else None

    async def get_by_username(self, username: str) -> UserRecord | None:
        rows = await self._request("GET", f"{self.table}?username=eq.{username}&limit=1")
        return UserRecord(**rows[0]) if rows else None

    async def get_by_id(self, user_id: str) -> UserRecord | None:
        rows = await self._request("GET", f"{self.table}?user_id=eq.{user_id}&limit=1")
        return UserRecord(**rows[0]) if rows else None

    async def create_user(self, payload: CreateUserRequest) -> UserRecord:
        record = {
            "user_id": str(uuid.uuid4()),
            "full_name": payload.full_name.strip(),
            "username": payload.username.strip(),
            "role": payload.role,
            "account_status": AccountStatus.PENDING,
            "password_hash": None,
            "created_at": iso_now(),
        }
        rows = await self._request("POST", self.table, json=record, params={"select": "*"})
        return UserRecord(**rows[0])

    async def activate_user(self, username: str, password_hash: str) -> UserRecord:
        rows = await self._request(
            "PATCH",
            f"{self.table}?username=eq.{username}",
            json={"password_hash": password_hash, "account_status": AccountStatus.ACTIVE},
            params={"select": "*"},
        )
        return UserRecord(**rows[0])

    async def update_last_login(self, user_id: str) -> None:
        await self._request("PATCH", f"{self.table}?user_id=eq.{user_id}", json={"last_login": iso_now()})

    async def list_users(self) -> list[UserRecord]:
        rows = await self._request("GET", f"{self.table}?select=*&order=created_at.desc")
        return [UserRecord(**row) for row in rows]


def get_user_repository(store) -> UserRepository:
    return SupabaseUserRepository() if get_settings().supabase_enabled else LocalUserRepository(store)
