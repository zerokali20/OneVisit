import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class ServiceRule(Base):
    __tablename__ = "service_rules"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rule_code = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(64), nullable=False)  # IDENTITY, CITIZENSHIP, PREVIOUS_PASSPORT, BIOMETRICS, JURISDICTION
    description = Column(Text, nullable=False)
    official_source_url = Column(String(512), nullable=False)
    source_name = Column(String(255), default="Department of Immigration & Emigration Sri Lanka")
    verification_date = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    effective_date = Column(DateTime, nullable=True)
    review_status = Column(String(32), default="VERIFIED")  # VERIFIED, UNDER_REVIEW, UNVERIFIED
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    versions = relationship("RuleVersion", back_populates="rule", cascade="all, delete-orphan")


class RuleVersion(Base):
    __tablename__ = "rule_versions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    rule_id = Column(String(36), ForeignKey("service_rules.id", ondelete="CASCADE"), nullable=False)
    version_number = Column(Integer, nullable=False)
    rule_text = Column(Text, nullable=False)
    change_summary = Column(Text, nullable=True)
    reviewed_by = Column(String(128), default="OneVisit Verification Board")
    reviewed_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    rule = relationship("ServiceRule", back_populates="versions")
