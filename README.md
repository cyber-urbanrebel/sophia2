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

## Going Live

Two separate deploys: the frontend (static site → Vercel) and the backend
(Python server → Railway). Both connect straight to this GitHub repo
(`cyber-urbanrebel/sophia2`), so every `git push` to `main` redeploys
automatically once set up. Everything below is dashboard clicks — no local
CLI install needed.

**Backend first (Railway)**
1. Sign up at railway.app, **New Project → Deploy from GitHub repo**, pick
   `sophia2`.
2. In the new service's **Settings → Source**, set **Root Directory** to
   `backend`. Railway reads `backend/railway.json` automatically and detects
   Python via `requirements.txt` (Nixpacks) — no build command to type in.
3. **Settings → Variables**, add:
   - `JWT_SECRET` — any long random string (e.g. mash the keyboard for 40+ characters)
   - `WEB_ORIGIN` — leave as a placeholder for now, e.g. `http://localhost:5173`, you'll update it in step 3 below
   - `DATABASE_PATH` — `/data/sophia.db` (see the volume step next — this path only persists once a volume is mounted there)
   - Optional: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY` if you have real ones
4. **To make the database actually persist** (survive redeploys): in the
   service, go to **Settings → Volumes → New Volume**, mount path `/data`.
   Without this step the SQLite file resets on every redeploy.
5. **Settings → Networking → Generate Domain** to get a public URL, e.g.
   `https://sophia-api-production.up.railway.app`.

**Frontend (Vercel)**
1. Sign up at vercel.com, **Add New → Project**, import the same repo.
2. Set **Root Directory** to `sophia_mobile_web` (Vercel auto-detects Vite;
   `vercel.json` inside that folder handles the rest).
3. Add an environment variable: `VITE_API_URL` = your Railway URL from above.
4. Deploy. Note the URL Vercel gives you, e.g. `https://sophia.vercel.app`.

**Connect them**
Back in Railway → your service → Variables, set `WEB_ORIGIN` to your Vercel
URL (exact, no trailing slash) so the backend's CORS allows the frontend to
call it. Railway redeploys automatically when you save a variable.

Visit your Vercel URL — that's Sophia, live.

**Cost note**: Railway's free trial is credit-based, not unlimited — check
current pricing on their site before relying on it long-term; a hobby plan
is a few dollars/month once the trial credit runs out. If you'd rather avoid
that entirely, say so and I'll switch the backend config to a platform with
an uncapped free tier instead (e.g. Google Cloud Run, though it needs a
Google Cloud account and doesn't do persistent local disk either, so the
database would need to move to a managed Postgres either way).

## Known Gaps (Not Built In This Pass)

- Payments (M-Pesa), production deployment/hosting, native mobile app
  packaging, and full Admin/Community backend wiring were already
  mock/placeholder before this pass and remain a follow-up.
- Conversation history for the coach is in-process memory — fine for local
  single-server use, move to the database before scaling horizontally.
