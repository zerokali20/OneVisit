# OneVisit — InnovaX 1.0 Hackathon Demonstration Guide

This guide walks judges and reviewers through the two mandatory synthetic applicant scenarios.

---

## Prerequisites & Launch

### 1. Launch Backend (FastAPI on Port 8000)
```powershell
cd d:\Github\OneVisit\backend
.\venv\Scripts\python.exe -m uvicorn app.main:app --port 8000 --reload
```
API Docs available at: `http://localhost:8000/api/v1/docs`

### 2. Launch Frontend (Next.js on Port 3000)
```powershell
cd d:\Github\OneVisit\frontend
npm run dev
```
Open your browser at: `http://localhost:3000`

---

## Scenario A: First-Time Applicant with Name Discrepancy

**Applicant Persona:** Kamal Mohan de Silva  
**Jurisdiction:** Kandy Regional Branch  
**Test Objective:** Validates route selection, synthetic document upload, OCR extraction, cross-document name variance detection, AI agent clarification request, applicant resolution, and final readiness transition to `READY`.

### Step-by-Step Walkthrough:
1. Open `http://localhost:3000`.
2. On the Hero section, click the **"Scenario A: First-Time (Kandy)"** quick-load button (or click "Start Application" and select First-Time + Kandy).
3. The system seeds synthetic documents:
   - **NIC**: Shows name as `"K. M. SILVA"`, ID `199413502910`, DOB `1994-05-14`.
   - **Birth Certificate**: Shows name as `"KAMAL MOHAN DE SILVA"`, ID `199413502910`, DOB `1994-05-14`.
   - **Photo Receipt**: Shows Studio Supreme Kandy with ICAO barcode.
4. Click **"Launch AI Verification Workspace"**.
5. Click **"Run AI Verification Agent"**.
6. Observe the Agent Execution Cycle:
   - Phase 1: `get_case_state`
   - Phase 2: `retrieve_verified_rules`
   - Phase 3: `compare_document_fields` detects variance between `"K. M. SILVA"` and `"KAMAL MOHAN DE SILVA"`.
   - Phase 4: `evaluate_eligibility` flags `RULE-LK-PASS-003` with status `DISCREPANCY_DETECTED`.
   - Overall Verdict updates to **`NEEDS_CLARIFICATION`**.
7. Click **"Resolve Discrepancies"**.
8. In the Discrepancy Resolution Center:
   - View the side-by-side comparison.
   - Confirm full legal name: `"KAMAL MOHAN DE SILVA"`.
   - Click **"Confirm Legal Name & Rerun Verification"**.
9. The agent re-runs verification. Status transitions to **`READY`**!
10. Click **"View Readiness Report"** and **"Download PDF Report"** to inspect the printable checklist with official DIE references.

---

## Scenario B: Previous Passport Holder with Missing Evidence

**Applicant Persona:** Priyani Nimalka Fernando  
**Jurisdiction:** Colombo Head Office (Battaramulla)  
**Test Objective:** Validates alteration/renewal route, missing previous passport surrender detection (`RULE-LK-PASS-004`), and clear explanation citing official regulations.

### Step-by-Step Walkthrough:
1. Return to `http://localhost:3000`.
2. Click **"Scenario B: Renewal (Colombo)"**.
3. The system seeds synthetic documents:
   - **NIC**: Shows `"PRIYANI NIMALKA FERNANDO"`, ID `198865403211`.
   - **Birth Certificate**: Shows `"PRIYANI NIMALKA FERNANDO"`, ID `198865403211`.
   - **Photo Receipt**: Studio receipt present.
   - **Previous Passport**: *Intentionally omitted to test missing evidence enforcement.*
4. Click **"Launch AI Verification Workspace"**.
5. Click **"Run AI Verification Agent"**.
6. Observe the agent action:
   - `RULE-LK-PASS-004` (Previous Passport Surrender or Cancellation Proof) evaluates to `MISSING_EVIDENCE`.
   - Verdict correctly marks case as **`NEEDS_CLARIFICATION`**.
7. View the report:
   - Explains that under official immigration law, previous passports must be surrendered or certified with a police loss report.
   - Provides direct link to the Department of Immigration official renewal portal.
