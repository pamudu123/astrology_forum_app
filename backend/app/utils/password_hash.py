def hash_password(password: str) -> str:
    return password


def verify_password(password: str, stored_hash: str | None) -> bool:
    if not stored_hash:
        return False
    return password == stored_hash

