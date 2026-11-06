import shutil
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.case import ApplicationCase
from app.models.document import Document, ExtractedField
from app.schemas.document import (
    DocumentOut, ExtractedFieldConfirm, SyntheticDocumentSeed
)
from app.services.synthetic_data import SCENARIO_A_DOCS, SCENARIO_B_DOCS
from app.services.ocr_service import extract_fields_from_text

router = APIRouter()

@router.get("/{case_id}/documents", response_model=List[DocumentOut])
def list_documents(case_id: str, db: Session = Depends(get_db)):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")
    return case.documents

@router.post("/{case_id}/documents/upload", response_model=DocumentOut, status_code=status.HTTP_201_CREATED)
async def upload_document(
    case_id: str,
    doc_type: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")

    ext = Path(file.filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File extension '{ext}' not allowed. Use PDF or JPG/PNG.")

    saved_name = f"{case_id}_{doc_type}_{file.filename}"
    save_path = settings.UPLOAD_DIR / saved_name

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    file_size = save_path.stat().st_size

    # Check for existing document of this type and replace or update
    existing = db.query(Document).filter(Document.case_id == case_id, Document.doc_type == doc_type).first()
    if existing:
        db.delete(existing)
        db.commit()

    doc = Document(
        case_id=case_id,
        doc_type=doc_type,
        file_name=file.filename,
        storage_path=str(save_path),
        mime_type=file.content_type or "application/octet-stream",
        file_size=file_size,
        verification_status="PENDING"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)

    # Automatically extract baseline fields
    dummy_text = f"Sri Lanka {doc_type} Name: Applicant Name ID: 199413502910 DOB: 1994-05-14"
    extracted = extract_fields_from_text(doc_type, dummy_text)
    for field_name, val_info in extracted.items():
        ef = ExtractedField(
            document_id=doc.id,
            field_name=field_name,
            field_value=val_info["value"],
            confidence=val_info["confidence"],
            user_confirmed=False
        )
        db.add(ef)

    case.progress_percentage = max(case.progress_percentage, 55)
    db.commit()
    db.refresh(doc)
    return doc

@router.post("/{case_id}/documents/synthetic", response_model=List[DocumentOut])
def seed_synthetic_documents(case_id: str, seed: SyntheticDocumentSeed, db: Session = Depends(get_db)):
    case = db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Application case not found")

    scenario_docs = SCENARIO_A_DOCS if seed.scenario == "SCENARIO_A" else SCENARIO_B_DOCS

    # Remove previous documents for clean seed
    db.query(Document).filter(Document.case_id == case_id).delete()
    db.commit()

    created_docs = []
    for s_doc in scenario_docs:
        doc_path = settings.UPLOAD_DIR / s_doc["file_name"]
        doc_path.write_text(s_doc["raw_text"])

        doc = Document(
            case_id=case_id,
            doc_type=s_doc["doc_type"],
            file_name=s_doc["file_name"],
            storage_path=str(doc_path),
            mime_type="application/pdf",
            file_size=len(s_doc["raw_text"]),
            verification_status="PENDING"
        )
        db.add(doc)
        db.flush()

        for f_name, f_val in s_doc["extracted_fields"].items():
            ef = ExtractedField(
                document_id=doc.id,
                field_name=f_name,
                field_value=str(f_val),
                confidence=0.98,
                user_confirmed=False
            )
            db.add(ef)
        created_docs.append(doc)

    case.progress_percentage = max(case.progress_percentage, 60)
    db.commit()
    for d in created_docs:
        db.refresh(d)
    return created_docs

@router.post("/{case_id}/fields/confirm")
def confirm_extracted_field(case_id: str, confirmation: ExtractedFieldConfirm, db: Session = Depends(get_db)):
    field = db.query(ExtractedField).filter(ExtractedField.id == confirmation.field_id).first()
    if not field:
        raise HTTPException(status_code=404, detail="Extracted field not found")

    field.user_confirmed = confirmation.user_confirmed
    if confirmation.user_corrected_value is not None:
        field.user_corrected_value = confirmation.user_corrected_value
    db.commit()
    return {"status": "success", "field_id": field.id, "confirmed": field.user_confirmed, "value": field.user_corrected_value or field.field_value}
