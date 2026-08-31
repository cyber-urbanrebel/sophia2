from fastapi import APIRouter, HTTPException, status

from app.schemas import AuthResponse, ForgotPasswordRequest, LoginRequest, RegisterRequest, UserPublic
from app.services.firebase_identity import send_password_reset, sign_in_with_password, sign_up_with_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _auth_from_firebase(payload: dict, fallback_name: str = "") -> AuthResponse:
    email = payload.get("email") or ""
    uid = payload.get("localId") or payload.get("userId") or ""
    name = payload.get("displayName") or fallback_name or (email.split("@")[0] if email else "Sophia User")
    token = payload.get("idToken") or ""
    if not token or not uid:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="invalid_credentials")
    return AuthResponse(
        token=token,
        user=UserPublic(id=uid, email=email, full_name=name),
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest):
    payload = sign_up_with_password(str(body.email), body.password)
    return _auth_from_firebase(payload, body.full_name or "")


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest):
    payload = sign_in_with_password(str(body.email), body.password)
    return _auth_from_firebase(payload)


@router.post("/forgot-password")
def forgot_password(body: ForgotPasswordRequest):
    try:
        send_password_reset(str(body.email))
    except HTTPException as exc:
        detail = str(exc.detail or "")
        if "EMAIL_NOT_FOUND" not in detail.upper() and "INVALID_EMAIL" not in detail.upper():
            raise
    return {"ok": True, "message": "Password reset email sent. Check your inbox."}


@router.post("/logout")
def logout():
    return {"ok": True, "message": "Logged out"}


@router.post("/refresh")
def refresh():
    raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="refresh_via_firebase_client")
