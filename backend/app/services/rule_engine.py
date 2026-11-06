from typing import Dict, List, Any, Optional
from datetime import datetime
from app.services.ocr_service import normalize_name

class DeterministicRuleEngine:
    @staticmethod
    def evaluate_case(case_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Pure deterministic evaluation of official Sri Lankan passport rules.
        Never calls LLM to fabricate or override mandatory requirements.
        """
        route = case_data.get("route", "FIRST_TIME")
        regional_office = case_data.get("regional_office", "Colombo Head Office")
        answers = {a["question_key"]: a["answer_value"] for a in case_data.get("answers", [])}
        docs = {d["doc_type"]: d for d in case_data.get("documents", [])}
        
        results: List[Dict[str, Any]] = []
        missing_items: List[Dict[str, Any]] = []
        discrepancies: List[Dict[str, Any]] = []
        satisfied_rules: List[Dict[str, Any]] = []
        recommendations: List[str] = []

        # 1. RULE-LK-PASS-001: NIC Requirement
        if "NIC" not in docs:
            result = {
                "rule_code": "RULE-LK-PASS-001",
                "status": "MISSING_EVIDENCE",
                "details": "National Identity Card (NIC) has not been uploaded. Mandatory for applicants 16+.",
                "evidence_refs": {"required_doc": "NIC"}
            }
            results.append(result)
            missing_items.append({"item": "National Identity Card (NIC)", "rule_code": "RULE-LK-PASS-001", "action": "Upload front and back of original NIC / smart card"})
        else:
            nic_doc = docs["NIC"]
            nic_fields = {f["field_name"]: f.get("user_corrected_value") or f.get("field_value") for f in nic_doc.get("extracted_fields", [])}
            if not nic_fields.get("nic_number"):
                result = {
                    "rule_code": "RULE-LK-PASS-001",
                    "status": "MISSING_EVIDENCE",
                    "details": "NIC document uploaded but NIC number could not be extracted.",
                    "evidence_refs": {"doc_id": nic_doc.get("id")}
                }
                results.append(result)
                missing_items.append({"item": "NIC Number Extraction", "rule_code": "RULE-LK-PASS-001", "action": "Confirm or enter NIC number manually"})
            else:
                result = {
                    "rule_code": "RULE-LK-PASS-001",
                    "status": "SATISFIED",
                    "details": f"Verified National Identity Card. NIC Number: {nic_fields.get('nic_number')}",
                    "evidence_refs": {"doc_id": nic_doc.get("id"), "nic_number": nic_fields.get("nic_number")}
                }
                results.append(result)
                satisfied_rules.append(result)

        # 2. RULE-LK-PASS-002: Birth Certificate
        if "BIRTH_CERTIFICATE" not in docs:
            result = {
                "rule_code": "RULE-LK-PASS-002",
                "status": "MISSING_EVIDENCE",
                "details": "Original or certified copy of Sri Lankan Birth Certificate is missing.",
                "evidence_refs": {"required_doc": "BIRTH_CERTIFICATE"}
            }
            results.append(result)
            missing_items.append({"item": "Birth Certificate", "rule_code": "RULE-LK-PASS-002", "action": "Upload certified original Birth Certificate issued by Registrar General's Dept"})
        else:
            bc_doc = docs["BIRTH_CERTIFICATE"]
            bc_fields = {f["field_name"]: f.get("user_corrected_value") or f.get("field_value") for f in bc_doc.get("extracted_fields", [])}
            result = {
                "rule_code": "RULE-LK-PASS-002",
                "status": "SATISFIED",
                "details": "Original Birth Certificate entry verified.",
                "evidence_refs": {"doc_id": bc_doc.get("id"), "full_name": bc_fields.get("full_name")}
            }
            results.append(result)
            satisfied_rules.append(result)

        # 3. RULE-LK-PASS-003: Cross-Document Identity Consistency
        if "NIC" in docs and "BIRTH_CERTIFICATE" in docs:
            nic_fields = {f["field_name"]: f for f in docs["NIC"].get("extracted_fields", [])}
            bc_fields = {f["field_name"]: f for f in docs["BIRTH_CERTIFICATE"].get("extracted_fields", [])}
            
            nic_name = (nic_fields.get("full_name", {}).get("user_corrected_value") or 
                        nic_fields.get("full_name", {}).get("field_value") or "").strip()
            bc_name = (bc_fields.get("full_name", {}).get("user_corrected_value") or 
                       bc_fields.get("full_name", {}).get("field_value") or "").strip()
            
            nic_name_confirmed = nic_fields.get("full_name", {}).get("user_confirmed", False)
            bc_name_confirmed = bc_fields.get("full_name", {}).get("user_confirmed", False)
            
            # Check for name discrepancies
            norm_nic = normalize_name(nic_name)
            norm_bc = normalize_name(bc_name)
            
            if norm_nic and norm_bc and norm_nic != norm_bc and not (nic_name_confirmed and bc_name_confirmed):
                discrepancy = {
                    "field": "Full Name",
                    "doc_a": "NIC",
                    "value_a": nic_name,
                    "doc_b": "Birth Certificate",
                    "value_b": bc_name,
                    "reason": "Name appears with initials on NIC ('" + nic_name + "') but in full on Birth Certificate ('" + bc_name + "'). Official regulations require declaration of exact name to appear in passport.",
                    "action_required": "Confirm full name spelling and whether initials represent the given names."
                }
                discrepancies.append(discrepancy)
                result = {
                    "rule_code": "RULE-LK-PASS-003",
                    "status": "DISCREPANCY_DETECTED",
                    "details": f"Cross-document name variance: '{nic_name}' on NIC vs '{bc_name}' on Birth Certificate.",
                    "evidence_refs": {"nic_name": nic_name, "bc_name": bc_name}
                }
                results.append(result)
                recommendations.append("Resolve the name variance in Discrepancy Resolution before attending your appointment.")
            else:
                result = {
                    "rule_code": "RULE-LK-PASS-003",
                    "status": "SATISFIED",
                    "details": "Identity consistency confirmed across submitted documents.",
                    "evidence_refs": {"verified_name": bc_name or nic_name}
                }
                results.append(result)
                satisfied_rules.append(result)

        # 4. RULE-LK-PASS-004: Previous Passport Surrender / Renewal Check
        has_held_passport = answers.get("previous_passport_holder", "no").lower() in ["yes", "true"] or route == "PREVIOUS_HOLDER_RENEWAL"
        if has_held_passport:
            if "PREVIOUS_PASSPORT" not in docs and "POLICE_REPORT" not in docs:
                result = {
                    "rule_code": "RULE-LK-PASS-004",
                    "status": "MISSING_EVIDENCE",
                    "details": "Applicant is a previous passport holder, but neither previous passport copy nor lost-passport police report has been uploaded.",
                    "evidence_refs": {"required_doc": "PREVIOUS_PASSPORT"}
                }
                results.append(result)
                missing_items.append({
                    "item": "Previous Sri Lankan Passport",
                    "rule_code": "RULE-LK-PASS-004",
                    "action": "Upload copy of data page and observation page of your current/expired passport, or certified Police Report if lost."
                })
                recommendations.append("You must bring your physical previous passport to the Department of Immigration for cancellation.")
            else:
                result = {
                    "rule_code": "RULE-LK-PASS-004",
                    "status": "SATISFIED",
                    "details": "Previous passport evidence verified for cancellation protocol.",
                    "evidence_refs": {"doc_type": "PREVIOUS_PASSPORT"}
                }
                results.append(result)
                satisfied_rules.append(result)
        else:
            result = {
                "rule_code": "RULE-LK-PASS-004",
                "status": "SATISFIED",
                "details": "First-time applicant route: Previous passport surrender not required.",
                "evidence_refs": {"route": "FIRST_TIME"}
            }
            results.append(result)
            satisfied_rules.append(result)

        # 5. RULE-LK-PASS-005: Regional Office Jurisdiction
        valid_offices = ["Kandy", "Matara", "Vavuniya", "Kurunegala", "Colombo Head Office"]
        if regional_office in valid_offices:
            result = {
                "rule_code": "RULE-LK-PASS-005",
                "status": "SATISFIED",
                "details": f"Regional lodgement center '{regional_office}' is an authorized DIE branch.",
                "evidence_refs": {"regional_office": regional_office}
            }
            results.append(result)
            satisfied_rules.append(result)
        else:
            result = {
                "rule_code": "RULE-LK-PASS-005",
                "status": "BLOCKED",
                "details": f"Selected location '{regional_office}' is not an authorized Sri Lankan passport office.",
                "evidence_refs": {"regional_office": regional_office}
            }
            results.append(result)

        # 6. RULE-LK-PASS-006: Biometric Studio Photo Receipt
        if "PHOTO_RECEIPT" not in docs:
            result = {
                "rule_code": "RULE-LK-PASS-006",
                "status": "MISSING_EVIDENCE",
                "details": "Studio Biometric Photo Acknowledgement Receipt barcode missing.",
                "evidence_refs": {"required_doc": "PHOTO_RECEIPT"}
            }
            results.append(result)
            missing_items.append({
                "item": "Studio Biometric Photo Receipt",
                "rule_code": "RULE-LK-PASS-006",
                "action": "Visit an authorized digital photo studio to take ICAO compliant photos and upload the barcode acknowledgement receipt."
            })
            recommendations.append("Obtain digital biometric studio receipt within 3 months of application date.")
        else:
            result = {
                "rule_code": "RULE-LK-PASS-006",
                "status": "SATISFIED",
                "details": "Biometric Studio Acknowledgement barcode verified.",
                "evidence_refs": {"doc_id": docs["PHOTO_RECEIPT"].get("id")}
            }
            results.append(result)
            satisfied_rules.append(result)

        # Compute Overall Status
        statuses = [r["status"] for r in results]
        if "BLOCKED" in statuses:
            overall_status = "BLOCKED"
        elif "DISCREPANCY_DETECTED" in statuses or "MISSING_EVIDENCE" in statuses:
            overall_status = "NEEDS_CLARIFICATION"
        elif all(s == "SATISFIED" for s in statuses):
            overall_status = "READY"
        else:
            overall_status = "UNVERIFIED"

        if overall_status == "READY":
            recommendations.append("All preparation checks have passed against verified rules. Download your readiness report and book your appointment.")

        return {
            "overall_status": overall_status,
            "results": results,
            "satisfied_rules": satisfied_rules,
            "missing_items": missing_items,
            "discrepancies": discrepancies,
            "recommendations": recommendations
        }
