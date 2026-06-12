from app.utils.constants import FormType
from app.utils.datetime_utils import now_local


class RequestNumberService:
    def __init__(self, store) -> None:
        self.store = store

    def next_number(self, form_type: FormType) -> str:
        settings = self.store.read("settings", {"NEXT_HADAHAN_NUMBER": 1, "NEXT_PORONDAM_NUMBER": 1})
        key = "NEXT_HADAHAN_NUMBER" if form_type == FormType.HADAHAN else "NEXT_PORONDAM_NUMBER"
        current = int(settings.get(key, 1))
        settings[key] = current + 1
        self.store.write("settings", settings)
        prefix = "HAD" if form_type == FormType.HADAHAN else "POR"
        return f"{prefix}-{now_local().year}-{current:06d}"
