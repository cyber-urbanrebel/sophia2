import uuid
from datetime import datetime, timezone
from typing import Optional

from sqlmodel import SQLModel, Field


def _uuid() -> str:
    return str(uuid.uuid4())


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


class User(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    email: str = Field(unique=True, index=True)
    password_hash: str
    full_name: Optional[str] = None
    created_at: str = Field(default_factory=_now_iso)


class Habit(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    name: str
    domain: str  # "body" | "mind" | "discipline"
    cadence_json: str  # serialized Cadence, see app/schemas.py
    created_at: str = Field(default_factory=_now_iso)
    archived_at: Optional[str] = None


class HabitCompletion(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    habit_id: str = Field(index=True, foreign_key="habit.id")
    completed_at: str = Field(default_factory=_now_iso)
    note: Optional[str] = None


class JournalEntry(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    prompt: Optional[str] = None
    text: str
    mood: Optional[int] = None
    created_at: str = Field(default_factory=_now_iso)


class Task(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    title: str
    priority: str = "normal"  # "low" | "normal" | "high"
    completed: bool = False
    created_at: str = Field(default_factory=_now_iso)
    completed_at: Optional[str] = None


class CoachMessage(SQLModel, table=True):
    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    conversation_id: str = Field(index=True)
    role: str  # "user" | "assistant"
    content: str
    created_at: str = Field(default_factory=_now_iso)


class ShadowEntry(SQLModel, table=True):
    """Private reflective journaling — deliberately separate from JournalEntry
    so shadow work never surfaces in general progress/streak surfaces."""

    id: str = Field(default_factory=_uuid, primary_key=True)
    user_id: str = Field(index=True, foreign_key="user.id")
    prompt: Optional[str] = None
    text: str
    themes_json: str = "[]"  # serialized list[str] of theme ids (fear, shame, ...)
    integrated: bool = False
    created_at: str = Field(default_factory=_now_iso)
