from app.utils.constants import FormType
from app.utils.datetime_utils import now_local


class RequestNumberService:
    def next_number(self, form_type: FormType) -> str:
        prefix = "HAD" if form_type == FormType.HADAHAN else "POR"
        now = now_local()
        return f"{prefix}-{now.year}-{now.strftime('%m%d%H%M%S%f')}"
