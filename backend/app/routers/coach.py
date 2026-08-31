import uuid

from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_current_user_id
from app.models import CoachMessage
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


def _load_turns(session: Session, user_id: str, conversation_id: str) -> list[dict[str, str]]:
    rows = session.exec(
        select(CoachMessage)
        .where(CoachMessage.user_id == user_id, CoachMessage.conversation_id == conversation_id)
        .order_by(CoachMessage.created_at)
    ).all()
    return [{"role": row.role, "content": row.content} for row in rows][-20:]


def _save_turn(session: Session, user_id: str, conversation_id: str, role: str, content: str) -> None:
    session.add(
        CoachMessage(
            user_id=user_id,
            conversation_id=conversation_id,
            role=role,
            content=content,
        )
    )
    session.commit()


@router.get("/history")
def coach_history(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    rows = session.exec(
        select(CoachMessage)
        .where(CoachMessage.user_id == user_id, CoachMessage.conversation_id == conversation_id)
        .order_by(CoachMessage.created_at)
    ).all()
    return {
        "conversation_id": conversation_id,
        "messages": [
            {"id": row.id, "role": row.role, "content": row.content, "created_at": row.created_at}
            for row in rows
        ],
    }


@router.post("/briefing", response_model=CoachReplyResponse)
async def coach_briefing(
    body: CoachBriefingRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    conversation_id = body.conversation_id or str(uuid.uuid4())
    progress_rows = get_all_progress_for_user(session, user_id)
    source = coach_source()
    prior = _load_turns(session, user_id, conversation_id)

    if source == "claude":
        prompt = (
            f"{_status_summary(progress_rows)}\n\n"
            "Give the user a short spoken status briefing (2-3 sentences) opening "
            "the session. Call out anything behind, and anything worth a quiet nod. "
            "Do not just read the list back."
        )
        text = await get_llm_provider().reply(conversation_id, prompt, prior=prior)
    else:
        text = get_templated_coach().briefing(progress_rows)

    _save_turn(session, user_id, conversation_id, "assistant", text)
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
    _save_turn(session, user_id, conversation_id, "user", body.message)
    prior = _load_turns(session, user_id, conversation_id)

    if source == "claude":
        prompt = f"{_status_summary(progress_rows)}\n\nUser: {body.message}"
        text = await get_llm_provider().reply(conversation_id, prompt, prior=prior)
    else:
        text = get_templated_coach().reply(body.message, progress_rows)

    _save_turn(session, user_id, conversation_id, "assistant", text)
    return CoachReplyResponse(conversation_id=conversation_id, assistant_text=text, source=source)
