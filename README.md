# OneVisit — Agentic Civic Application Preparation Platform

> **InnovaX 1.0 Hackathon MVP**  
> *Domain: Civic Services & Community Wellbeing*  
> *Target: Sri Lankan Passport Application Preparation (Department of Immigration and Emigration — DIE)*

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2014-black.svg)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC.svg)](https://tailwindcss.com)
[![Pytest](https://img.shields.io/badge/Tests-48%20Passed-brightgreen.svg)](https://pytest.org)

---

## 1. Project Overview

OneVisit is an agentic AI preparation assistant designed to help Sri Lankan citizens prepare government service applications correctly **before** visiting a government office or lodging documents. 

In Sri Lanka, thousands of citizens face repeated visits, rejected appointments, and day-long queues at the Department of Immigration and Emigration (Battaramulla Head Office or Regional Branches in Kandy, Matara, Vavuniya, and Kurunegala) due to minor document mismatches, missing photocopies, or confusion between renewal and first-time routes.

OneVisit solves this through:
1. **Case-Specific Smart Questionnaire**: Identifies exact service route (First-Time vs Renewal/Previous Holder).
2. **Document OCR & Prompt-Injection Guards**: Extracts required identity tokens without exposing private records.
3. **Deterministic Sri Lankan Statutory Rule Engine**: Enforces published Department of Immigration regulations without LLM hallucinations.
4. **LangGraph Agent Loop (PERCEIVE → DECIDE → ACT → LOOP)**: Autonomously navigates requirements, compares cross-document tokens, and requests clarification on discrepancies.
5. **Readiness Report with Legal Citations**: Generates a verified preparation report and downloadable PDF.

> **Important Statutory Notice:** OneVisit is an independent civic preparation assistant, **not** an official government agency. It does not grant, approve, or guarantee passport applications.

---

## 2. System Architecture

```
OneVisit/
├── backend/
│   ├── app/
│   │   ├── api/v1/endpoints/    # Cases, Documents, Rules, Verification, Reports
│   │   ├── core/                # Settings, Database configuration (SQLite / PostgreSQL)
│   │   ├── models/              # SQLAlchemy models (Cases, Rules, Documents, Actions)
│   │   ├── schemas/             # Pydantic v2 schemas
│   │   ├── services/
│   │   │   ├── rule_engine.py   # Deterministic Sri Lankan passport rules
│   │   │   ├── rules_data.py    # Authoritative verified rules from immigration.gov.lk
│   │   │   ├── agent_workflow.py# LangGraph-style agent with 9 functional tools
│   │   │   ├── ocr_service.py   # OCR extraction & prompt-injection sanitizer
│   │   │   ├── synthetic_data.py# Synthetic test scenarios A & B
│   │   │   └── report_service.py# ReportLab PDF report generation
│   │   └── main.py              # FastAPI application & startup seeder
│   ├── tests/                   # 48 automated unit, integration, and scenario tests
│   ├── requirements.txt
│   └── pytest.ini
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx         # Screen 1: Trustworthy Landing Page
│   │   │   ├── dashboard/       # Screen 2: Case Dashboard
│   │   │   ├── apply/[caseId]/
│   │   │   │   ├── questionnaire/# Screen 3: Smart Guided Form
│   │   │   │   ├── documents/   # Screen 4: Document Upload & Field Review
│   │   │   │   ├── verify/      # Screen 5: AI Verification Workspace
│   │   │   │   ├── discrepancies/# Screen 6: Discrepancy Resolution Center
│   │   │   │   └── report/      # Screen 7: Readiness Report & PDF
│   │   │   └── rules/           # Verified Rules Explorer
│   │   ├── components/          # Navbar, Footer, StatusBadge, ProgressBar, Disclaimer
│   │   └── lib/                 # API client, types, multilingual translations (EN, SI, TA)
│   ├── package.json
│   └── tailwind.config.js
├── demo/
│   └── DEMO_GUIDE.md            # Hackathon walkthrough guide
├── docker-compose.yml
└── .env.example
```

---

## 3. Verified Sri Lankan Passport Rules

| Rule Code | Category | Requirement Description | Official DIE Source |
|---|---|---|---|
| **RULE-LK-PASS-001** | IDENTITY | National Identity Card (NIC) mandatory for applicants aged 16+. | [immigration.gov.lk/passports](http://www.immigration.gov.lk) |
| **RULE-LK-PASS-002** | CITIZENSHIP | Certified original Birth Certificate from Registrar General's Dept. | [immigration.gov.lk/birth-cert](http://www.immigration.gov.lk) |
| **RULE-LK-PASS-003** | IDENTITY | Full Name, Date of Birth, and NIC must match across all documents. | [immigration.gov.lk/guidelines](http://www.immigration.gov.lk) |
| **RULE-LK-PASS-004** | PREVIOUS_PASSPORT | Previous passport must be surrendered for cancellation (or police loss report). | [immigration.gov.lk/renewals](http://www.immigration.gov.lk) |
| **RULE-LK-PASS-005** | JURISDICTION | Authorized lodgement at Colombo Head Office or Regional Branches (Kandy, Matara, Vavuniya, Kurunegala). | [immigration.gov.lk/branches](http://www.immigration.gov.lk) |
| **RULE-LK-PASS-006** | BIOMETRICS | Studio photo acknowledgement receipt with ICAO barcode within 3 months. | [immigration.gov.lk/biometrics](http://www.immigration.gov.lk) |

---

## 4. Quick Start (Local Development)

### 4.1 Backend Setup
```powershell
cd backend
# Virtual environment is configured
.\venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
- Interactive Swagger API docs: `http://127.0.0.1:8000/api/v1/docs`
- Health check: `http://127.0.0.1:8000/health`

### 4.2 Frontend Setup
```powershell
cd frontend
npm run dev
```
Open your browser at `http://localhost:3000`.

### 4.3 Running Automated Test Battery (48 Tests)
```powershell
cd backend
.\venv\Scripts\pytest.exe -v
```
All 48 tests will execute in under 2 seconds, verifying route selection, boundary ages, regional jurisdiction, name consistency, prompt-injection defense, and end-to-end synthetic scenarios A & B.

---

## 5. Hackathon Demonstration Scenarios

### Scenario A: First-Time Applicant with Name Discrepancy
- **Applicant:** Kamal Mohan de Silva (Kandy Regional Office)
- **Features Tested:** Synthetic document seeding, OCR extraction, initial vs. full name variance detection (`K. M. Silva` vs `Kamal Mohan de Silva`), AI clarification prompt, applicant resolution, and transition to `READY`.

### Scenario B: Previous Passport Holder Missing Evidence
- **Applicant:** Priyani Nimalka Fernando (Colombo Head Office Renewal)
- **Features Tested:** Renewal route evaluation, missing previous passport detection (`RULE-LK-PASS-004`), status marked as `NEEDS_CLARIFICATION`, and legal citations provided for compliance.

*For detailed evaluation steps, refer to [demo/DEMO_GUIDE.md](demo/DEMO_GUIDE.md).*

---

## 6. AI Safety & Privacy Guardrails

1. **Deterministic Rule Enforcement**: Legal eligibility decisions are calculated strictly by the deterministic rule engine. The LLM can suggest next actions or clarify issues, but cannot overturn a statutory rule.
2. **Prompt-Injection Sanitization**: Uploaded files and OCR strings are actively scanned for prompt-injection attacks (`ignore previous instructions`, `developer mode`, `<script>`, etc.) and disarmed before reaching the agent.
3. **External Source-Change Integrity**: If an official government URL changes text, the system automatically flags the rule as `UNDER_REVIEW` and requires human committee sign-off before modifying verification logic.
4. **Data Minimization & Zero Cloud Retention**: Designed with local synthetic document vaults and no third-party credential dependencies for core readiness verification.
