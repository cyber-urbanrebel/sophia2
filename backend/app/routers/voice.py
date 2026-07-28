import base64
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from app.config import HAS_VOICE_PIPELINE
from app.db import get_session
from app.deps import get_current_user_id
from app.routers.habits import get_all_progress_for_user
from app.schemas import VoiceBriefingRequest, VoiceBriefingResponse, VoiceTurnRequest, VoiceTurnResponse
from app.services.voice.pipeline import get_llm_provider, get_stt_provider, get_tts_provider

router = APIRouter(prefix="/api/voice", tags=["voice"])

# Rough guardrail: ~2MB is roughly 60-90s of webm/opus. Rejects a stuck
# client mic instead of tying up a request indefinitely.
MAX_AUDIO_BYTES = 2 * 1024 * 1024

_NOT_CONFIGURED_DETAIL = (
    "voice_pipeline_not_configured: this endpoint needs OPENAI_API_KEY and "
    "ELEVENLABS_API_KEY set on the backend. The app works without them — the "
    "frontend uses the browser's built-in speech recognition/synthesis via "
    "/api/coach/reply and /api/coach/briefing instead."
)


@router.post("/turn", response_model=VoiceTurnResponse)
async def voice_turn(body: VoiceTurnRequest, _user_id: str = Depends(get_current_user_id)):
    if not HAS_VOICE_PIPELINE:
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail=_NOT_CONFIGURED_DETAIL)

    audio_bytes = base64.b64decode(body.audio_base64)
    if len(audio_bytes) > MAX_AUDIO_BYTES:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="audio_too_large")

    try:
        transcript = await get_stt_provider().transcribe(audio_bytes, body.mime_type)
        if not transcript:
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, detail="empty_transcript")

        assistant_text = await get_llm_provider().reply(body.conversation_id, transcript)
        audio, audio_mime_type = await get_tts_provider().synthesize(assistant_text)

        return VoiceTurnResponse(
            conversation_id=body.conversation_id,
            transcript=transcript,
            assistant_text=assistant_text,
            audio_base64=base64.b64encode(audio).decode("ascii"),
            audio_mime_type=audio_mime_type,
        )
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001 - voice pipeline has 3 external legs, surface any failure uniformly
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=f"voice_pipeline_failed: {exc}")


@router.post("/briefing", response_model=VoiceBriefingResponse)
async def voice_briefing(
    body: VoiceBriefingRequest,
    user_id: str = Depends(get_current_user_id),
    session: Session = Depends(get_session),
):
    """Studio-quality voice briefing. Requires the full paid pipeline — use
    /api/coach/briefing instead for the free, always-available text version
    the frontend speaks via the browser."""
    if not HAS_VOICE_PIPELINE:
        raise HTTPException(status.HTTP_501_NOT_IMPLEMENTED, detail=_NOT_CONFIGURED_DETAIL)

    conversation_id = body.conversation_id or str(uuid.uuid4())
    rows = get_all_progress_for_user(session, user_id)
    if not rows:
        status_summary = "The user has no habits tracked yet."
    else:
        lines = [
            f"- {r['habit'].name} ({r['habit'].domain}): {r['progress'].completed}/{r['progress'].target} "
            f"{r['progress'].window_label}, {'on track' if r['progress'].on_track else 'behind'}"
            for r in rows
        ]
        status_summary = "Current habit status:\n" + "\n".join(lines)

    briefing_prompt = (
        f"{status_summary}\n\n"
        "Give the user a short spoken status briefing (2-3 sentences) opening "
        "the session, Jarvis-style. Call out anything behind, and anything "
        "worth a quick nod of approval. Don't just read the list back."
    )

    try:
        assistant_text = await get_llm_provider().reply(conversation_id, briefing_prompt)
        audio, audio_mime_type = await get_tts_provider().synthesize(assistant_text)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status.HTTP_502_BAD_GATEWAY, detail=f"voice_pipeline_failed: {exc}")

    return VoiceBriefingResponse(
        conversation_id=conversation_id,
        assistant_text=assistant_text,
        audio_base64=base64.b64encode(audio).decode("ascii"),
        audio_mime_type=audio_mime_type,
    )
