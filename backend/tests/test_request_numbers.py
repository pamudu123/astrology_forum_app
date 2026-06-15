import pytest
from unittest.mock import AsyncMock, MagicMock
from app.utils.constants import FormType
from app.services.request_repository import SupabaseFormSubmissionRepository
from app.services.request_numbers import RequestNumberService


@pytest.mark.anyio
async def test_get_next_sequence_number_empty():
    repo = SupabaseFormSubmissionRepository()
    repo._request = AsyncMock(return_value=[])
    
    next_had = await repo.get_next_sequence_number(FormType.HADAHAN)
    assert next_had == "HAD-0001"
    repo._request.assert_called_with("GET", "form_submissions", params={"select": "submission_code", "form_type": "eq.HADAHAN"})

    repo._request = AsyncMock(return_value=[])
    next_por = await repo.get_next_sequence_number(FormType.PORONDAM)
    assert next_por == "POR-0001"


@pytest.mark.anyio
async def test_get_next_sequence_number_with_existing():
    repo = SupabaseFormSubmissionRepository()
    repo._request = AsyncMock(return_value=[
        {"submission_code": "HAD-0001"},
        {"submission_code": "HAD-0042"},
        {"submission_code": "HAD-invalid"},
        {"submission_code": "HAD-2026-0615123456"},
    ])
    next_had = await repo.get_next_sequence_number(FormType.HADAHAN)
    assert next_had == "HAD-0043"


@pytest.mark.anyio
async def test_request_number_service():
    repo = MagicMock()
    repo.get_next_sequence_number = AsyncMock(return_value="HAD-0043")
    
    service = RequestNumberService()
    next_num = await service.next_number(FormType.HADAHAN, repo)
    assert next_num == "HAD-0043"
    repo.get_next_sequence_number.assert_called_once_with(FormType.HADAHAN)
