import random
import string
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.case import ApplicationCase, ApplicantAnswer
from app.schemas.case import (
    ApplicationCaseCreate, ApplicationCaseUpdate, ApplicationCaseOut,
    ApplicantAnswerCreate, ApplicantAnswerOut
)

router = APIRouter()

def generate_case_number() -> str:
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"LK-PASS-2026-{suffix}"

@router.post("", response_model=ApplicationCaseOut, status_code=status.HTTP_201_CREATED)
def create_case(case_in: ApplicationCaseCreate, db: Session = Depends(get_db)):
    case = ApplicationCase(
        case_number=generate_case_number(),
        service_type=case_in.service_type,
        route=case_in.route or "FIRST_TIME",
        regional_office=case_in.regional_office or "Kandy",
        readiness_status="UNVERIFIED",
        progress_percentage=15
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case

@router.get("", response_model=List[ApplicationCaseOut])
def list_cases(db: Session = Depends(get_db)):
    return db.query(ApplicationCase).order_by(ApplicationCase.created_at.desc()).all()

@router.get("/{case_id}", response_model=ApplicationCaseOut)
def get_case(case_id: str, db: Session = Depends(get_db)):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")
    return case

@router.put("/{case_id}/answers", response_model=ApplicationCaseOut)
def update_case_answers(case_id: str, answers_in: List[ApplicantAnswerCreate], db: Session = Depends(get_db)):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")

    # Clear previous answers for keys or update them
    existing_map = {a.question_key: a for a in case.answers}
    for ans in answers_in:
        if ans.question_key in existing_map:
            existing_map[ans.question_key].answer_value = ans.answer_value
        else:
            db.add(ApplicantAnswer(
                case_id=case_id,
                question_key=ans.question_key,
                question_text=ans.question_text,
                answer_value=ans.answer_value
            ))

    # Auto-adjust route & office if answered in questionnaire
    ans_dict = {a.question_key: a.answer_value for a in answers_in}
    if "route" in ans_dict:
        case.route = ans_dict["route"]
    elif ans_dict.get("previous_passport_holder", "").lower() in ["yes", "true"]:
        case.route = "PREVIOUS_HOLDER_RENEWAL"
    else:
        case.route = "FIRST_TIME"

    if "regional_office" in ans_dict:
        case.regional_office = ans_dict["regional_office"]

    case.progress_percentage = max(case.progress_percentage, 35)
    db.commit()
    db.refresh(case)
    return case
