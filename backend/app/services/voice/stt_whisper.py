import httpx


class WhisperSttProvider:
    """Swap for Deepgram/local whisper.cpp by implementing the SttProvider
    protocol and changing the wiring in services/voice/pipeline.py — nothing
    else changes. Not used by default: the frontend runs the browser's
    built-in SpeechRecognition for free. This exists as the upgrade path
    once a real OPENAI_API_KEY is added."""

    def __init__(self, api_key: str):
        self._api_key = api_key

    async def transcribe(self, audio: bytes, mime_type: str) -> str:
        ext = "webm" if "webm" in mime_type else "wav" if "wav" in mime_type else "m4a"
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {self._api_key}"},
                files={"file": (f"audio.{ext}", audio, mime_type)},
                data={"model": "whisper-1"},
            )
        response.raise_for_status()
        return response.json()["text"].strip()
