import json
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.case import ApplicationCase
from app.models.report import ReadinessReport
from app.schemas.report import ReadinessReportOut
from app.services.report_service import generate_pdf_report

router = APIRouter()

@router.get("/{case_id}/report", response_model=ReadinessReportOut)
def get_readiness_report(case_id: str, db: Session = Depends(get_db)):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")

    report = db.query(ReadinessReport).filter(ReadinessReport.case_id == case_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Readiness report not yet generated for this case. Run verification first.")

    return ReadinessReportOut(
        id=report.id,
        case_id=report.case_id,
        overall_status=report.overall_status,
        summary=report.summary,
        satisfied_rules=json.loads(report.satisfied_rules or "[]"),
        missing_items=json.loads(report.missing_items or "[]"),
        discrepancies=json.loads(report.discrepancies or "[]"),
        recommendations=json.loads(report.recommendations or "[]"),
        official_sources=json.loads(report.official_sources or "[]"),
        pdf_filename=report.pdf_filename,
        generated_at=report.generated_at
    )

@router.get("/{case_id}/report/pdf")
def download_pdf_report(case_id: str, db: Session = Depends(get_db)):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")

    report = db.query(ReadinessReport).filter(ReadinessReport.case_id == case_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Readiness report not available.")

    filename = f"OneVisit_Readiness_{case.case_number}.pdf"
    filepath = settings.REPORTS_DIR / filename

    case_dict = {
        "case_number": case.case_number,
        "route": case.route,
        "regional_office": case.regional_office
    }
    report_dict = {
        "overall_status": report.overall_status,
        "summary": report.summary,
        "satisfied_rules": report.satisfied_rules,
        "missing_items": report.missing_items,
        "recommendations": report.recommendations
    }

    generate_pdf_report(case_dict, report_dict, filepath)
    report.pdf_filename = filename
    db.commit()

    return FileResponse(
        path=str(filepath),
        filename=filename,
        media_type="application/pdf"
    )
