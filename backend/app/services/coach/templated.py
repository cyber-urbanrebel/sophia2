"""
Zero-cost grounded coach: no live LLM call, just structured reasoning driven
by the user's real habit/journal/shadow data plus Sophia's own knowledge base
and interfaith wisdom library. This is what runs automatically whenever no
real ANTHROPIC_API_KEY is configured — see app/services/coach/provider.py —
so the coach always says something specific and true rather than nothing at
all, or a generic "keep going!" platitude.
"""

from app.data.knowledge_base import framework_by_domain
from app.data.wisdom_library import entries_by_theme


class TemplatedCoachProvider:
    def briefing(self, progress_rows: list[dict]) -> str:
        if not progress_rows:
            return (
                "Systems nominal. No habits tracked yet — set your first one in Body, "
                "Mind, or Discipline, and I'll start giving you real status reports "
                "instead of small talk."
            )
        behind = [r for r in progress_rows if not r["progress"].on_track]
        on_track = [r for r in progress_rows if r["progress"].on_track]
        if not behind:
            return f"Systems nominal. All {len(progress_rows)} habits are on track — clean sweep, keep the rhythm."

        names = ", ".join(r["habit"].name for r in behind[:3])
        extra = f" and {len(behind) - 3} more" if len(behind) > 3 else ""
        return (
            f"Status report: {len(on_track)} of {len(progress_rows)} habits on track. "
            f"Behind on {names}{extra}. Nothing urgent — just naming it before you ask."
        )

    def reply(self, message: str, progress_rows: list[dict]) -> str:
        text = message.lower().strip()
        behind = [r for r in progress_rows if not r["progress"].on_track]

        if any(w in text for w in ["stuck", "can't", "cant", "struggl", "not doing", "failing"]):
            fogg = framework_by_domain("discipline")
            lever = fogg[0] if fogg else None
            base = (
                "When something isn't happening, it's almost never a lack of willpower — "
                "it's usually that the action is too big (Ability) or there's no fixed "
                "trigger for it (Prompt)."
            )
            if behind:
                base += f" Right now that's showing up in {behind[0]['habit'].name} specifically."
            if lever:
                base += f" Related idea: {lever.name} — {lever.summary}"
            return base

        if any(w in text for w in ["shadow", "afraid", "fear", "avoid", "ashamed", "shame"]):
            return (
                "That's shadow territory — the Shadow tab is built for exactly this: naming "
                "what usually runs unexamined. Jung's framing is that what you don't look at "
                "doesn't go away, it just steers from the dark. I won't pretend to replace "
                "real support if this is heavy — but naming it there is a real first step."
            )

        if any(w in text for w in ["purpose", "meaning", "why", "point of", "lost"]):
            entries = entries_by_theme("purpose")
            if entries:
                e = entries[hash(text) % len(entries)]
                return f'{e.teaching} — {e.source}. Reflect: {e.reflection}'
            return "Purpose usually clarifies through action, not analysis — pick the smallest true step and take it."

        if any(w in text for w in ["progress", "how am i doing", "status", "update"]):
            return self.briefing(progress_rows)

        if any(w in text for w in ["thank", "thanks"]):
            return "Anytime. That's what I'm here for."

        # Default: reflect the message back with a grounded nudge instead of
        # a canned non-answer.
        if behind:
            return (
                f"Noted. While you're here — {behind[0]['habit'].name} is behind "
                f"{behind[0]['progress'].window_label}. Want to talk through what's "
                "blocking it, or would you rather I just leave it alone?"
            )
        return (
            "I'm running on the free templated coach right now (no live AI key "
            "configured), so I reason from your real data rather than holding an "
            "open-ended conversation. Ask me about your progress, purpose, or what's "
            "got you stuck — or add a real ANTHROPIC_API_KEY on the backend for full "
            "conversation."
        )
