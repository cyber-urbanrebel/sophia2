from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.config import settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))


def issue_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    return jwt.encode({"sub": user_id, "exp": expire}, settings.jwt_secret, algorithm="HS256")


def decode_token(token: str) -> str:
    """Returns the user id (sub claim). Accepts Sophia JWTs and Firebase ID tokens."""
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=["HS256"])
        return payload["sub"]
    except jwt.PyJWTError:
        payload = jwt.decode(
            token,
            options={"verify_signature": False, "verify_exp": True, "verify_aud": False},
            algorithms=["RS256"],
        )
        user_id = payload.get("user_id") or payload.get("sub")
        if not user_id:
            raise jwt.InvalidTokenError("missing_subject")
        return str(user_id)
