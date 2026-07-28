"""
Sophia's self-improvement knowledge base.

A condensed synthesis of well-established behavior-change research, written
in our own words, feeding both the Insights page (browsable reference) and
the coach's grounding context (app/services/coach). Every entry cites the
originating researcher/book so the user can go read the primary source
instead of relying on a paraphrase.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Framework:
    id: str
    name: str
    category: str  # "habit_formation" | "motivation" | "attention" | "identity" | "environment"
    source: str
    summary: str
    mechanism: str
    how_sophia_uses_it: str
    caveats: str


FRAMEWORKS: list[Framework] = [
    Framework(
        id="habit-loop",
        name="The Habit Loop (Cue-Routine-Reward)",
        category="habit_formation",
        source="Charles Duhigg, The Power of Habit (2012); rooted in earlier operant conditioning research",
        summary=(
            "Habits form as a three-part loop: a cue triggers a craving, a routine "
            "resolves it, and a reward reinforces the loop so the brain repeats it "
            "with less conscious effort over time."
        ),
        mechanism=(
            "Repetition under a stable cue shifts control from the prefrontal cortex "
            "(deliberate choice) to the basal ganglia (automatic pattern), which is "
            "why established habits feel effortless while new ones feel like willpower."
        ),
        how_sophia_uses_it=(
            "Habit creation asks for cadence, not just a name, because a vague habit "
            "with no fixed cue rarely automates. Pair a new habit with an existing "
            "routine (habit stacking, below) rather than an isolated intention."
        ),
        caveats="A missing or inconsistent cue is the most common reason a habit never automates — not lack of willpower.",
    ),
    Framework(
        id="atomic-habits-identity",
        name="Identity-Based Habits",
        category="identity",
        source="James Clear, Atomic Habits (2018)",
        summary=(
            "Outcome-based goals ('lose 10 lbs') are less durable than identity-based "
            "ones ('I am someone who trains'). Each completed action is treated as a "
            "vote for the identity you're building."
        ),
        mechanism=(
            "Behavior aligned with self-concept requires less ongoing negotiation with "
            "yourself; once 'runner' is part of identity, skipping a run creates "
            "cognitive dissonance that pulls behavior back in line."
        ),
        how_sophia_uses_it=(
            "Habit domains (Body/Mind/Discipline) are framed as identity areas, not "
            "just checklists — progress view shows 'votes cast' per domain, not just raw completions."
        ),
        caveats="Identity change is slow and retrospective; it reinforces habits already somewhat established more than it kickstarts day one.",
    ),
    Framework(
        id="fogg-behavior-model",
        name="Fogg Behavior Model (B=MAP)",
        category="motivation",
        source="BJ Fogg, Tiny Habits (2019) / Stanford Behavior Design Lab",
        summary=(
            "Behavior happens when Motivation, Ability, and a Prompt converge at the "
            "same moment. If a behavior isn't happening, at least one of the three is "
            "too low — and it's almost always Ability (the task is too hard), not Motivation."
        ),
        mechanism=(
            "Motivation fluctuates hour to hour and is unreliable as a design "
            "foundation; making a behavior small enough that it requires near-zero "
            "motivation is more robust than trying to boost motivation itself."
        ),
        how_sophia_uses_it=(
            "New habit suggestions default to the smallest viable version (e.g. "
            "'do 1 pushup' before 'do a 45-minute workout') — see the two-minute rule entry."
        ),
        caveats="Shrinking a habit too far can make it feel trivial and get abandoned for the opposite reason — under-engagement rather than friction.",
    ),
    Framework(
        id="two-minute-rule",
        name="The Two-Minute Rule",
        category="habit_formation",
        source="James Clear, Atomic Habits (2018); precursor idea from David Allen, Getting Things Done",
        summary=(
            "Any new habit should be scoped down to something completable in under "
            "two minutes. 'Read before bed' becomes 'read one page.' The point is to "
            "master showing up before optimizing performance."
        ),
        mechanism="Lowers the activation energy (see Ability, above) so the habit is friction-free to start, which is the actual bottleneck for most new behaviors, not endurance.",
        how_sophia_uses_it="The habit creation flow nudges toward small starting cadences; scaling up is a later edit, not a day-one requirement.",
        caveats="Useful for habit formation, not for goals requiring genuine volume (e.g. marathon training) — pair it with progressive overload once the habit is automatic.",
    ),
    Framework(
        id="implementation-intentions",
        name="Implementation Intentions",
        category="habit_formation",
        source="Peter Gollwitzer, research from the 1990s onward; meta-analyses show consistent effect sizes across domains",
        summary=(
            "A simple 'if-then' plan (if it's 7am, then I do 10 pushups in the "
            "living room) roughly doubles follow-through versus a vague intention to "
            "'exercise more,' across dozens of replicated studies."
        ),
        mechanism="Pre-deciding the situational trigger offloads the decision from the moment of action, when willpower and attention are both weakest.",
        how_sophia_uses_it="Cadence + domain fields exist specifically so a habit isn't just a name — the coach asks for a concrete trigger when a habit is created without one.",
        caveats="The effect is strongest for simple, well-defined actions; it's weaker for complex, multi-step goals.",
    ),
    Framework(
        id="temptation-bundling",
        name="Temptation Bundling",
        category="motivation",
        source="Katy Milkman, research beginning ~2014 (University of Pennsylvania)",
        summary=(
            "Pairing a habit you should do with something you want to do (only "
            "listen to your favorite podcast while at the gym) borrows the pull of "
            "the 'want' to carry the 'should.'"
        ),
        mechanism="Creates an immediate reward attached to the behavior, closing the gap between present-cost and future-benefit that undermines most 'should' habits.",
        how_sophia_uses_it="Habit notes are a place to log the bundle (e.g. 'only during commute'), which the coach can reference back.",
        caveats="Works best when the paired reward is genuinely restricted to the habit context — if you get the podcast anytime, the bundle loses its pull.",
    ),
    Framework(
        id="zeigarnik-effect",
        name="Zeigarnik Effect",
        category="attention",
        source="Bluma Zeigarnik, 1920s Gestalt psychology research",
        summary=(
            "Unfinished tasks stay more mentally 'active' and intrusive than "
            "completed ones — open loops nag at attention until closed or explicitly parked."
        ),
        mechanism="Working memory keeps incomplete goals in a heightened state of accessibility as a completion-seeking mechanism.",
        how_sophia_uses_it="Progress view surfaces 'behind' cadences explicitly rather than hiding them, since an acknowledged gap is easier to let go of than a silently tracked one.",
        caveats="Can tip into rumination if a person already has anxious tendencies around incomplete tasks — closing the loop with a plan matters more than just naming the gap.",
    ),
    Framework(
        id="self-determination-theory",
        name="Self-Determination Theory (Autonomy, Competence, Relatedness)",
        category="motivation",
        source="Edward Deci & Richard Ryan, ongoing research since the 1980s",
        summary=(
            "Intrinsic motivation is most durable when three needs are met: "
            "autonomy (choice), competence (visible progress), and relatedness "
            "(connection to others or a larger reason)."
        ),
        mechanism="External rewards/pressure (streaks-as-punishment, guilt-based reminders) can crowd out intrinsic motivation — this is the well-documented 'overjustification effect.'",
        how_sophia_uses_it=(
            "Cadence-based tracking (N times/week) instead of unforgiving daily "
            "streaks is a direct application: autonomy over which days, competence "
            "via visible weekly progress, no punishment for a single missed day."
        ),
        caveats="Don't over-index on autonomy for habits that genuinely need consistency (e.g. medication) — some domains warrant firmer structure.",
    ),
    Framework(
        id="habit-stacking",
        name="Habit Stacking",
        category="habit_formation",
        source="BJ Fogg's 'anchoring,' popularized as 'habit stacking' by James Clear",
        summary=(
            "Attach a new habit to an existing, already-automatic one: 'after I pour "
            "my morning coffee, I write one line in my journal.' The existing habit "
            "supplies the cue for free."
        ),
        mechanism="Reuses an already-consolidated cue-routine-reward loop instead of building a new cue from scratch, which is the slowest part of habit formation.",
        how_sophia_uses_it="Coach prompts for an anchor habit when a new habit is created with a vague or missing trigger.",
        caveats="Stacking too many new habits onto one anchor at once tends to collapse the whole chain — add one at a time.",
    ),
    Framework(
        id="environment-design",
        name="Environment / Choice Architecture",
        category="environment",
        source="Richard Thaler & Cass Sunstein, Nudge (2008); applied to habits by James Clear and BJ Fogg",
        summary=(
            "Behavior is shaped more reliably by making the desired action the path "
            "of least resistance (and the undesired one slightly harder) than by "
            "relying on in-the-moment self-control."
        ),
        mechanism="Reduces reliance on limited, fatiguing self-control resources by shifting the default option itself.",
        how_sophia_uses_it="Notes field on habits is meant to capture environment setup ('shoes by the door'), not just intent.",
        caveats="Environment design fixes friction, not motivation — a well-placed yoga mat won't create desire to do yoga that isn't there at all.",
    ),
    Framework(
        id="shadow-integration",
        name="Shadow Integration",
        category="identity",
        source="Carl Jung, Psychology and Religion (1938) and later works; popularized clinically through Jungian and depth psychology practice",
        summary=(
            "Traits, urges, and memories we've disowned because they once felt "
            "unsafe or unacceptable don't disappear — they operate unconsciously "
            "and surface as disproportionate reactions, projection onto others, "
            "or self-sabotage."
        ),
        mechanism=(
            "Naming and consciously owning a disowned trait moves it from "
            "unconscious reaction to available, directable energy — Jung's "
            "'what you resist persists, what you accept transforms.'"
        ),
        how_sophia_uses_it="The Shadow module uses targeted prompts to surface avoided material, then a separate integration step to track when a pattern has actually been metabolized, not just named once.",
        caveats="Shadow work surfaces real emotional material; it is reflective practice, not a substitute for therapy — Sophia says so explicitly before unlocking the module.",
    ),
]


def framework_by_domain(domain: str) -> list[Framework]:
    """Rough domain -> framework relevance mapping for coach context injection."""
    domain_map = {
        "body": ["two-minute-rule", "environment-design", "habit-stacking", "self-determination-theory"],
        "mind": ["zeigarnik-effect", "self-determination-theory", "implementation-intentions"],
        "discipline": ["habit-loop", "atomic-habits-identity", "fogg-behavior-model", "temptation-bundling"],
        "shadow": ["shadow-integration"],
    }
    ids = domain_map.get(domain, [])
    return [f for f in FRAMEWORKS if f.id in ids]


INDUSTRY_CONTEXT = {
    "note": (
        "Figures below are drawn from multiple 2025-2026 market research reports "
        "(precedenceresearch.com, custommarketinsights.com, grandviewresearch.com, "
        "thebusinessresearchcompany.com). Estimates vary by methodology/scope, so "
        "treat these as directional, not precise."
    ),
    "global_market_size_2026_estimate_usd_billion": "53-70B (range across reports, differing scope)",
    "projected_2030_2035_usd_billion": "84-94B",
    "cagr_range_percent": "5.1-8.9",
    "us_life_coaching_industry_usd_billion": 16,
    "us_coaches_count": "232,000+",
    "fastest_growing_segment": "mobile apps / AI-driven personalized coaching",
    "biggest_documented_criticism": (
        "Persistent skepticism that the industry sells motivation rather than "
        "durable behavior change — most reports note apps and coaching are "
        "growing specifically because they add accountability structure that "
        "books alone lack."
    ),
}
