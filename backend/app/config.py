from pydantic_settings import BaseSettings

# Values that mean "no real key was provided" — either genuinely empty, or a
# leftover placeholder from a template .env. Checked with has_real_key()
# before any provider tries to use a key, so the app degrades gracefully
# instead of crashing on boot or failing every request with a 401 from the
# provider's API.
_PLACEHOLDER_PREFIXES = ("your-", "changeme", "change-me", "xxx", "sk-placeholder")


def has_real_key(value: str | None) -> bool:
    if not value:
        return False
    normalized = value.strip().lower()
    if not normalized:
        return False
    return not any(normalized.startswith(p) for p in _PLACEHOLDER_PREFIXES)


class Settings(BaseSettings):
    port: int = 3001
    web_origin: str = "http://localhost:5173"
    database_path: str = "./sophia.db"
    jwt_secret: str = "sophia-dev-secret-change-me"
    jwt_expire_minutes: int = 60 * 24 * 30  # 30 days

    # All AI keys are optional. Sophia runs fully — auth, habits, journal,
    # shadow work, wisdom library, and a grounded coach — with none of them
    # set. See app/services/coach/provider.py and app/services/voice/pipeline.py
    # for the fallback logic this enables.
    openai_api_key: str = ""
    elevenlabs_api_key: str = ""
    elevenlabs_voice_id: str = "21m00Tcm4TlvDq8ikWAM"
    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    class Config:
        env_file = ".env"


settings = Settings()

# Convenience flags computed once at import time.
HAS_ANTHROPIC = has_real_key(settings.anthropic_api_key)
HAS_OPENAI = has_real_key(settings.openai_api_key)
HAS_ELEVENLABS = has_real_key(settings.elevenlabs_api_key)
HAS_VOICE_PIPELINE = HAS_OPENAI and HAS_ELEVENLABS and HAS_ANTHROPIC
