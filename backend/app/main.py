from pathlib import Path
import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
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

_cors_origins = [origin.strip() for origin in settings.web_origin.split(",") if origin.strip()]
if "http://localhost:5173" not in _cors_origins:
    _cors_origins.append("http://localhost:5173")

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_origin_regex=r"https://.*\.onrender\.com",
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

STATIC_DIR = Path(os.getenv("STATIC_DIR", "/app/static"))
_API_ONLY_PREFIXES = ("api/", "docs", "redoc", "openapi.json")


@app.get("/api/health")
def health(request: Request):
    return {
        "ok": True,
        "coach": "claude" if HAS_ANTHROPIC else "templated",
        "voice_pipeline": "elevenlabs+whisper" if HAS_VOICE_PIPELINE else "browser (Web Speech API)",
    }


def _spa_index():
    return STATIC_DIR / "index.html"


@app.get("/")
def root():
    index = _spa_index()
    if index.is_file():
        return FileResponse(index)
    return JSONResponse({
        "service": "Sophia API",
        "message": "Web UI is not bundled in this image. Rebuild from the repo-root Dockerfile.",
        "docs": "/docs",
        "health": "/api/health",
    })


if STATIC_DIR.is_dir():
    for folder in ("assets", "fonts"):
        folder_path = STATIC_DIR / folder
        if folder_path.is_dir():
            app.mount(f"/{folder}", StaticFiles(directory=str(folder_path)), name=folder)

    @app.get("/{full_path:path}")
    def spa(full_path: str):
        if full_path.startswith(_API_ONLY_PREFIXES):
            return JSONResponse({"detail": "Not Found"}, status_code=404)
        candidate = (STATIC_DIR / full_path).resolve()
        try:
            candidate.relative_to(STATIC_DIR.resolve())
        except ValueError:
            return FileResponse(_spa_index())
        if candidate.is_file():
            return FileResponse(candidate)
        index = _spa_index()
        if index.is_file():
            return FileResponse(index)
        return JSONResponse({"detail": "Not Found"}, status_code=404)
