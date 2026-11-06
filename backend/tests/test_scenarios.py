import pytest
from app.core.database import SessionLocal
from app.models.case import ApplicationCase
from app.schemas.case import ApplicationCaseCreate
from app.schemas.document import SyntheticDocumentSeed
from app.schemas.verification import DiscrepancyResolutionRequest
from app.api.v1.endpoints.cases import create_case
from app.api.v1.endpoints.documents import seed_synthetic_documents
from app.api.v1.endpoints.verification import trigger_agent_verification, resolve_discrepancy
from app.api.v1.endpoints.reports import get_readiness_report

def test_scenario_a_first_time_applicant_kandy():
    """
    Scenario A:
    1. First-time applicant selects Kandy office.
    2. Uploads synthetic documents (NIC, BC, Photo Receipt).
    3. Agent detects name mismatch ('K. M. SILVA' vs 'KAMAL MOHAN DE SILVA').
    4. Case status is 'NEEDS_CLARIFICATION'.
    5. User resolves discrepancy by confirming full legal name.
    6. Agent reruns verification.
    7. Case status transitions to 'READY'.
    8. Readiness report generated with official citations.
    """
    db = SessionLocal()
    try:
        # Step 1: Create case
        case_in = ApplicationCaseCreate(
            service_type="SRI_LANKAN_PASSPORT",
            route="FIRST_TIME",
            regional_office="Kandy"
        )
        case = create_case(case_in, db)
        assert case.regional_office == "Kandy"
        assert case.route == "FIRST_TIME"

        # Step 2: Seed synthetic documents
        seed = SyntheticDocumentSeed(scenario="SCENARIO_A")
        docs = seed_synthetic_documents(case.id, seed, db)
        assert len(docs) == 3

        # Step 3: Run agent verification
        summary = trigger_agent_verification(case.id, None, db)
        assert summary["overall_status"] == "NEEDS_CLARIFICATION"
        assert summary["discrepancies_count"] == 1

        # Step 4: Resolve discrepancy
        resolution = DiscrepancyResolutionRequest(
            field_name="full_name",
            confirmed_value="KAMAL MOHAN DE SILVA",
            explanation="K. M. stands for Kamal Mohan. Full name on birth certificate is correct."
        )
        res = resolve_discrepancy(case.id, resolution, db)
        assert res["status"] == "RESOLVED"
        assert res["new_overall_status"] == "READY"

        # Step 5: Verify readiness report
        report = get_readiness_report(case.id, db)
        assert report.overall_status == "READY"
        assert len(report.satisfied_rules) >= 5
        assert len(report.official_sources) >= 5
    finally:
        db.close()


def test_scenario_b_previous_passport_holder():
    """
    Scenario B:
    1. Previous passport holder selects Colombo office.
    2. Uploads documents with missing previous passport book.
    3. Agent checks required evidence according to RULE-LK-PASS-004.
    4. Missing evidence produces 'NEEDS_CLARIFICATION'.
    5. Report provides official DIE reference URL and required next actions.
    """
    db = SessionLocal()
    try:
        # Step 1: Create case
        case_in = ApplicationCaseCreate(
            service_type="SRI_LANKAN_PASSPORT",
            route="PREVIOUS_HOLDER_RENEWAL",
            regional_office="Colombo Head Office"
        )
        case = create_case(case_in, db)

        # Step 2: Seed synthetic documents
        seed = SyntheticDocumentSeed(scenario="SCENARIO_B")
        docs = seed_synthetic_documents(case.id, seed, db)
        assert len(docs) == 3

        # Step 3: Run agent verification
        summary = trigger_agent_verification(case.id, None, db)
        assert summary["overall_status"] == "NEEDS_CLARIFICATION"
        assert summary["missing_items_count"] >= 1

        # Step 4: Verify report
        report = get_readiness_report(case.id, db)
        assert report.overall_status == "NEEDS_CLARIFICATION"
        missing_keys = [m["item"] for m in report.missing_items]
        assert any("Previous Sri Lankan Passport" in item for item in missing_keys)
    finally:
        db.close()
