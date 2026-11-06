from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal
from app.models import (
    ApplicationCase, ApplicantAnswer, Document, ExtractedField,
    ServiceRule, RuleVersion, VerificationResult, AgentAction, ReadinessReport
)
from app.services.rules_data import VERIFIED_RULES_DATA
from app.api.v1.api import api_router

# Initialize database schemas
Base.metadata.create_all(bind=engine)

# Seed verified rules on startup
def seed_rules():
    db: Session = SessionLocal()
    try:
        count = db.query(ServiceRule).count()
        if count == 0:
            for r in VERIFIED_RULES_DATA:
                rule = ServiceRule(
                    rule_code=r["rule_code"],
                    title=r["title"],
                    category=r["category"],
                    description=r["description"],
                    official_source_url=r["official_source_url"],
                    source_name=r["source_name"],
                    verification_date=r["verification_date"],
                    review_status=r["review_status"],
                    version=r["version"]
                )
                db.add(rule)
                db.flush()
                # Initial rule version
                rv = RuleVersion(
                    rule_id=rule.id,
                    version_number=1,
                    rule_text=rule.description,
                    change_summary="Initial verification against official Sri Lanka Department of Immigration guidelines.",
                    reviewed_by="OneVisit Legal Verification Committee"
                )
                db.add(rv)
            db.commit()
    finally:
        db.close()

seed_rules()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="OneVisit Civic Application Preparation API (Department of Immigration Sri Lanka - Passport Track)",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "OneVisit Backend",
        "version": settings.VERSION,
        "verified_rules_active": True
    }
