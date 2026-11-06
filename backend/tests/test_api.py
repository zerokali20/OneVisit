import pytest
from app.core.database import SessionLocal
from app.api.v1.endpoints.cases import create_case, list_cases, get_case, update_case_answers
from app.api.v1.endpoints.rules import list_rules, audit_official_source_changes
from app.api.v1.endpoints.documents import list_documents, seed_synthetic_documents, confirm_extracted_field
from app.api.v1.endpoints.verification import trigger_agent_verification, get_agent_actions, get_verification_results, resolve_discrepancy
from app.api.v1.endpoints.reports import get_readiness_report
from app.schemas.case import ApplicationCaseCreate, ApplicantAnswerCreate
from app.schemas.document import SyntheticDocumentSeed, ExtractedFieldConfirm
from app.schemas.rule import RuleAuditChange
from app.schemas.verification import DiscrepancyResolutionRequest

@pytest.fixture
def db():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

def test_api_list_rules(db):
    rules = list_rules(db)
    assert len(rules) >= 6
    codes = [r.rule_code for r in rules]
    assert "RULE-LK-PASS-001" in codes
    assert "RULE-LK-PASS-003" in codes

def test_api_source_change_audit(db):
    audit_req = RuleAuditChange(
        rule_code="RULE-LK-PASS-001",
        detected_change="Paragraph update on DIE website regarding NIC format"
    )
    res = audit_official_source_changes(audit_req, db)
    assert res["status"] == "FLAGGED_FOR_HUMAN_REVIEW"
    assert res["current_status"] == "UNDER_REVIEW"

def test_api_case_lifecycle(db):
    # 1. Create case
    case_in = ApplicationCaseCreate(
        service_type="SRI_LANKAN_PASSPORT",
        route="FIRST_TIME",
        regional_office="Kandy"
    )
    case = create_case(case_in, db)
    assert case.id is not None
    assert case.case_number.startswith("LK-PASS-")

    # 2. Get case
    fetched = get_case(case.id, db)
    assert fetched.case_number == case.case_number

    # 3. Update answers
    answers = [
        ApplicantAnswerCreate(question_key="first_time", question_text="First time?", answer_value="yes"),
        ApplicantAnswerCreate(question_key="previous_passport_holder", question_text="Held passport?", answer_value="no")
    ]
    updated_case = update_case_answers(case.id, answers, db)
    assert len(updated_case.answers) == 2

    # 4. Seed synthetic documents
    seed = SyntheticDocumentSeed(scenario="SCENARIO_A")
    docs = seed_synthetic_documents(case.id, seed, db)
    assert len(docs) == 3

    # 5. List documents
    doc_list = list_documents(case.id, db)
    assert len(doc_list) == 3

    # 6. Verify agent execution
    summary = trigger_agent_verification(case.id, None, db)
    assert summary["overall_status"] == "NEEDS_CLARIFICATION"

    # 7. Get actions
    actions = get_agent_actions(case.id, db)
    assert len(actions) >= 5

    # 8. Resolve discrepancy
    res_req = DiscrepancyResolutionRequest(
        field_name="full_name",
        confirmed_value="KAMAL MOHAN DE SILVA",
        explanation="Applicant legal name declared in full."
    )
    res = resolve_discrepancy(case.id, res_req, db)
    assert res["status"] == "RESOLVED"
    assert res["new_overall_status"] == "READY"

    # 9. Get report
    report = get_readiness_report(case.id, db)
    assert report.overall_status == "READY"
    assert len(report.satisfied_rules) >= 5
