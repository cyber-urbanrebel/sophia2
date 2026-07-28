from datetime import datetime, timedelta, timezone
from typing import Literal, Optional, Union

from pydantic import BaseModel, Field, EmailStr


# --- Cadence ---

class DailyCadence(BaseModel):
    type: Literal["daily"]


class PerWeekCadence(BaseModel):
    type: Literal["per_week"]
    target_count: int = Field(ge=1, le=7)


class PerMonthCadence(BaseModel):
    type: Literal["per_month"]
    target_count: int = Field(ge=1, le=31)


class EveryNDaysCadence(BaseModel):
    type: Literal["every_n_days"]
    n: int = Field(ge=2, le=90)


Cadence = Union[DailyCadence, PerWeekCadence, PerMonthCadence, EveryNDaysCadence]


class CadenceProgress(BaseModel):
    target: int
    completed: int
    on_track: bool
    window_label: str


def compute_cadence_progress(cadence: Cadence, completions_in_window: int) -> CadenceProgress:
    if cadence.type == "daily":
        return CadenceProgress(
            target=1, completed=completions_in_window, on_track=completions_in_window >= 1, window_label="today"
        )
    if cadence.type == "per_week":
        return CadenceProgress(
            target=cadence.target_count,
            completed=completions_in_window,
            on_track=completions_in_window >= cadence.target_count,
            window_label="this week",
        )
    if cadence.type == "per_month":
        return CadenceProgress(
            target=cadence.target_count,
            completed=completions_in_window,
            on_track=completions_in_window >= cadence.target_count,
            window_label="this month",
        )
    return CadenceProgress(
        target=1,
        completed=completions_in_window,
        on_track=completions_in_window >= 1,
        window_label=f"every {cadence.n} days",
    )


def cadence_window_start(cadence: Cadence, now: Optional[datetime] = None) -> datetime:
    now = now or datetime.now(timezone.utc)
    if cadence.type == "daily":
        return now.replace(hour=0, minute=0, second=0, microsecond=0)
    if cadence.type == "per_week":
        monday = now - timedelta(days=now.weekday())
        return monday.replace(hour=0, minute=0, second=0, microsecond=0)
    if cadence.type == "per_month":
        return now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return now - timedelta(days=cadence.n)


# --- Auth ---

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8)


class UserPublic(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None


class AuthResponse(BaseModel):
    token: str
    user: UserPublic


# --- Habits ---

class CreateHabitRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    domain: Literal["body", "mind", "discipline"]
    cadence: Cadence


class HabitPublic(BaseModel):
    id: str
    user_id: str
    name: str
    domain: str
    cadence: Cadence
    created_at: str
    archived_at: Optional[str] = None


class CompleteHabitRequest(BaseModel):
    note: Optional[str] = Field(default=None, max_length=500)


class HabitCompletionPublic(BaseModel):
    id: str
    habit_id: str
    completed_at: str
    note: Optional[str] = None


# --- Journal ---

class CreateJournalRequest(BaseModel):
    text: str = Field(min_length=1, max_length=8000)
    prompt: Optional[str] = Field(default=None, max_length=500)
    mood: Optional[int] = Field(default=None, ge=0, le=10)


class JournalEntryPublic(BaseModel):
    id: str
    user_id: str
    prompt: Optional[str] = None
    text: str
    mood: Optional[int] = None
    created_at: str


# --- Tasks (lightweight, separate from cadence habits) ---

class CreateTaskRequest(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    priority: Literal["low", "normal", "high"] = "normal"


class UpdateTaskRequest(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    priority: Optional[Literal["low", "normal", "high"]] = None
    completed: Optional[bool] = None


class TaskPublic(BaseModel):
    id: str
    user_id: str
    title: str
    priority: str
    completed: bool
    created_at: str
    completed_at: Optional[str] = None


# --- Shadow work ---

class CreateShadowRequest(BaseModel):
    text: str = Field(min_length=1, max_length=8000)
    prompt: Optional[str] = Field(default=None, max_length=500)
    themes: list[str] = Field(default_factory=list)


class UpdateShadowRequest(BaseModel):
    integrated: Optional[bool] = None
    text: Optional[str] = Field(default=None, max_length=8000)


class ShadowEntryPublic(BaseModel):
    id: str
    user_id: str
    prompt: Optional[str] = None
    text: str
    themes: list[str]
    integrated: bool
    created_at: str


# --- Voice ---

class VoiceTurnRequest(BaseModel):
    conversation_id: str
    audio_base64: str
    mime_type: str = "audio/webm"


class VoiceTurnResponse(BaseModel):
    conversation_id: str
    transcript: str
    assistant_text: str
    audio_base64: str
    audio_mime_type: str


class VoiceBriefingRequest(BaseModel):
    conversation_id: Optional[str] = None


class VoiceBriefingResponse(BaseModel):
    conversation_id: str
    assistant_text: str
    audio_base64: str
    audio_mime_type: str


# --- Coach (text-only; powers the browser-voice VoiceAssistant + AICoach) ---

class CoachReplyRequest(BaseModel):
    message: str = Field(min_length=1, max_length=4000)
    conversation_id: Optional[str] = None


class CoachBriefingRequest(BaseModel):
    conversation_id: Optional[str] = None


class CoachReplyResponse(BaseModel):
    conversation_id: str
    assistant_text: str
    source: Literal["claude", "templated"]
