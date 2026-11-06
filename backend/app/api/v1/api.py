from fastapi import APIRouter
from app.api.v1.endpoints import cases, documents, rules, verification, reports

api_router = APIRouter()

api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(documents.router, prefix="/cases", tags=["documents"])
api_router.include_router(verification.router, prefix="/cases", tags=["verification"])
api_router.include_router(reports.router, prefix="/cases", tags=["reports"])
api_router.include_router(rules.router, prefix="/rules", tags=["rules"])
