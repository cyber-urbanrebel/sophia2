from typing import Literal

from app.config import HAS_ANTHROPIC
from app.services.coach.templated import TemplatedCoachProvider
from app.services.voice.pipeline import get_llm_provider

_templated = TemplatedCoachProvider()


def coach_source() -> Literal["claude", "templated"]:
    return "claude" if HAS_ANTHROPIC else "templated"


def get_templated_coach() -> TemplatedCoachProvider:
    return _templated


__all__ = ["coach_source", "get_templated_coach", "get_llm_provider"]
