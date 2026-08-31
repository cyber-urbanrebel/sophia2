# SOPHIA

SOPHIA is a digital wellness companion — habits, journaling, shadow work,
an interfaith wisdom library, and a calm AI coach — in one web app that
feels human, not like a command center.

The live project is this GitHub repo:
[github.com/cyber-urbanrebel/sophia2](https://github.com/cyber-urbanrebel/sophia2)

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
  the warm teal / amber wellness theme (see `src/styles/tokens.css` and `src/styles/sophia-theme.css`)
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

## Going Live (Render)

One GitHub repo, three Render resources from `render.yaml`:

- **sophia-db** — Postgres (persists habits, journal, auth)
- **sophia-api** — FastAPI (`backend/`)
- **sophia-web** — Vite static site (`sophia_mobile_web/`)

**Blueprint deploy**
1. Push this repo to GitHub (`main`).
2. On [render.com](https://render.com) → **New → Blueprint**, pick
   `cyber-urbanrebel/sophia2`.
3. Render reads `render.yaml` and creates the database + both services.
4. Fill the prompted env vars (leave AI keys blank if you are not using them).
   For Firebase on the web app, paste the same `VITE_FIREBASE_*` values you use locally.
5. After the first deploy, copy the **sophia-web** URL (e.g.
   `https://sophia-web.onrender.com`) and set `WEB_ORIGIN` on **sophia-api**
   to that URL (no trailing slash). CORS also allows `*.onrender.com`.
6. Open the **sophia-web** URL. Free web services spin down after idle time;
   the first request after that can take ~30–60 seconds.

**Manual deploy** (if you skip Blueprint)
- Web service: root `backend`, build `pip install -r requirements.txt`,
  start `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, health `/api/health`.
  Attach Postgres and set `DATABASE_URL` from Render.
- Static site: root `sophia_mobile_web`, build `npm install && npm run build`,
  publish `dist`. Set `VITE_API_URL` to the API’s public URL (with `https://`).
  SPA rewrite: `/*` → `/index.html`.

Do not use SQLite as the only production store on Render — the disk is
ephemeral unless you add a paid disk. Use the Postgres `DATABASE_URL`.

## Known Gaps (Not Built In This Pass)

- Payments (M-Pesa), native mobile app packaging, and full Admin/Community
  backend wiring were already mock/placeholder before this pass and remain a
  follow-up.
- Conversation history for the coach is in-process memory — fine for local
  single-server use, move to the database before scaling horizontally.
