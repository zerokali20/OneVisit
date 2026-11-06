from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field

class ApplicantAnswerCreate(BaseModel):
    question_key: str
    question_text: str
    answer_value: str

class ApplicantAnswerOut(BaseModel):
    id: str
    question_key: str
    question_text: str
    answer_value: str
    created_at: datetime

    class Config:
        from_attributes = True

class ApplicationCaseCreate(BaseModel):
    service_type: str = "SRI_LANKAN_PASSPORT"
    route: Optional[str] = "FIRST_TIME"
    regional_office: Optional[str] = "Kandy"

class ApplicationCaseUpdate(BaseModel):
    route: Optional[str] = None
    regional_office: Optional[str] = None
    readiness_status: Optional[str] = None
    progress_percentage: Optional[int] = None

class ApplicationCaseOut(BaseModel):
    id: str
    case_number: str
    service_type: str
    route: Optional[str] = None
    regional_office: Optional[str] = None
    readiness_status: str
    progress_percentage: int
    created_at: datetime
    updated_at: datetime
    answers: List[ApplicantAnswerOut] = []

    class Config:
        from_attributes = True
