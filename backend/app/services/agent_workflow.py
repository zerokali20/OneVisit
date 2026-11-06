import json
from typing import Dict, List, Any, Optional
from datetime import datetime, timezone
from sqlalchemy.orm import Session

from app.models.case import ApplicationCase
from app.models.document import Document, ExtractedField
from app.models.rule import ServiceRule
from app.models.verification import VerificationResult, AgentAction
from app.models.report import ReadinessReport
from app.services.rule_engine import DeterministicRuleEngine
from app.services.ocr_service import extract_fields_from_text, names_are_consistent

class VerificationAgent:
    def __init__(self, db: Session, case_id: str):
        self.db = db
        self.case_id = case_id
        self.case = self.db.query(ApplicationCase).filter(ApplicationCase.id == case_id).first()
        if not self.case:
            raise ValueError(f"Application case {case_id} not found")
        self.step_index = 0
        self.action_logs: List[Dict[str, Any]] = []

    def _record_action(self, action_name: str, rationale: str, action_input: Any, action_output: Any):
        self.step_index += 1
        action = AgentAction(
            case_id=self.case_id,
            step_index=self.step_index,
            action_name=action_name,
            rationale=rationale,
            action_input=json.dumps(action_input) if action_input is not None else None,
            action_output=json.dumps(action_output) if action_output is not None else None,
            created_at=datetime.now(timezone.utc)
        )
        self.db.add(action)
        self.db.commit()
        self.action_logs.append({
            "step": self.step_index,
            "action": action_name,
            "rationale": rationale,
            "output": action_output
        })

    # ================= TOOL 1 =================
    def get_case_state(self) -> Dict[str, Any]:
        """Tool 1: Inspect the current case state and attached documents."""
        self.db.refresh(self.case)
        state = {
            "case_id": self.case.id,
            "case_number": self.case.case_number,
            "route": self.case.route,
            "regional_office": self.case.regional_office,
            "readiness_status": self.case.readiness_status,
            "answers": [
                {"question_key": a.question_key, "question_text": a.question_text, "answer_value": a.answer_value}
                for a in self.case.answers
            ],
            "documents": [
                {
                    "id": d.id,
                    "doc_type": d.doc_type,
                    "file_name": d.file_name,
                    "status": d.verification_status,
                    "extracted_fields": [
                        {
                            "field_name": f.field_name,
                            "field_value": f.field_value,
                            "user_confirmed": f.user_confirmed,
                            "user_corrected_value": f.user_corrected_value
                        } for f in d.extracted_fields
                    ]
                } for d in self.case.documents
            ]
        }
        self._record_action(
            action_name="get_case_state",
            rationale="Perceiving case parameters, route, regional office, and uploaded evidence state.",
            action_input={"case_id": self.case_id},
            action_output={"route": state["route"], "doc_count": len(state["documents"])}
        )
        return state

    # ================= TOOL 2 =================
    def retrieve_verified_rules(self) -> List[Dict[str, Any]]:
        """Tool 2: Retrieve versioned, reviewed rules from official store."""
        rules = self.db.query(ServiceRule).filter(ServiceRule.review_status == "VERIFIED").all()
        rules_data = [
            {
                "rule_code": r.rule_code,
                "title": r.title,
                "category": r.category,
                "description": r.description,
                "source_url": r.official_source_url,
                "version": r.version
            } for r in rules
        ]
        self._record_action(
            action_name="retrieve_verified_rules",
            rationale="Fetching authoritative Sri Lankan passport requirements to guide verification.",
            action_input={},
            action_output={"verified_rules_count": len(rules_data)}
        )
        return rules_data

    # ================= TOOL 3 =================
    def extract_document_fields(self, doc_id: str) -> Dict[str, Any]:
        """Tool 3: Extract structured fields from a document with confidence scores."""
        doc = self.db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            return {"error": "Document not found"}

        # If fields are already extracted and confirmed, keep them
        existing = {f.field_name: f for f in doc.extracted_fields}
        extracted = {}
        for name, field in existing.items():
            extracted[name] = field.user_corrected_value or field.field_value

        self._record_action(
            action_name="extract_document_fields",
            rationale=f"Extracting identity and validation tokens from {doc.doc_type} ({doc.file_name}).",
            action_input={"doc_id": doc_id, "doc_type": doc.doc_type},
            action_output=extracted
        )
        return extracted

    # ================= TOOL 4 =================
    def compare_document_fields(self, doc_a_type: str, doc_b_type: str, field_name: str) -> Dict[str, Any]:
        """Tool 4: Cross-document identity token comparison."""
        case_state = self.get_case_state()
        docs = {d["doc_type"]: d for d in case_state["documents"]}
        if doc_a_type not in docs or doc_b_type not in docs:
            return {"match": False, "reason": "One or both documents missing"}

        fields_a = {f["field_name"]: f.get("user_corrected_value") or f.get("field_value") for f in docs[doc_a_type]["extracted_fields"]}
        fields_b = {f["field_name"]: f.get("user_corrected_value") or f.get("field_value") for f in docs[doc_b_type]["extracted_fields"]}

        val_a = fields_a.get(field_name, "")
        val_b = fields_b.get(field_name, "")

        consistent = names_are_consistent(val_a, val_b) if field_name == "full_name" else (val_a == val_b)
        res = {
            "field": field_name,
            "doc_a": doc_a_type,
            "val_a": val_a,
            "doc_b": doc_b_type,
            "val_b": val_b,
            "consistent": consistent
        }
        self._record_action(
            action_name="compare_document_fields",
            rationale=f"Cross-checking {field_name} across {doc_a_type} and {doc_b_type} to verify identity consistency.",
            action_input={"doc_a": doc_a_type, "doc_b": doc_b_type, "field": field_name},
            action_output=res
        )
        return res

    # ================= TOOL 5 =================
    def evaluate_eligibility(self) -> Dict[str, Any]:
        """Tool 5: Invoke deterministic rule engine against verified case data."""
        state = self.get_case_state()
        eval_result = DeterministicRuleEngine.evaluate_case(state)
        
        # Persist verification results to DB
        self.db.query(VerificationResult).filter(VerificationResult.case_id == self.case_id).delete()
        for r in eval_result["results"]:
            vr = VerificationResult(
                case_id=self.case_id,
                rule_code=r["rule_code"],
                status=r["status"],
                details=r["details"],
                evidence_refs=json.dumps(r.get("evidence_refs", {}))
            )
            self.db.add(vr)
        self.db.commit()

        self._record_action(
            action_name="evaluate_eligibility",
            rationale="Running deterministic Sri Lankan passport eligibility evaluation against official rules.",
            action_input={},
            action_output={"overall_status": eval_result["overall_status"], "satisfied_count": len(eval_result["satisfied_rules"])}
        )
        return eval_result

    # ================= TOOL 6 =================
    def identify_missing_evidence(self) -> List[Dict[str, Any]]:
        """Tool 6: Scan for missing evidence based on applicant route and rules."""
        eval_result = self.evaluate_eligibility()
        missing = eval_result["missing_items"]
        self._record_action(
            action_name="identify_missing_evidence",
            rationale="Identifying absent documents and required submissions according to route guidelines.",
            action_input={},
            action_output={"missing_items": missing}
        )
        return missing

    # ================= TOOL 7 =================
    def request_user_clarification(self, discrepancies: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Tool 7: Flag inconsistencies and formulate clarification request for applicant."""
        clarification_data = {
            "action_needed": "USER_CLARIFICATION",
            "discrepancies": discrepancies,
            "guidance": "Please review the flagged values and confirm your exact legal name or upload supplemental documentation."
        }
        self._record_action(
            action_name="request_user_clarification",
            rationale="Formulating user-facing clarification prompt for detected data discrepancies.",
            action_input={"discrepancy_count": len(discrepancies)},
            action_output=clarification_data
        )
        return clarification_data

    # ================= TOOL 8 =================
    def update_case_state(self, new_status: str, progress: int) -> None:
        """Tool 8: Update persistent case readiness state."""
        self.case.readiness_status = new_status
        self.case.progress_percentage = progress
        self.case.updated_at = datetime.now(timezone.utc)
        self.db.commit()
        self._record_action(
            action_name="update_case_state",
            rationale=f"Updating case state to '{new_status}' with progress {progress}%.",
            action_input={"status": new_status, "progress": progress},
            action_output={"updated": True}
        )

    # ================= TOOL 9 =================
    def generate_readiness_report(self, eval_result: Dict[str, Any]) -> ReadinessReport:
        """Tool 9: Produce structured readiness report with official citations."""
        rules = self.db.query(ServiceRule).all()
        rule_map = {r.rule_code: r for r in rules}

        official_sources = [
            {"rule_code": r.rule_code, "title": r.title, "url": r.official_source_url, "verified": r.verification_date.isoformat()}
            for r in rules
        ]

        summary_text = (
            f"OneVisit application preparation assessment for Sri Lankan Passport ({self.case.route}) "
            f"at {self.case.regional_office} branch. Overall readiness status: {eval_result['overall_status']}."
        )

        existing_report = self.db.query(ReadinessReport).filter(ReadinessReport.case_id == self.case_id).first()
        if existing_report:
            existing_report.overall_status = eval_result["overall_status"]
            existing_report.summary = summary_text
            existing_report.satisfied_rules = json.dumps(eval_result["satisfied_rules"])
            existing_report.missing_items = json.dumps(eval_result["missing_items"])
            existing_report.discrepancies = json.dumps(eval_result["discrepancies"])
            existing_report.recommendations = json.dumps(eval_result["recommendations"])
            existing_report.official_sources = json.dumps(official_sources)
            existing_report.generated_at = datetime.now(timezone.utc)
            report = existing_report
        else:
            report = ReadinessReport(
                case_id=self.case_id,
                overall_status=eval_result["overall_status"],
                summary=summary_text,
                satisfied_rules=json.dumps(eval_result["satisfied_rules"]),
                missing_items=json.dumps(eval_result["missing_items"]),
                discrepancies=json.dumps(eval_result["discrepancies"]),
                recommendations=json.dumps(eval_result["recommendations"]),
                official_sources=json.dumps(official_sources),
                generated_at=datetime.now(timezone.utc)
            )
            self.db.add(report)
        self.db.commit()

        self._record_action(
            action_name="generate_readiness_report",
            rationale="Compiling personalized readiness report with verified legal sources and preparation advice.",
            action_input={"status": eval_result["overall_status"]},
            action_output={"report_id": report.id}
        )
        return report

    # ================= FULL AGENT LOOP =================
    def run_agent_loop(self) -> Dict[str, Any]:
        """
        PERCEIVE -> DECIDE -> ACT -> LOOP
        Autonomous verification cycle governed by deterministic rule validation.
        """
        # Step 1: Perceive current case
        state = self.get_case_state()
        
        # Step 2: Retrieve verified rules
        self.retrieve_verified_rules()
        
        # Step 3: Inspect uploaded documents and extracted fields
        for doc in state["documents"]:
            self.extract_document_fields(doc["id"])
            
        # Step 4: Cross-document identity comparison if NIC and BC present
        docs_present = [d["doc_type"] for d in state["documents"]]
        if "NIC" in docs_present and "BIRTH_CERTIFICATE" in docs_present:
            self.compare_document_fields("NIC", "BIRTH_CERTIFICATE", "full_name")
            
        # Step 5: Deterministic rule evaluation
        eval_result = self.evaluate_eligibility()
        
        # Step 6: Decide next action based on outcome
        if eval_result["discrepancies"]:
            self.request_user_clarification(eval_result["discrepancies"])
            self.update_case_state("NEEDS_CLARIFICATION", progress=65)
        elif eval_result["missing_items"]:
            self.identify_missing_evidence()
            self.update_case_state("NEEDS_CLARIFICATION", progress=50)
        elif eval_result["overall_status"] == "READY":
            self.update_case_state("READY", progress=100)
        else:
            self.update_case_state(eval_result["overall_status"], progress=40)
            
        # Step 7: Generate readiness report
        report = self.generate_readiness_report(eval_result)
        
        return {
            "case_id": self.case_id,
            "overall_status": eval_result["overall_status"],
            "progress_percentage": self.case.progress_percentage,
            "satisfied_rules_count": len(eval_result["satisfied_rules"]),
            "missing_items_count": len(eval_result["missing_items"]),
            "discrepancies_count": len(eval_result["discrepancies"]),
            "actions_executed": self.action_logs
        }
