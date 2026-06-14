from datetime import date, timedelta

import pytest
from pydantic import ValidationError

from app.schemas.common import StatusUpdate
from app.schemas.hadahan import HadahanCreate
from app.schemas.porondam import PersonBirthDetails, PorondamCreate
from app.utils.constants import RequestStatus


def test_hadahan_rejects_future_birth_date():
    with pytest.raises(ValidationError):
        HadahanCreate(
            full_name="Nimal",
            address="Balapitiya",
            contact_number="0771234567",
            date_of_birth=date.today() + timedelta(days=1),
            time_of_birth="10:00",
            place_of_birth="Galle",
        )


def test_porondam_address_is_optional():
    payload = PorondamCreate(
        contact_person_name="Nimal",
        contact_number="+94771234567",
        girl=PersonBirthDetails(full_name="Girl", date_of_birth="2000-01-01", time_of_birth="10:00", place_of_birth="Galle"),
        boy=PersonBirthDetails(full_name="Boy", date_of_birth="2000-01-01", time_of_birth="11:00", place_of_birth="Matara"),
    )
    assert payload.address is None


def test_admin_note_required_for_hold_or_cancel():
    update = StatusUpdate(status=RequestStatus.ON_HOLD)
    with pytest.raises(ValueError):
        update.validate_note_required()


def test_password_hashing_and_verification():
    from app.utils.password_hash import hash_password, verify_password

    # Test hashed password verification
    pwd = "my_secure_password"
    hashed = hash_password(pwd)
    assert verify_password(pwd, hashed) is True
    assert verify_password("wrong_password", hashed) is False

    # Test plain text password verification fallback
    plain_pwd = "p"
    assert verify_password("p", plain_pwd) is True
    assert verify_password("wrong", plain_pwd) is False
    assert verify_password(None, plain_pwd) is False
    assert verify_password("p", None) is False

