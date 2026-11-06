from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

class ServiceRuleOut(BaseModel):
    id: str
    rule_code: str
    title: str
    category: str
    description: str
    official_source_url: str
    source_name: str
    verification_date: datetime
    effective_date: Optional[datetime] = None
    review_status: str
    version: int

    class Config:
        from_attributes = True

class RuleAuditChange(BaseModel):
    rule_code: str
    detected_change: str
    requires_human_review: bool = True
