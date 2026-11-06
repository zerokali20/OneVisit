from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ExtractedFieldOut(BaseModel):
    id: str
    field_name: str
    field_value: str
    confidence: float
    user_confirmed: bool
    user_corrected_value: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ExtractedFieldConfirm(BaseModel):
    field_id: str
    user_confirmed: bool = True
    user_corrected_value: Optional[str] = None

class DocumentOut(BaseModel):
    id: str
    case_id: str
    doc_type: str
    file_name: str
    mime_type: str
    file_size: int
    verification_status: str
    uploaded_at: datetime
    extracted_fields: List[ExtractedFieldOut] = []

    class Config:
        from_attributes = True

class SyntheticDocumentSeed(BaseModel):
    scenario: str  # "SCENARIO_A" (First-time Kandy with Name Mismatch) or "SCENARIO_B" (Previous holder renewal)
