from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"
    jwt_secret: str = Field(default="change-this-secret")
    jwt_expires_minutes: int = 1440
    cors_origins: str = "http://localhost:5173,http://localhost:8081"

    supabase_url: str | None = None
    supabase_service_role_key: str | None = None
    supabase_users_table: str = "users"

    google_sheets_spreadsheet_id: str | None = None
    google_service_account_file: str | None = None

    local_data_dir: str = ".local-data"

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    @property
    def supabase_enabled(self) -> bool:
        return bool(self.supabase_url and self.supabase_service_role_key)

    @property
    def google_sheets_enabled(self) -> bool:
        return bool(self.google_sheets_spreadsheet_id and self.google_service_account_file)


@lru_cache
def get_settings() -> Settings:
    return Settings()
