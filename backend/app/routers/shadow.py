import json

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user_id
from app.models import ShadowEntry
from app.schemas import CreateShadowRequest, ShadowEntryPublic, UpdateShadowRequest

router = APIRouter(prefix="/api/shadow", tags=["shadow"])


def _to_public(entry: ShadowEntry) -> ShadowEntryPublic:
    try:
        themes = json.loads(entry.themes_json)
    except (TypeError, ValueError):
        themes = []
    return ShadowEntryPublic(
        id=entry.id, user_id=entry.user_id, prompt=entry.prompt, text=entry.text,
        themes=themes, integrated=entry.integrated, created_at=entry.created_at,
    )


@router.get("", response_model=list[ShadowEntryPublic])
def list_entries(user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    entries = session.exec(
        select(ShadowEntry).where(ShadowEntry.user_id == user_id).order_by(ShadowEntry.created_at.desc())  # type: ignore[union-attr]
    ).all()
    return [_to_public(e) for e in entries]


@router.post("", response_model=ShadowEntryPublic, status_code=status.HTTP_201_CREATED)
def create_entry(
    body: CreateShadowRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    entry = ShadowEntry(
        user_id=user_id, text=body.text, prompt=body.prompt, themes_json=json.dumps(body.themes),
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return _to_public(entry)


@router.put("/{entry_id}", response_model=ShadowEntryPublic)
def update_entry(
    entry_id: str,
    body: UpdateShadowRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    entry = session.get(ShadowEntry, entry_id)
    if not entry or entry.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="entry_not_found")
    if body.integrated is not None:
        entry.integrated = body.integrated
    if body.text is not None:
        entry.text = body.text
    session.add(entry)
    session.commit()
    session.refresh(entry)
    return _to_public(entry)


@router.delete("/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    entry = session.get(ShadowEntry, entry_id)
    if not entry or entry.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="entry_not_found")
    session.delete(entry)
    session.commit()
