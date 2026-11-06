from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.case import ApplicationCase
from app.models.document import Document, ExtractedField
from app.models.verification import AgentAction, VerificationResult
from app.schemas.verification import (
    AgentActionOut, VerificationResultOut,
    VerificationTriggerRequest, DiscrepancyResolutionRequest
)
from app.services.agent_workflow import VerificationAgent

router = APIRouter()

@router.post("/{case_id}/verify")
def trigger_agent_verification(
    case_id: str,
    req: VerificationTriggerRequest = None,
    db: Session = Depends(get_db)
):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")

    agent = VerificationAgent(db, case_id)
    summary = agent.run_agent_loop()
    return summary

@router.get("/{case_id}/actions", response_model=List[AgentActionOut])
def get_agent_actions(case_id: str, db: Session = Depends(get_db)):
    actions = db.query(AgentAction).filter(AgentAction.case_id == case_id).order_by(AgentAction.step_index.asc()).all()
    return actions

@router.get("/{case_id}/results", response_model=List[VerificationResultOut])
def get_verification_results(case_id: str, db: Session = Depends(get_db)):
    results = db.query(VerificationResult).filter(VerificationResult.case_id == case_id).all()
    return results

@router.post("/{case_id}/discrepancies/resolve")
def resolve_discrepancy(
    case_id: str,
    res: DiscrepancyResolutionRequest,
    db: Session = Depends(get_db)
):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")

    # Update relevant document extracted fields with the confirmed/corrected value
    fields = db.query(ExtractedField).join(Document).filter(
        Document.case_id == case_id,
        ExtractedField.field_name == res.field_name
    ).all()

    for f in fields:
        f.user_confirmed = True
        f.user_corrected_value = res.confirmed_value

    db.commit()

    # Automatically re-run agent loop to re-evaluate the updated case state
    agent = VerificationAgent(db, case_id)
    summary = agent.run_agent_loop()

    return {
        "status": "RESOLVED",
        "field_name": res.field_name,
        "confirmed_value": res.confirmed_value,
        "new_overall_status": summary["overall_status"],
        "verification_summary": summary
    }
