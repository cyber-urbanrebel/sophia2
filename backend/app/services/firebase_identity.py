import os

import httpx
from fastapi import HTTPException, status

FIREBASE_WEB_API_KEY = (
    os.getenv("VITE_FIREBASE_API_KEY")
    or os.getenv("FIREBASE_API_KEY")
    or "AIzaSyDB7nshwgpaQkBSm7ZEu1CAZJhuJBwHuwY"
)
IDENTITY_URL = "https://identitytoolkit.googleapis.com/v1"


def _raise_firebase_error(payload: dict, fallback: str, code: int = 401) -> None:
    message = str((payload.get("error") or {}).get("message") or fallback)
    raise HTTPException(status_code=code, detail=message)


def firebase_request(path: str, body: dict) -> dict:
    response = httpx.post(
        f"{IDENTITY_URL}/{path}",
        params={"key": FIREBASE_WEB_API_KEY},
        json=body,
        timeout=20.0,
    )
    payload = response.json() if response.content else {}
    if response.status_code >= 400:
        code = status.HTTP_401_UNAUTHORIZED
        message = str((payload.get("error") or {}).get("message") or "auth_failed")
        if message in {"EMAIL_EXISTS", "WEAK_PASSWORD"}:
            code = status.HTTP_409_CONFLICT if message == "EMAIL_EXISTS" else status.HTTP_400_BAD_REQUEST
        _raise_firebase_error(payload, "auth_failed", code)
    return payload


def sign_in_with_password(email: str, password: str) -> dict:
    return firebase_request(
        "accounts:signInWithPassword",
        {"email": email, "password": password, "returnSecureToken": True},
    )


def sign_up_with_password(email: str, password: str) -> dict:
    return firebase_request(
        "accounts:signUp",
        {"email": email, "password": password, "returnSecureToken": True},
    )


def send_password_reset(email: str) -> dict:
    return firebase_request(
        "accounts:sendOobCode",
        {"requestType": "PASSWORD_RESET", "email": email},
    )
