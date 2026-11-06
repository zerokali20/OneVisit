from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.rule import ServiceRule, RuleVersion
from app.schemas.rule import ServiceRuleOut, RuleAuditChange

router = APIRouter()

@router.get("", response_model=List[ServiceRuleOut])
def list_rules(db: Session = Depends(get_db)):
    return db.query(ServiceRule).order_by(ServiceRule.rule_code.asc()).all()

@router.post("/audit", response_model=dict)
def audit_official_source_changes(audit_in: RuleAuditChange, db: Session = Depends(get_db)):
    """
    Monitors external government source integrity.
    If a change is detected on www.immigration.gov.lk, marks rule 'UNDER_REVIEW'
    and requires OneVisit Human Review Board approval before modifying deterministic logic.
    """
    rule = db.query(ServiceRule).filter(ServiceRule.rule_code == audit_in.rule_code).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Service rule not found")

    rule.review_status = "UNDER_REVIEW"
    
    # Create audit version record
    new_version_num = rule.version + 1
    version_record = RuleVersion(
        rule_id=rule.id,
        version_number=new_version_num,
        rule_text=rule.description,
        change_summary=f"Automated crawler detected content change: {audit_in.detected_change}. Placed under human review.",
        reviewed_by="Source Change Monitor Daemon"
    )
    db.add(version_record)
    db.commit()

    return {
        "status": "FLAGGED_FOR_HUMAN_REVIEW",
        "rule_code": rule.rule_code,
        "current_status": rule.review_status,
        "message": "Source change logged. Verification logic will NOT be altered without human board approval."
    }
