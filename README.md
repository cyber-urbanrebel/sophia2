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

## Going Live (Free Tier)

Two separate deploys: the frontend (static site → Vercel) and the backend
(Python server → Render). Both connect straight to this GitHub repo
(`cyber-urbanrebel/sophia2`), so every `git push` to `main` redeploys
automatically once set up.

**Backend first (Render)**
1. Sign up at render.com, click **New → Blueprint**, connect this GitHub repo.
2. Render reads `render.yaml` at the repo root automatically and proposes a
   `sophia-api` web service rooted at `backend/` — accept it.
3. It'll ask for the env vars marked `sync: false` in `render.yaml`
   (`WEB_ORIGIN`, and optionally `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` /
   `ELEVENLABS_API_KEY` if you have real ones). Leave `WEB_ORIGIN` blank for
   now — you'll fill it in after the frontend is deployed, in step 3 below.
   `JWT_SECRET` is generated for you automatically.
4. Deploy. Note the URL Render gives you, e.g. `https://sophia-api.onrender.com`.

**Frontend (Vercel)**
1. Sign up at vercel.com, **Add New → Project**, import the same repo.
2. Set **Root Directory** to `sophia_mobile_web` (Vercel auto-detects Vite;
   `vercel.json` inside that folder handles the rest).
3. Add an environment variable: `VITE_API_URL` = your Render URL from above
   (e.g. `https://sophia-api.onrender.com`).
4. Deploy. Note the URL Vercel gives you, e.g. `https://sophia.vercel.app`.

**Connect them**
Back in Render → your `sophia-api` service → Environment, set `WEB_ORIGIN` to
your Vercel URL (exact, no trailing slash) so the backend's CORS allows the
frontend to call it. Redeploy the backend.

Visit your Vercel URL — that's Sophia, live.

**Free tier caveats**: Render's free web service sleeps after inactivity
(first request after a while has a ~30-60s cold-start delay) and doesn't
include a persistent disk, so the SQLite database resets on redeploy/restart
— fine for trying it out or demoing, not for real user data yet. When you're
ready for that to stop happening, either upgrade to a paid Render instance
with a persistent disk, or move `DATABASE_PATH` to a managed Postgres
database (Render offers free Postgres instances — this needs a small code
change in `backend/app/db.py` to point at a Postgres URL instead of SQLite).

## Known Gaps (Not Built In This Pass)

- Payments (M-Pesa), production deployment/hosting, native mobile app
  packaging, and full Admin/Community backend wiring were already
  mock/placeholder before this pass and remain a follow-up.
- Conversation history for the coach is in-process memory — fine for local
  single-server use, move to the database before scaling horizontally.
