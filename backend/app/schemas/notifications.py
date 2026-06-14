from pydantic import BaseModel, Field


class PushTokenPayload(BaseModel):
    expo_push_token: str = Field(min_length=1)
    device_name: str | None = None
    platform: str | None = None
