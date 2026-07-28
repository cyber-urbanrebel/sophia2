from typing import Protocol


class SttProvider(Protocol):
    async def transcribe(self, audio: bytes, mime_type: str) -> str: ...


class TtsProvider(Protocol):
    async def synthesize(self, text: str) -> tuple[bytes, str]: ...  # (audio_bytes, mime_type)


class LlmProvider(Protocol):
    async def reply(self, conversation_id: str, user_text: str) -> str: ...
