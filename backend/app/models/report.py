import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ReadinessReport(Base):
    __tablename__ = "readiness_reports"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("application_cases.id", ondelete="CASCADE"), unique=True, nullable=False)
    overall_status = Column(String(32), nullable=False)  # READY, NEEDS_CLARIFICATION, BLOCKED, UNVERIFIED
    summary = Column(Text, nullable=False)
    satisfied_rules = Column(Text, nullable=False)   # JSON string
    missing_items = Column(Text, nullable=False)     # JSON string
    discrepancies = Column(Text, nullable=False)     # JSON string
    recommendations = Column(Text, nullable=False)   # JSON string
    official_sources = Column(Text, nullable=False)  # JSON string
    pdf_filename = Column(String(255), nullable=True)
    generated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("ApplicationCase", back_populates="report")
