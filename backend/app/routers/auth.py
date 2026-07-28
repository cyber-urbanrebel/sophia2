from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user_id
from app.models import User
from app.schemas import AuthResponse, LoginRequest, RegisterRequest, UserPublic
from app.security import hash_password, issue_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == body.email)).first()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, detail="email_taken")

    user = User(email=body.email, password_hash=hash_password(body.password), full_name=body.full_name)
    session.add(user)
    session.commit()
    session.refresh(user)

    return AuthResponse(
        token=issue_token(user.id),
        user=UserPublic(id=user.id, email=user.email, full_name=user.full_name),
    )


@router.post("/login", response_model=AuthResponse)
def login(body: LoginRequest, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == body.email)).first()
    if not user or not verify_password(body.password, user.password_hash):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, detail="invalid_credentials")

    return AuthResponse(
        token=issue_token(user.id),
        user=UserPublic(id=user.id, email=user.email, full_name=user.full_name),
    )


@router.get("/me", response_model=UserPublic)
def me(user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="user_not_found")
    return UserPublic(id=user.id, email=user.email, full_name=user.full_name)
