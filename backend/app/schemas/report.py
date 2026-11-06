from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel

class ReadinessReportOut(BaseModel):
    id: str
    case_id: str
    overall_status: str  # READY, NEEDS_CLARIFICATION, BLOCKED, UNVERIFIED
    summary: str
    satisfied_rules: List[Dict[str, Any]]
    missing_items: List[Dict[str, Any]]
    discrepancies: List[Dict[str, Any]]
    recommendations: List[str]
    official_sources: List[Dict[str, str]]
    pdf_filename: Optional[str] = None
    generated_at: datetime

    class Config:
        from_attributes = True
