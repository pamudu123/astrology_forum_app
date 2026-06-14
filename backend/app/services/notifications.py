from app.config import get_settings

import httpx


class NotificationService:
    def __init__(self) -> None:
        settings = get_settings()
        self.base_url = settings.supabase_url.rstrip("/") if settings.supabase_url else ""
        self.enabled = settings.supabase_enabled
        self.headers = {
            "apikey": settings.supabase_service_role_key or "",
            "Authorization": f"Bearer {settings.supabase_service_role_key}",
            "Content-Type": "application/json",
        }

    async def _supabase_request(self, method: str, path: str, **kwargs):
        headers = kwargs.pop("headers", self.headers)
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.request(method, f"{self.base_url}/rest/v1/{path}", headers=headers, **kwargs)
        response.raise_for_status()
        return response.json() if response.content else None

    async def register_admin_token(self, user_id: str, expo_push_token: str, device_name: str | None = None, platform: str | None = None) -> None:
        if not self.enabled:
            return
        payload = {
            "user_id": user_id,
            "expo_push_token": expo_push_token,
            "device_name": device_name,
            "platform": platform,
            "is_active": True,
        }
        await self._supabase_request(
            "POST",
            "admin_push_tokens",
            json=payload,
            params={"on_conflict": "expo_push_token"},
            headers={**self.headers, "Prefer": "resolution=merge-duplicates"},
        )

    async def unregister_admin_token(self, expo_push_token: str) -> None:
        if not self.enabled:
            return
        await self._supabase_request(
            "PATCH",
            "admin_push_tokens",
            params={"expo_push_token": f"eq.{expo_push_token}"},
            json={"is_active": False},
        )

    async def notify_new_submission(self, submission_code: str, form_type: str, submitted_by: str) -> None:
        if not self.enabled:
            return
        rows = await self._supabase_request(
            "GET",
            "admin_push_tokens",
            params={"select": "expo_push_token", "is_active": "eq.true"},
        )
        tokens = [row["expo_push_token"] for row in rows or [] if row.get("expo_push_token")]
        if not tokens:
            return
        title = f"New {form_type.title()} Submission"
        body = f"{submission_code} from {submitted_by}"
        messages = [
            {
                "to": token,
                "title": title,
                "body": body,
                "data": {"submission_code": submission_code, "form_type": form_type},
                "sound": "default",
            }
            for token in tokens
        ]
        async with httpx.AsyncClient(timeout=20) as client:
            response = await client.post("https://exp.host/--/api/v2/push/send", json=messages)
        response.raise_for_status()
