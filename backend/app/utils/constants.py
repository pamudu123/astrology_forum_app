from enum import StrEnum


class Role(StrEnum):
    ADMIN = "ADMIN"
    USER = "USER"


class AccountStatus(StrEnum):
    PENDING = "PENDING"
    ACTIVE = "ACTIVE"


class RequestStatus(StrEnum):
    NEW = "NEW"
    ON_HOLD = "ON_HOLD"
    DONE = "DONE"
    CANCELLED = "CANCELLED"


class FormType(StrEnum):
    HADAHAN = "HADAHAN"
    PORONDAM = "PORONDAM"


class Source(StrEnum):
    USER = "USER"
    GUEST = "GUEST"


class PreferredLanguage(StrEnum):
    ENGLISH = "ENGLISH"
    SINHALA = "SINHALA"


ACTIVE_STATUSES = {RequestStatus.NEW, RequestStatus.ON_HOLD}
HISTORY_STATUSES = {RequestStatus.DONE, RequestStatus.CANCELLED}
