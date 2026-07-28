"""
Lazily-constructed singletons for each optional AI leg. Each getter is
independent — the LLM (text coaching) can be live from just an Anthropic
key with no OpenAI/ElevenLabs keys at all, since the frontend already
handles STT/TTS for free via the browser's Web Speech API. Whether each is
actually usable is decided by the caller via app.config.HAS_* flags — these
getters just construct the client, they don't validate the key.
"""

from app.config import settings
from app.services.voice.llm_claude import ClaudeLlmProvider
from app.services.voice.stt_whisper import WhisperSttProvider
from app.services.voice.tts_elevenlabs import ElevenLabsTtsProvider

_llm: ClaudeLlmProvider | None = None
_stt: WhisperSttProvider | None = None
_tts: ElevenLabsTtsProvider | None = None


def get_llm_provider() -> ClaudeLlmProvider:
    global _llm
    if _llm is None:
        _llm = ClaudeLlmProvider(settings.anthropic_api_key, settings.anthropic_model)
    return _llm


def get_stt_provider() -> WhisperSttProvider:
    global _stt
    if _stt is None:
        _stt = WhisperSttProvider(settings.openai_api_key)
    return _stt


def get_tts_provider() -> ElevenLabsTtsProvider:
    global _tts
    if _tts is None:
        _tts = ElevenLabsTtsProvider(settings.elevenlabs_api_key, settings.elevenlabs_voice_id)
    return _tts
