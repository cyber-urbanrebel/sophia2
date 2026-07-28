import uuid

from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.db import get_session
from app.deps import get_current_user_id
from app.routers.habits import get_all_progress_for_user
from app.schemas import CoachBriefingRequest, CoachReplyRequest, CoachReplyResponse
from app.services.coach.provider import coach_source, get_llm_provider, get_templated_coach

router = APIRouter(prefix="/api/coach", tags=["coach"])


def _status_summary(progress_rows: list[dict]) -> str:
    if not progress_rows:
        return "The user has no habits tracked yet."
    lines = [
        f"- {r['habit'].name} ({r['habit'].domain}): {r['progress'].completed}/{r['progress'].target} "
        f"{r['progress'].window_label}, {'on track' if r['progress'].on_track else 'behind'}"
        for r in progress_rows
    ]
    return "Current habit status:\n" + "\n".join(lines)


@router.post("/briefing", response_model=CoachReplyResponse)
async def coach_briefing(
    body: CoachBriefingRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Proactive status briefing grounded in the same numbers the Progress
    page shows — fires when the Voice tab opens or the AI Coach is first
    opened, so it greets with something true rather than small talk."""
    conversation_id = body.conversation_id or str(uuid.uuid4())
    progress_rows = get_all_progress_for_user(session, user_id)
    source = coach_source()

    if source == "claude":
        prompt = (
            f"{_status_summary(progress_rows)}\n\n"
            "Give the user a short spoken status briefing (2-3 sentences) opening "
            "the session, Jarvis-style. Call out anything behind, and anything "
            "worth a quick nod of approval. Don't just read the list back."
        )
        text = await get_llm_provider().reply(conversation_id, prompt)
    else:
        text = get_templated_coach().briefing(progress_rows)

    return CoachReplyResponse(conversation_id=conversation_id, assistant_text=text, source=source)


@router.post("/reply", response_model=CoachReplyResponse)
async def coach_reply(
    body: CoachReplyRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    conversation_id = body.conversation_id or str(uuid.uuid4())
    progress_rows = get_all_progress_for_user(session, user_id)
    source = coach_source()

    if source == "claude":
        prompt = f"{_status_summary(progress_rows)}\n\nUser: {body.message}"
        text = await get_llm_provider().reply(conversation_id, prompt)
    else:
        text = get_templated_coach().reply(body.message, progress_rows)

    return CoachReplyResponse(conversation_id=conversation_id, assistant_text=text, source=source)
