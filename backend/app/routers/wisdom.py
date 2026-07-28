from dataclasses import asdict
from datetime import datetime, timezone

from fastapi import APIRouter, Query

from app.data.wisdom_library import THEMES, TRADITIONS, WISDOM_ENTRIES, daily_entry

router = APIRouter(prefix="/api/wisdom", tags=["wisdom"])


@router.get("")
def list_wisdom(
    tradition: str | None = Query(default=None),
    theme: str | None = Query(default=None),
    search: str | None = Query(default=None),
):
    entries = WISDOM_ENTRIES
    if tradition:
        entries = [e for e in entries if e.tradition == tradition]
    if theme:
        entries = [e for e in entries if e.theme == theme]
    if search:
        needle = search.lower()
        entries = [e for e in entries if needle in e.teaching.lower() or needle in e.source.lower()]
    return {
        "traditions": TRADITIONS,
        "themes": THEMES,
        "entries": [asdict(e) for e in entries],
    }


@router.get("/daily")
def wisdom_of_the_day():
    day_of_year = datetime.now(timezone.utc).timetuple().tm_yday
    return asdict(daily_entry(day_of_year))
