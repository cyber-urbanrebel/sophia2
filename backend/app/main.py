from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.requests import Request

from app.config import HAS_ANTHROPIC, HAS_VOICE_PIPELINE, settings
from app.db import init_db
from app.routers import auth, coach, habits, insights, journal, shadow, tasks, voice, wisdom

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])

app = FastAPI(title="Sophia API", version="3.0.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.web_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=1000)
app.add_middleware(SlowAPIMiddleware)

# Idempotent (CREATE TABLE IF NOT EXISTS under the hood) — safe to call at
# import time rather than relying on the startup-event hook.
init_db()


app.include_router(auth.router)
app.include_router(habits.router)
app.include_router(journal.router)
app.include_router(tasks.router)
app.include_router(shadow.router)
app.include_router(wisdom.router)
app.include_router(coach.router)
app.include_router(voice.router)
app.include_router(insights.router)


@app.get("/")
def root():
    return {
        "service": "Sophia API",
        "message": "This is the backend — the app itself is at http://localhost:5173",
        "docs": "/docs",
        "health": "/api/health",
    }


@app.get("/api/health")
def health(request: Request):
    return {
        "ok": True,
        "coach": "claude" if HAS_ANTHROPIC else "templated",
        "voice_pipeline": "elevenlabs+whisper" if HAS_VOICE_PIPELINE else "browser (Web Speech API)",
    }
