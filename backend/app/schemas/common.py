from datetime import date
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.utils.constants import PreferredLanguage, RequestStatus

Phone = Annotated[str, Field(min_length=7, max_length=16)]


def normalize_phone(value: str | None) -> str | None:
    if value is None:
        return None
    cleaned = "".join(value.split())
    if not cleaned:
        return None
    digits = cleaned[1:] if cleaned.startswith("+") else cleaned
    if not digits.isdigit() or len(digits) < 7:
        raise ValueError("Please enter a valid contact number.")
    return cleaned


class ApiMessage(BaseModel):
    message: str


class StatusUpdate(BaseModel):
    status: RequestStatus
    admin_note: str | None = None

    @field_validator("admin_note")
    @classmethod
    def clean_note(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None

    def validate_note_required(self) -> None:
        pass


class SubmissionResponse(BaseModel):
    request_number: str
    message: str = "Your form has been submitted successfully."


class LanguagePayload(BaseModel):
    preferred_language: PreferredLanguage = PreferredLanguage.SINHALA


def validate_birth_date(value: date) -> date:
    if value > date.today():
        raise ValueError("Date of birth cannot be in the future.")
    return value
