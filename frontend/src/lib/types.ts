export type ReadinessStatus = 'READY' | 'NEEDS_CLARIFICATION' | 'BLOCKED' | 'UNVERIFIED';

export interface ApplicantAnswer {
  id: string;
  question_key: string;
  question_text: string;
  answer_value: string;
  created_at: string;
}

export interface ApplicationCase {
  id: string;
  case_number: string;
  service_type: string;
  route?: string;
  regional_office?: string;
  readiness_status: ReadinessStatus;
  progress_percentage: number;
  created_at: string;
  updated_at: string;
  answers: ApplicantAnswer[];
}

export interface ExtractedField {
  id: string;
  field_name: string;
  field_value: string;
  confidence: number;
  user_confirmed: boolean;
  user_corrected_value?: string;
  created_at: string;
}

export interface DocumentItem {
  id: string;
  case_id: string;
  doc_type: string;
  file_name: string;
  mime_type: string;
  file_size: number;
  verification_status: string;
  uploaded_at: string;
  extracted_fields: ExtractedField[];
}

export interface ServiceRule {
  id: string;
  rule_code: string;
  title: string;
  category: string;
  description: string;
  official_source_url: string;
  source_name: string;
  verification_date: string;
  effective_date?: string;
  review_status: string;
  version: number;
}

export interface AgentAction {
  id: string;
  case_id: string;
  step_index: number;
  action_name: string;
  rationale: string;
  action_input?: string;
  action_output?: string;
  created_at: string;
}

export interface ReadinessReport {
  id: string;
  case_id: string;
  overall_status: ReadinessStatus;
  summary: string;
  satisfied_rules: Array<{ rule_code: string; details: string; evidence_refs?: any }>;
  missing_items: Array<{ item: string; rule_code: string; action: string }>;
  discrepancies: Array<{ field: string; doc_a: string; value_a: string; doc_b: string; value_b: string; reason: string; action_required: string }>;
  recommendations: string[];
  official_sources: Array<{ rule_code: string; title: string; url: string; verified: string }>;
  pdf_filename?: string;
  generated_at: string;
}
