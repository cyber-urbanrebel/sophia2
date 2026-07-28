from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user_id
from app.models import Habit, HabitCompletion
from app.schemas import (
    Cadence,
    CompleteHabitRequest,
    CreateHabitRequest,
    HabitCompletionPublic,
    HabitPublic,
    cadence_window_start,
    compute_cadence_progress,
)
from pydantic import TypeAdapter

router = APIRouter(prefix="/api/habits", tags=["habits"])

_cadence_adapter: TypeAdapter[Cadence] = TypeAdapter(Cadence)


def _to_public(habit: Habit) -> HabitPublic:
    return HabitPublic(
        id=habit.id,
        user_id=habit.user_id,
        name=habit.name,
        domain=habit.domain,
        cadence=_cadence_adapter.validate_json(habit.cadence_json),
        created_at=habit.created_at,
        archived_at=habit.archived_at,
    )


def get_all_progress_for_user(session: Session, user_id: str) -> list[dict]:
    """Shared with the coach/voice briefing endpoints so status reports are
    grounded in the same numbers the Progress page shows."""
    habits = session.exec(
        select(Habit).where(Habit.user_id == user_id, Habit.archived_at.is_(None))  # type: ignore[union-attr]
    ).all()

    results = []
    for habit in habits:
        cadence = _cadence_adapter.validate_json(habit.cadence_json)
        window_start = cadence_window_start(cadence)
        completions = session.exec(select(HabitCompletion).where(HabitCompletion.habit_id == habit.id)).all()
        count = sum(1 for c in completions if c.completed_at >= window_start.isoformat())
        progress = compute_cadence_progress(cadence, count)
        results.append({"habit": _to_public(habit), "progress": progress})
    return results


@router.post("", response_model=HabitPublic, status_code=status.HTTP_201_CREATED)
def create_habit(
    body: CreateHabitRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    habit = Habit(
        user_id=user_id,
        name=body.name,
        domain=body.domain,
        cadence_json=body.cadence.model_dump_json(),
    )
    session.add(habit)
    session.commit()
    session.refresh(habit)
    return _to_public(habit)


@router.get("", response_model=list[HabitPublic])
def list_habits(user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    habits = session.exec(
        select(Habit).where(Habit.user_id == user_id, Habit.archived_at.is_(None))  # type: ignore[union-attr]
    ).all()
    return [_to_public(h) for h in habits]


@router.get("/stats")
def habit_stats(user_id: str = Depends(get_current_user_id), session: Session = Depends(get_session)):
    rows = get_all_progress_for_user(session, user_id)
    on_track = sum(1 for r in rows if r["progress"].on_track)
    return {
        "total": len(rows),
        "completed": on_track,
        "behind": len(rows) - on_track,
    }


@router.post("/{habit_id}/complete", response_model=HabitCompletionPublic, status_code=status.HTTP_201_CREATED)
def complete_habit(
    habit_id: str,
    body: CompleteHabitRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="habit_not_found")

    completion = HabitCompletion(habit_id=habit_id, note=body.note)
    session.add(completion)
    session.commit()
    session.refresh(completion)
    return HabitCompletionPublic(
        id=completion.id, habit_id=completion.habit_id, completed_at=completion.completed_at, note=completion.note
    )


@router.get("/{habit_id}/progress")
def habit_progress(
    habit_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    habit = session.get(Habit, habit_id)
    if not habit or habit.user_id != user_id:
        raise HTTPException(status.HTTP_404_NOT_FOUND, detail="habit_not_found")

    cadence = _cadence_adapter.validate_json(habit.cadence_json)
    window_start = cadence_window_start(cadence)

    completions = session.exec(
        select(HabitCompletion).where(HabitCompletion.habit_id == habit_id)
    ).all()
    count = sum(1 for c in completions if c.completed_at >= window_start.isoformat())

    return compute_cadence_progress(cadence, count)
