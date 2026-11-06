import { ApplicationCase, DocumentItem, ServiceRule, AgentAction, ReadinessReport } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api/v1';

export async function fetchCases(): Promise<ApplicationCase[]> {
  const res = await fetch(`${API_BASE}/cases`);
  if (!res.ok) throw new Error('Failed to fetch cases');
  return res.json();
}

export async function createCase(payload: { service_type?: string; route?: string; regional_office?: string }): Promise<ApplicationCase> {
  const res = await fetch(`${API_BASE}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create case');
  return res.json();
}

export async function fetchCase(caseId: string): Promise<ApplicationCase> {
  const res = await fetch(`${API_BASE}/cases/${caseId}`);
  if (!res.ok) throw new Error('Failed to fetch case');
  return res.json();
}

export async function updateCaseAnswers(
  caseId: string,
  answers: Array<{ question_key: string; question_text: string; answer_value: string }>
): Promise<ApplicationCase> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/answers`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(answers),
  });
  if (!res.ok) throw new Error('Failed to save answers');
  return res.json();
}

export async function fetchDocuments(caseId: string): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/documents`);
  if (!res.ok) throw new Error('Failed to fetch documents');
  return res.json();
}

export async function seedSyntheticDocuments(caseId: string, scenario: 'SCENARIO_A' | 'SCENARIO_B'): Promise<DocumentItem[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/documents/synthetic`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scenario }),
  });
  if (!res.ok) throw new Error('Failed to seed synthetic documents');
  return res.json();
}

export async function confirmExtractedField(
  caseId: string,
  fieldId: string,
  userConfirmed: boolean,
  userCorrectedValue?: string
) {
  const res = await fetch(`${API_BASE}/cases/${caseId}/fields/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      field_id: fieldId,
      user_confirmed: userConfirmed,
      user_corrected_value: userCorrectedValue,
    }),
  });
  if (!res.ok) throw new Error('Failed to confirm field');
  return res.json();
}

export async function triggerVerification(caseId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  if (!res.ok) throw new Error('Verification failed');
  return res.json();
}

export async function fetchAgentActions(caseId: string): Promise<AgentAction[]> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/actions`);
  if (!res.ok) throw new Error('Failed to fetch agent actions');
  return res.json();
}

export async function resolveDiscrepancy(
  caseId: string,
  payload: { field_name: string; confirmed_value: string; explanation?: string }
): Promise<any> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/discrepancies/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to resolve discrepancy');
  return res.json();
}

export async function fetchReadinessReport(caseId: string): Promise<ReadinessReport> {
  const res = await fetch(`${API_BASE}/cases/${caseId}/report`);
  if (!res.ok) throw new Error('Failed to fetch readiness report');
  return res.json();
}

export async function fetchRules(): Promise<ServiceRule[]> {
  const res = await fetch(`${API_BASE}/rules`);
  if (!res.ok) throw new Error('Failed to fetch rules');
  return res.json();
}

export function getPdfDownloadUrl(caseId: string): string {
  return `${API_BASE}/cases/${caseId}/report/pdf`;
}
