import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ApplicationCase(Base):
    __tablename__ = "application_cases"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_number = Column(String(32), unique=True, index=True, nullable=False)
    service_type = Column(String(64), default="SRI_LANKAN_PASSPORT", nullable=False)
    route = Column(String(64), nullable=True)  # FIRST_TIME, PREVIOUS_HOLDER_RENEWAL, etc.
    regional_office = Column(String(64), nullable=True)  # Kandy, Matara, Vavuniya, Kurunegala, Colombo
    readiness_status = Column(String(32), default="UNVERIFIED", nullable=False)  # UNVERIFIED, NEEDS_CLARIFICATION, READY, BLOCKED
    progress_percentage = Column(Integer, default=10)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    answers = relationship("ApplicantAnswer", back_populates="case", cascade="all, delete-orphan")
    documents = relationship("Document", back_populates="case", cascade="all, delete-orphan")
    verification_results = relationship("VerificationResult", back_populates="case", cascade="all, delete-orphan")
    agent_actions = relationship("AgentAction", back_populates="case", cascade="all, delete-orphan")
    report = relationship("ReadinessReport", back_populates="case", uselist=False, cascade="all, delete-orphan")


class ApplicantAnswer(Base):
    __tablename__ = "applicant_answers"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("application_cases.id", ondelete="CASCADE"), nullable=False)
    question_key = Column(String(64), nullable=False)
    question_text = Column(Text, nullable=False)
    answer_value = Column(Text, nullable=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("ApplicationCase", back_populates="answers")
