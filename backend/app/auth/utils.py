import bcrypt


def hash_password(password: str) -> str:
    encoded = password.encode("utf-8")[:72]
    return bcrypt.hashpw(encoded, bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    encoded = plain_password.encode("utf-8")[:72]
    return bcrypt.checkpw(encoded, hashed_password.encode("utf-8"))
