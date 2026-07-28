"""
Sophia's interfaith wisdom library.

Every tradition below is presented side by side, on equal footing, as a
source of insight toward the same universal aims — compassion, discipline,
presence, purpose — rather than as competing claims to exclusive truth.
Sophia doesn't endorse one path over another; it curates what many paths
converge on.

Teachings are paraphrased in Sophia's own words rather than quoting a
specific copyrighted translation verbatim, with the original source named so
a reader can go to the primary text themselves. `reflection` is Sophia's own
addition — a short prompt connecting the teaching back to daily practice.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class WisdomEntry:
    id: str
    tradition: str  # see TRADITIONS below
    theme: str  # see THEMES below
    teaching: str
    source: str
    reflection: str


TRADITIONS = {
    "christianity": "Christianity",
    "islam": "Islam",
    "judaism": "Judaism",
    "buddhism": "Buddhism",
    "hinduism": "Hinduism",
    "taoism": "Taoism",
    "stoicism": "Stoicism",
    "modern-philosophy": "Modern Philosophy & Psychology",
}

THEMES = [
    "compassion", "discipline", "presence", "purpose", "humility",
    "gratitude", "courage", "surrender", "impermanence", "service", "suffering",
]

WISDOM_ENTRIES: list[WisdomEntry] = [
    # --- Christianity ---
    WisdomEntry(
        id="chr-1", tradition="christianity", theme="courage",
        teaching="Do not be paralyzed by fear or dismay, because you are not walking this alone.",
        source="Joshua 1:9 (paraphrase)",
        reflection="Name the thing you're avoiding out of fear. What would you do today if you trusted you weren't facing it alone?",
    ),
    WisdomEntry(
        id="chr-2", tradition="christianity", theme="compassion",
        teaching="Love is patient and kind; it does not envy, does not boast, and keeps no record of wrongs.",
        source="1 Corinthians 13:4-5 (paraphrase)",
        reflection="Is there a grudge you're quietly keeping a tally of? What would setting the ledger down look like?",
    ),
    WisdomEntry(
        id="chr-3", tradition="christianity", theme="surrender",
        teaching="Cast your anxiety onto a source larger than yourself, because you were never meant to carry it all alone.",
        source="1 Peter 5:7 (paraphrase)",
        reflection="What are you white-knuckling control over right now that you could set down, even briefly?",
    ),
    WisdomEntry(
        id="chr-4", tradition="christianity", theme="humility",
        teaching="Whoever wants to become great must first become a servant.",
        source="Matthew 20:26 (paraphrase)",
        reflection="Where in your week could you quietly serve without needing credit for it?",
    ),
    WisdomEntry(
        id="chr-5", tradition="christianity", theme="purpose",
        teaching="Everything has its season — a time to plant, and a time to harvest what was planted.",
        source="Ecclesiastes 3:1-2 (paraphrase)",
        reflection="What season are you actually in right now — planting, tending, or harvesting — and are you fighting it?",
    ),

    # --- Islam ---
    WisdomEntry(
        id="isl-1", tradition="islam", theme="gratitude",
        teaching="If you are grateful, more will be given to you; gratitude expands what you already have.",
        source="Qur'an 14:7 (paraphrase)",
        reflection="Name three things working in your life right now that you've stopped noticing.",
    ),
    WisdomEntry(
        id="isl-2", tradition="islam", theme="discipline",
        teaching="The strongest among you is not the one who overpowers others, but the one who controls himself in anger.",
        source="Hadith, Sahih al-Bukhari (paraphrase)",
        reflection="Recall the last time anger nearly spoke for you. What did the pause — or the lack of one — cost you?",
    ),
    WisdomEntry(
        id="isl-3", tradition="islam", theme="service",
        teaching="The best of people are those who bring the most benefit to others.",
        source="Hadith, various collections (paraphrase)",
        reflection="Who did your actions genuinely benefit this week, beyond yourself?",
    ),
    WisdomEntry(
        id="isl-4", tradition="islam", theme="surrender",
        teaching="Tie your camel, then place your trust in what's beyond your control.",
        source="Hadith, al-Tirmidhi (paraphrase)",
        reflection="Effort and surrender aren't opposites — where are you skipping the 'tying the camel' part and calling it faith?",
    ),
    WisdomEntry(
        id="isl-5", tradition="islam", theme="humility",
        teaching="Wealth is not measured by possessions, but by the richness of the soul.",
        source="Hadith, Sahih al-Bukhari (paraphrase)",
        reflection="If soul-richness were the metric, would you call yourself wealthy right now?",
    ),

    # --- Judaism ---
    WisdomEntry(
        id="jud-1", tradition="judaism", theme="purpose",
        teaching="You are not obligated to complete the work, but neither are you free to abandon it.",
        source="Pirkei Avot 2:16 (paraphrase)",
        reflection="What long project have you quietly given up on because you couldn't see the end? Pick it back up for one hour.",
    ),
    WisdomEntry(
        id="jud-2", tradition="judaism", theme="compassion",
        teaching="What is hateful to you, do not do to another — that is the whole of the law; the rest is commentary.",
        source="Talmud, Shabbat 31a, attributed to Hillel (paraphrase)",
        reflection="Run today's hardest decision through that single filter before anything more complicated.",
    ),
    WisdomEntry(
        id="jud-3", tradition="judaism", theme="presence",
        teaching="If not now, when?",
        source="Pirkei Avot 1:14, attributed to Hillel (paraphrase)",
        reflection="What are you postponing until a 'better moment' that will never arrive on its own?",
    ),
    WisdomEntry(
        id="jud-4", tradition="judaism", theme="discipline",
        teaching="Who is strong? The one who subdues their own inclinations.",
        source="Pirkei Avot 4:1 (paraphrase)",
        reflection="Which inclination did you subdue today — and which one subdued you?",
    ),
    WisdomEntry(
        id="jud-5", tradition="judaism", theme="gratitude",
        teaching="Give thanks for a small portion as you would for a large one — the posture of gratitude matters more than the size of the gift.",
        source="Mishnah, Berakhot 9 (paraphrase)",
        reflection="Practice gratitude for something small and unremarkable today, on purpose.",
    ),

    # --- Buddhism ---
    WisdomEntry(
        id="bud-1", tradition="buddhism", theme="impermanence",
        teaching="All conditioned things are impermanent — seeing this clearly is the path past suffering.",
        source="Dhammapada 277 (paraphrase)",
        reflection="What are you gripping as if it were permanent that was always going to change?",
    ),
    WisdomEntry(
        id="bud-2", tradition="buddhism", theme="presence",
        teaching="The mind is everything; what you dwell on, you become.",
        source="Dhammapada 1 (paraphrase)",
        reflection="What has your mind been dwelling on today, uninvited? Notice it without fighting it.",
    ),
    WisdomEntry(
        id="bud-3", tradition="buddhism", theme="compassion",
        teaching="Hatred is never appeased by hatred; it is appeased only by loving-kindness — this is an eternal law.",
        source="Dhammapada 5 (paraphrase)",
        reflection="Is there a conflict you're trying to win by matching its intensity? What would de-escalating cost you, really?",
    ),
    WisdomEntry(
        id="bud-4", tradition="buddhism", theme="discipline",
        teaching="However many holy words you read, however many you speak, what good do they do if you do not act on them?",
        source="Dhammapada 19 (paraphrase)",
        reflection="Which piece of wisdom have you understood intellectually for years but never actually practiced?",
    ),
    WisdomEntry(
        id="bud-5", tradition="buddhism", theme="suffering",
        teaching="Pain is inevitable; the suffering added on top of it by resistance is optional.",
        source="Sallatha Sutta (paraphrase; the 'two arrows' teaching)",
        reflection="Where are you adding a second arrow — resentment, self-pity, story — on top of a pain that's already there?",
    ),

    # --- Hinduism ---
    WisdomEntry(
        id="hin-1", tradition="hinduism", theme="discipline",
        teaching="You have a right to your actions, never to the fruits of those actions — act without attachment to the outcome.",
        source="Bhagavad Gita 2:47 (paraphrase)",
        reflection="What would today's effort look like if you released your grip on how it turns out?",
    ),
    WisdomEntry(
        id="hin-2", tradition="hinduism", theme="purpose",
        teaching="It is better to fail at your own path than to succeed at imitating someone else's.",
        source="Bhagavad Gita 3:35 (paraphrase, 'svadharma')",
        reflection="Whose path are you quietly imitating instead of walking your own?",
    ),
    WisdomEntry(
        id="hin-3", tradition="hinduism", theme="surrender",
        teaching="The one who sees themselves in all beings, and all beings in themselves, sees truly.",
        source="Bhagavad Gita 6:29 (paraphrase)",
        reflection="Who did you see today as fundamentally 'other' — and what changes if you don't?",
    ),
    WisdomEntry(
        id="hin-4", tradition="hinduism", theme="presence",
        teaching="Even a moment's steady practice of stillness is worth more than years of a wandering mind.",
        source="Yoga Sutras of Patanjali, tradition summary (paraphrase)",
        reflection="Give the next five minutes your undivided attention, on purpose, before you move on.",
    ),
    WisdomEntry(
        id="hin-5", tradition="hinduism", theme="humility",
        teaching="Truth is one; the wise call it by many names.",
        source="Rig Veda 1.164.46 (paraphrase, 'Ekam Sat')",
        reflection="Where has certainty about being right made you less curious about someone else's experience?",
    ),

    # --- Taoism ---
    WisdomEntry(
        id="tao-1", tradition="taoism", theme="surrender",
        teaching="Nature does not hurry, yet everything is accomplished.",
        source="Tao Te Ching, attributed maxim in the spirit of Laozi (paraphrase)",
        reflection="What are you forcing today that would resolve better if you simply let it move at its own pace?",
    ),
    WisdomEntry(
        id="tao-2", tradition="taoism", theme="humility",
        teaching="Knowing others is intelligence; knowing yourself is true wisdom.",
        source="Tao Te Ching, Ch. 33 (paraphrase)",
        reflection="What's one thing about yourself you learned this month that surprised you?",
    ),
    WisdomEntry(
        id="tao-3", tradition="taoism", theme="discipline",
        teaching="A journey of a thousand miles begins with a single step.",
        source="Tao Te Ching, Ch. 64 (paraphrase)",
        reflection="Stop planning the whole journey for a moment. What's the one step available to you right now?",
    ),
    WisdomEntry(
        id="tao-4", tradition="taoism", theme="presence",
        teaching="Water is soft and yielding, yet nothing is better at wearing down what is hard and rigid.",
        source="Tao Te Ching, Ch. 78 (paraphrase)",
        reflection="Where is rigid force failing you, when patience and yielding might actually win?",
    ),
    WisdomEntry(
        id="tao-5", tradition="taoism", theme="purpose",
        teaching="When you accept yourself, the whole world accepts you.",
        source="Tao Te Ching, attributed maxim in the spirit of Laozi (paraphrase)",
        reflection="What part of yourself are you still negotiating acceptance with?",
    ),

    # --- Stoicism ---
    WisdomEntry(
        id="sto-1", tradition="stoicism", theme="discipline",
        teaching="You have power over your mind, not outside events. Realize this, and you will find strength.",
        source="Marcus Aurelius, Meditations",
        reflection="Sort today's stress into 'mine to control' and 'not mine to control.' Only act on the first column.",
    ),
    WisdomEntry(
        id="sto-2", tradition="stoicism", theme="surrender",
        teaching="It is not what happens to you, but how you react to it that matters.",
        source="Epictetus, Enchiridion",
        reflection="Replay a recent frustration. What was the event, and what was purely your interpretation of it?",
    ),
    WisdomEntry(
        id="sto-3", tradition="stoicism", theme="impermanence",
        teaching="You could leave life right now — let that determine what you do and say and think.",
        source="Marcus Aurelius, Meditations",
        reflection="If today were unambiguously important, what would you stop postponing?",
    ),
    WisdomEntry(
        id="sto-4", tradition="stoicism", theme="humility",
        teaching="The impediment to action advances action; what stands in the way becomes the way.",
        source="Marcus Aurelius, Meditations",
        reflection="What obstacle are you currently resenting that could instead become the actual training ground?",
    ),
    WisdomEntry(
        id="sto-5", tradition="stoicism", theme="courage",
        teaching="Wealth consists not in having great possessions, but in having few wants.",
        source="Epictetus, Enchiridion",
        reflection="Name one want driving your stress that, if released, would make you instantly more free.",
    ),

    # --- Modern philosophy & psychology ---
    WisdomEntry(
        id="mod-1", tradition="modern-philosophy", theme="purpose",
        teaching="Those who have a why to live can bear with almost any how.",
        source="Viktor Frankl, Man's Search for Meaning (1946)",
        reflection="State your 'why' for the hardest thing on your plate this week, in one sentence.",
    ),
    WisdomEntry(
        id="mod-2", tradition="modern-philosophy", theme="courage",
        teaching="One must imagine that even a life spent pushing a boulder uphill forever can be a happy one, if it is fully embraced.",
        source="Albert Camus, The Myth of Sisyphus (1942, paraphrase)",
        reflection="What repetitive, thankless task in your life could you choose to embrace rather than merely endure?",
    ),
    WisdomEntry(
        id="mod-3", tradition="modern-philosophy", theme="discipline",
        teaching="We are what we repeatedly do; excellence, then, is not an act but a habit.",
        source="Attributed to Aristotle via Will Durant's summary, Nicomachean Ethics",
        reflection="What's one small repeated action, done consistently, that would compound into who you want to become?",
    ),
    WisdomEntry(
        id="mod-4", tradition="modern-philosophy", theme="presence",
        teaching="Between stimulus and response there is a space; in that space is our power to choose our response.",
        source="Attributed to Viktor Frankl in later psychological literature",
        reflection="Notice your next reactive impulse today, and try to actually find that space before you act.",
    ),
    WisdomEntry(
        id="mod-5", tradition="modern-philosophy", theme="compassion",
        teaching="A person is a person through other persons — none of us becomes fully human alone.",
        source="Ubuntu philosophy, southern African tradition, as articulated by Desmond Tutu",
        reflection="Whose growth are you tangled up with right now, whether you acknowledge it or not?",
    ),
]


def entries_by_tradition(tradition: str) -> list[WisdomEntry]:
    return [e for e in WISDOM_ENTRIES if e.tradition == tradition]


def entries_by_theme(theme: str) -> list[WisdomEntry]:
    return [e for e in WISDOM_ENTRIES if e.theme == theme]


def daily_entry(day_of_year: int) -> WisdomEntry:
    return WISDOM_ENTRIES[day_of_year % len(WISDOM_ENTRIES)]
