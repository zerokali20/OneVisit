import pytest
from app.services.rule_engine import DeterministicRuleEngine

def test_missing_all_documents():
    case_data = {
        "route": "FIRST_TIME",
        "regional_office": "Kandy",
        "answers": [],
        "documents": []
    }
    eval_res = DeterministicRuleEngine.evaluate_case(case_data)
    assert eval_res["overall_status"] == "NEEDS_CLARIFICATION"
    missing_codes = [m["rule_code"] for m in eval_res["missing_items"]]
    assert "RULE-LK-PASS-001" in missing_codes  # NIC missing
    assert "RULE-LK-PASS-002" in missing_codes  # BC missing
    assert "RULE-LK-PASS-006" in missing_codes  # Photo receipt missing

def test_first_time_applicant_complete_satisfied():
    case_data = {
        "route": "FIRST_TIME",
        "regional_office": "Kandy",
        "answers": [{"question_key": "previous_passport_holder", "answer_value": "no"}],
        "documents": [
            {
                "doc_type": "NIC",
                "extracted_fields": [
                    {"field_name": "nic_number", "field_value": "199413502910", "user_confirmed": True},
                    {"field_name": "full_name", "field_value": "KAMAL MOHAN DE SILVA", "user_confirmed": True}
                ]
            },
            {
                "doc_type": "BIRTH_CERTIFICATE",
                "extracted_fields": [
                    {"field_name": "full_name", "field_value": "KAMAL MOHAN DE SILVA", "user_confirmed": True}
                ]
            },
            {
                "doc_type": "PHOTO_RECEIPT",
                "extracted_fields": []
            }
        ]
    }
    eval_res = DeterministicRuleEngine.evaluate_case(case_data)
    assert eval_res["overall_status"] == "READY"
    assert len(eval_res["satisfied_rules"]) >= 5
    assert len(eval_res["discrepancies"]) == 0

def test_name_discrepancy_detection():
    case_data = {
        "route": "FIRST_TIME",
        "regional_office": "Kandy",
        "answers": [{"question_key": "previous_passport_holder", "answer_value": "no"}],
        "documents": [
            {
                "doc_type": "NIC",
                "extracted_fields": [
                    {"field_name": "nic_number", "field_value": "199413502910", "user_confirmed": False},
                    {"field_name": "full_name", "field_value": "K. M. SILVA", "user_confirmed": False}
                ]
            },
            {
                "doc_type": "BIRTH_CERTIFICATE",
                "extracted_fields": [
                    {"field_name": "full_name", "field_value": "KAMAL MOHAN DE SILVA", "user_confirmed": False}
                ]
            },
            {
                "doc_type": "PHOTO_RECEIPT",
                "extracted_fields": []
            }
        ]
    }
    eval_res = DeterministicRuleEngine.evaluate_case(case_data)
    assert eval_res["overall_status"] == "NEEDS_CLARIFICATION"
    assert len(eval_res["discrepancies"]) == 1
    assert eval_res["discrepancies"][0]["doc_a"] == "NIC"

def test_previous_passport_holder_missing_previous_passport():
    case_data = {
        "route": "PREVIOUS_HOLDER_RENEWAL",
        "regional_office": "Colombo Head Office",
        "answers": [{"question_key": "previous_passport_holder", "answer_value": "yes"}],
        "documents": [
            {
                "doc_type": "NIC",
                "extracted_fields": [
                    {"field_name": "nic_number", "field_value": "198865403211", "user_confirmed": True},
                    {"field_name": "full_name", "field_value": "PRIYANI NIMALKA FERNANDO", "user_confirmed": True}
                ]
            },
            {
                "doc_type": "BIRTH_CERTIFICATE",
                "extracted_fields": [
                    {"field_name": "full_name", "field_value": "PRIYANI NIMALKA FERNANDO", "user_confirmed": True}
                ]
            },
            {
                "doc_type": "PHOTO_RECEIPT",
                "extracted_fields": []
            }
        ]
    }
    eval_res = DeterministicRuleEngine.evaluate_case(case_data)
    assert eval_res["overall_status"] == "NEEDS_CLARIFICATION"
    rule_004 = next((r for r in eval_res["results"] if r["rule_code"] == "RULE-LK-PASS-004"), None)
    assert rule_004 is not None
    assert rule_004["status"] == "MISSING_EVIDENCE"
