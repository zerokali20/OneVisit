import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Integer, Float, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    case_id = Column(String(36), ForeignKey("application_cases.id", ondelete="CASCADE"), nullable=False)
    doc_type = Column(String(64), nullable=False)  # NIC, BIRTH_CERTIFICATE, PREVIOUS_PASSPORT, PHOTO_RECEIPT, POLICE_REPORT
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    mime_type = Column(String(128), default="application/pdf")
    file_size = Column(Integer, default=0)
    verification_status = Column(String(32), default="PENDING")  # PENDING, VERIFIED, DISCREPANT, REJECTED
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    case = relationship("ApplicationCase", back_populates="documents")
    extracted_fields = relationship("ExtractedField", back_populates="document", cascade="all, delete-orphan")


class ExtractedField(Base):
    __tablename__ = "extracted_fields"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    document_id = Column(String(36), ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    field_name = Column(String(64), nullable=False)  # full_name, nic_number, date_of_birth, etc.
    field_value = Column(String(512), nullable=False)
    confidence = Column(Float, default=1.0)
    user_confirmed = Column(Boolean, default=False)
    user_corrected_value = Column(String(512), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    document = relationship("Document", back_populates="extracted_fields")
