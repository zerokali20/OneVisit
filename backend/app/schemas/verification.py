from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel

class VerificationResultOut(BaseModel):
    id: str
    case_id: str
    rule_code: str
    status: str  # SATISFIED, MISSING_EVIDENCE, DISCREPANCY_DETECTED, BLOCKED, UNVERIFIED
    details: str
    evidence_refs: Optional[str] = None
    checked_at: datetime

    class Config:
        from_attributes = True

class AgentActionOut(BaseModel):
    id: str
    case_id: str
    step_index: int
    action_name: str
    rationale: str
    action_input: Optional[str] = None
    action_output: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class VerificationTriggerRequest(BaseModel):
    force_recheck: bool = False

class DiscrepancyResolutionRequest(BaseModel):
    document_id: Optional[str] = None
    field_name: str
    confirmed_value: str
    explanation: Optional[str] = None
