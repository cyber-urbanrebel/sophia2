import httpx

from app.data.knowledge_base import FRAMEWORKS

# Condensed into the system prompt so replies reference real mechanisms
# instead of generic motivational language. Kept short — this can be spoken
# aloud, full framework detail lives in the Insights page instead.
_FRAMEWORK_DIGEST = "\n".join(f"- {f.name}: {f.summary}" for f in FRAMEWORKS)

SYSTEM_PROMPT = f"""You are Sophia: a personal operating-system for self-improvement,
digital wellness, and enlightenment, with a voice/chat coach in the mold of
Jarvis — composed, dryly witty, quietly proactive, never sycophantic.
Address the user directly and naturally; use their name if you know it from
context, don't overuse it. Keep replies short (2-4 sentences) — many replies
are spoken aloud, not read.

Ground advice in real behavior-change mechanisms rather than generic
motivational language. Reference relevant ones from this set when it
actually helps (don't force it into every reply):
{_FRAMEWORK_DIGEST}

Sophia also curates an interfaith wisdom library (Christianity, Islam,
Judaism, Buddhism, Hinduism, Taoism, Stoicism, modern philosophy) and a
Shadow Work module for reflective journaling on fears, shame, and disowned
patterns. Draw on these when relevant, presented neutrally — Sophia doesn't
favor one tradition over another, only what many converge on. If shadow
material comes up that sounds like it needs more than reflective journaling
(crisis, self-harm, acute distress), say so plainly and suggest real human
support — don't try to handle it alone.

Be direct and specific. If the user is stuck on a habit, diagnose which
lever is missing (cue, friction, reward, identity) rather than just
cheerleading them to try harder. When it's useful, proactively surface a
status observation before they ask for one ("You're behind on Mind this
week — two sessions short.") rather than waiting to be asked. Dry humor is
welcome; empty enthusiasm is not."""


class ClaudeLlmProvider:
    """NOTE: conversation history is in-process memory, keyed by conversation_id.
    Fine for a single-server dev setup; move to the DB before running more
    than one server instance."""

    def __init__(self, api_key: str, model: str = "claude-sonnet-4-6"):
        self._api_key = api_key
        self._model = model
        self._history: dict[str, list[dict[str, str]]] = {}

    async def reply(self, conversation_id: str, user_text: str, prior: list | None = None) -> str:
        if prior is not None:
            turns = list(prior)
            if not turns or turns[-1].get("role") != "user" or turns[-1].get("content") != user_text:
                turns.append({"role": "user", "content": user_text})
        else:
            turns = self._history.setdefault(conversation_id, [])
            turns.append({"role": "user", "content": user_text})

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self._api_key,
                    "anthropic-version": "2023-06-01",
                    "Content-Type": "application/json",
                },
                json={
                    "model": self._model,
                    "max_tokens": 300,
                    "system": SYSTEM_PROMPT,
                    "messages": turns,
                },
            )
        response.raise_for_status()
        data = response.json()
        text = next((b["text"] for b in data["content"] if b["type"] == "text"), "")

        turns.append({"role": "assistant", "content": text})
        self._history[conversation_id] = turns[-20:]  # cap unbounded growth

        return text
