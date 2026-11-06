import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class VerificationResult(Base):
    __tablename__ = "verification_results"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("application_cases.id", ondelete="CASCADE"), nullable=False)
    rule_code = Column(String(64), nullable=False)
    status = Column(String(32), nullable=False)  # SATISFIED, MISSING_EVIDENCE, DISCREPANCY_DETECTED, BLOCKED, UNVERIFIED
    details = Column(Text, nullable=False)
    evidence_refs = Column(Text, nullable=True)  # JSON-encoded evidence mapping
    checked_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("ApplicationCase", back_populates="verification_results")


class AgentAction(Base):
    __tablename__ = "agent_actions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("application_cases.id", ondelete="CASCADE"), nullable=False)
    step_index = Column(Integer, default=1)
    action_name = Column(String(64), nullable=False)
    rationale = Column(Text, nullable=False)
    action_input = Column(Text, nullable=True)   # JSON string
    action_output = Column(Text, nullable=True)  # JSON string
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("ApplicationCase", back_populates="agent_actions")
