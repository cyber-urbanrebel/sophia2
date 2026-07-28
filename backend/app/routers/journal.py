from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user_id
from app.models import JournalEntry
from app.schemas import CreateJournalRequest, JournalEntryPublic

router = APIRouter(prefix="/api/journal", tags=["journal"])


def _to_public(entry: JournalEntry) -> JournalEntryPublic:
    return JournalEntryPublic(
        id=entry.id, user_id=entry.user_id, prompt=entry.prompt, text=entry.text,
        mood=entry.mood, created_at=entry.created_at,
    )


@router.get("", response_model=list[JournalEntryPublic])
def list_entries(user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    entries = session.exec(
        select(JournalEntry).where(JournalEntry.user_id == user_id).order_by(JournalEntry.created_at.desc())  # type: ignore[union-attr]
    ).all()
    return [_to_public(e) for e in entries]


@router.post("", response_model=JournalEntryPublic, status_code=status.HTTP_201_CREATED)
def create_entry(
    body: CreateJournalRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    entry = JournalEntry(user_id=user_id, text=body.text, prompt=body.prompt, mood=body.mood)
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
    entry = session.get(JournalEntry, entry_id)
    if not entry or entry.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="entry_not_found")
    session.delete(entry)
    session.commit()
