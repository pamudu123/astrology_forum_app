from app.utils.constants import FormType
from app.services.request_repository import RequestRepository


class RequestNumberService:
    async def next_number(self, form_type: FormType, repo: RequestRepository) -> str:
        return await repo.get_next_sequence_number(form_type)
