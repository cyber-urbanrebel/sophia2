from dataclasses import asdict

from fastapi import APIRouter, Query

from app.data.knowledge_base import FRAMEWORKS, INDUSTRY_CONTEXT, framework_by_domain

router = APIRouter(prefix="/api/insights", tags=["insights"])


@router.get("/frameworks")
def list_frameworks(domain: str | None = Query(default=None, description="body | mind | discipline | shadow")):
    frameworks = framework_by_domain(domain) if domain else FRAMEWORKS
    return [asdict(f) for f in frameworks]


@router.get("/industry")
def industry_context():
    return INDUSTRY_CONTEXT
