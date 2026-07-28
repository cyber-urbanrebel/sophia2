# SOPHIA

Sophia is a conscious operating system for the soul — a digital wellness and
self-improvement platform combining habit tracking, journaling, shadow work,
an interfaith wisdom library, and an AI voice/chat coach, in one dark,
cinematic app that runs as both a desktop web experience and a responsive
mobile web app from a single codebase.

## System Flow

```text
APP LAUNCH
  -> LoadingScreen
  -> AuthPage
  -> OnboardingFlow (first login only)
  -> Primary nav: Path · Mind · Body · Discipline · Shadow · Progress
  -> Floating AI coach (every screen) + dedicated Voice tab
  -> Secondary ("More") nav: Growth, Wisdom Library, Philosophy, Goals,
     Community, Analytics, Focus Timer, Achievements, Reminders, Reports,
     Premium, Profile, Admin
```

## What's Real Right Now

- **Auth, habits (cadence-based), journal, and shadow work** are backed by a
  real FastAPI + SQLite server — not mocked, not local-only.
- **The AI coach** (floating chat + dedicated AI Coach panel) calls a real
  backend endpoint grounded in your actual habit/progress data. With no AI
  key configured it runs a zero-cost *templated* coach that reasons from your
  real numbers and Sophia's behavior-change knowledge base; drop a real
  `ANTHROPIC_API_KEY` into `backend/.env` and it upgrades to live Claude
  automatically — no code changes needed.
- **Voice** works today for free via the browser's built-in speech
  recognition and speech synthesis (Chrome/Edge). Add `OPENAI_API_KEY` +
  `ELEVENLABS_API_KEY` to upgrade to studio-quality server-side
  Whisper→Claude→ElevenLabs voice — same zero-rebuild upgrade path.
- **Wisdom Library** is an interfaith collection (Christianity, Islam,
  Judaism, Buddhism, Hinduism, Taoism, Stoicism, modern philosophy) served
  from the backend, alongside Sophia's original secular quote set — presented
  side by side, not favoring one tradition.
- **Shadow** is a gated reflective-journaling module (fears, shame,
  limiting beliefs) with an explicit consent step and an "integration"
  tracker, grounded in Jungian shadow-integration theory.

See `.claude` history or `backend/app/data/` for the actual content —
nothing above is aspirational; it's what's wired and tested.

## Technologies Used

### Frontend (`sophia_mobile_web/`)
- React 18 + Vite 5, React Router 6, Redux Toolkit
- Tailwind CSS (utility classes) alongside CSS Modules / inline styles for
  the cinematic obsidian/gold/violet theme (see `src/styles/sophia-theme.css`)
- Web Speech API for free voice input/output
- Firebase is optional (`VITE_USE_FIREBASE=true`) and falls back to the
  backend otherwise

### Backend (`backend/`)
- Python, FastAPI + SQLModel (SQLite)
- JWT auth, bcrypt password hashing, slowapi rate limiting
- All AI provider keys (Anthropic/OpenAI/ElevenLabs) are **optional** — the
  app boots and runs fully with none of them set

### Archived (`_archive/`)
Superseded or unrelated prior attempts, kept for reference, not part of the
active build: a static HTML prototype, a Django personal portfolio, an
unrelated Chat/Files/Tools/Projects workspace clone, and the old empty
Node backend scaffold.

## Running It

### Backend
```powershell
cd backend
.\run_backend.ps1
```
This creates a venv, copies `.env.example` to `.env` on first run (all keys
optional), installs dependencies, and starts the API on
`http://localhost:3001`.

### Frontend
```powershell
cd sophia_mobile_web
npm install
npm run dev
```
Open `http://localhost:5173`.

## Adding Real AI Keys (Optional)

Edit `backend/.env`:
```bash
ANTHROPIC_API_KEY=sk-ant-...      # upgrades text coaching to live Claude
OPENAI_API_KEY=sk-...             # + ELEVENLABS_API_KEY below unlocks
ELEVENLABS_API_KEY=...            # studio-quality server-side voice
```
Restart the backend — no frontend changes needed.

## Repository Layout
```text
sophia2/
  backend/              FastAPI API — auth, habits, journal, shadow, wisdom, coach, voice
  sophia_mobile_web/    Main React application (web + mobile web)
  _archive/             Superseded prior attempts, kept for reference only
```

## Known Gaps (Not Built In This Pass)

- Payments (M-Pesa), production deployment/hosting, native mobile app
  packaging, and full Admin/Community backend wiring were already
  mock/placeholder before this pass and remain a follow-up.
- Conversation history for the coach is in-process memory — fine for local
  single-server use, move to the database before scaling horizontally.
