import httpx


class ElevenLabsTtsProvider:
    """Swap for OpenAI TTS or another provider by implementing the
    TtsProvider protocol. Not used by default: the frontend uses the
    browser's built-in speechSynthesis for free. This exists as the upgrade
    path once a real ELEVENLABS_API_KEY is added."""

    def __init__(self, api_key: str, voice_id: str = "21m00Tcm4TlvDq8ikWAM"):
        self._api_key = api_key
        self._voice_id = voice_id

    async def synthesize(self, text: str) -> tuple[bytes, str]:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"https://api.elevenlabs.io/v1/text-to-speech/{self._voice_id}",
                headers={
                    "xi-api-key": self._api_key,
                    "Content-Type": "application/json",
                    "Accept": "audio/mpeg",
                },
                json={
                    "text": text,
                    "model_id": "eleven_turbo_v2_5",
                    "voice_settings": {"stability": 0.45, "similarity_boost": 0.75},
                },
            )
        response.raise_for_status()
        return response.content, "audio/mpeg"
