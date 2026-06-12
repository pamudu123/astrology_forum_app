from datetime import date, time

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import Phone, normalize_phone, validate_birth_date
from app.utils.constants import PreferredLanguage


class PersonBirthDetails(BaseModel):
    full_name: str = Field(min_length=1)
    date_of_birth: date
    time_of_birth: time
    place_of_birth: str = Field(min_length=1)

    @field_validator("date_of_birth")
    @classmethod
    def birth_not_future(cls, value: date) -> date:
        return validate_birth_date(value)


class PorondamCreate(BaseModel):
    preferred_language: PreferredLanguage = PreferredLanguage.SINHALA
    contact_person_name: str = Field(min_length=1)
    address: str | None = None
    contact_number: Phone
    additional_contact_number: Phone | None = None
    girl: PersonBirthDetails
    boy: PersonBirthDetails

    @field_validator("contact_number", "additional_contact_number")
    @classmethod
    def clean_phone(cls, value: str | None) -> str | None:
        return normalize_phone(value)

    @field_validator("address")
    @classmethod
    def blank_address_is_none(cls, value: str | None) -> str | None:
        if value is None:
            return None
        value = value.strip()
        return value or None
