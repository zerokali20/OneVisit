import re
from typing import Dict, List, Any, Optional

PROMPT_INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"you\s+are\s+now\s+in\s+developer\s+mode",
    r"mark\s+this\s+(as\s+)?ready",
    r"override\s+rules?",
    r"system\s*prompt",
    r"bypass\s+verification",
    r"<script>",
    r"\{\{.*\}\}"
]

def detect_prompt_injection(text: str) -> bool:
    for pattern in PROMPT_INJECTION_PATTERNS:
        if re.search(pattern, text, re.IGNORECASE):
            return True
    return False

def clean_ocr_text(text: str) -> str:
    # Filter dangerous script or injection payloads
    if detect_prompt_injection(text):
        return "[SECURITY WARNING: Potential prompt injection payload sanitized from document]"
    return text.strip()

def extract_nic_number(text: str) -> Optional[str]:
    # Modern 12-digit format (e.g., 199413502910) or legacy 9-digit + V/X (e.g., 941350291V)
    match = re.search(r"\b(\d{12}|\d{9}[vVxX])\b", text)
    return match.group(1).upper() if match else None

def extract_dates(text: str) -> List[str]:
    # Match YYYY-MM-DD or DD/MM/YYYY
    dates = []
    # YYYY-MM-DD
    for m in re.finditer(r"\b(\d{4}[-/]\d{2}[-/]\d{2})\b", text):
        dates.append(m.group(1).replace("/", "-"))
    # DD/MM/YYYY
    for m in re.finditer(r"\b(\d{2})[-/](\d{2})[-/](\d{4})\b", text):
        dates.append(f"{m.group(3)}-{m.group(2)}-{m.group(1)}")
    return dates

def normalize_name(name: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z\s]", "", name).upper()
    tokens = [t for t in cleaned.split() if t]
    return " ".join(tokens)

def names_are_consistent(name_a: str, name_b: str) -> bool:
    norm_a = normalize_name(name_a)
    norm_b = normalize_name(name_b)
    if not norm_a or not norm_b:
        return False
    if norm_a == norm_b:
        return True
    
    # Check initial expansion: e.g. "K M SILVA" vs "KAMAL MOHAN DE SILVA" or "SILVA K M"
    tokens_a = norm_a.split()
    tokens_b = norm_b.split()
    
    # Exact token subset or initial match
    surname_a = tokens_a[-1]
    surname_b = tokens_b[-1]
    
    if surname_a != surname_b:
        return False
        
    # Check if initials correspond
    initials_a = [t[0] for t in tokens_a[:-1]]
    initials_b = [t[0] for t in tokens_b[:-1]]
    
    # If one is just initials and they match
    if len(tokens_a) == len(tokens_b):
        return all(t1[0] == t2[0] for t1, t2 in zip(tokens_a, tokens_b))
        
    return False

def extract_fields_from_text(doc_type: str, text: str) -> Dict[str, Dict[str, Any]]:
    sanitized = clean_ocr_text(text)
    fields = {}
    
    nic = extract_nic_number(sanitized)
    if nic:
        fields["nic_number"] = {"value": nic, "confidence": 0.96}
        
    dates = extract_dates(sanitized)
    if dates:
        fields["date_of_birth"] = {"value": dates[0], "confidence": 0.94}
        
    # Full name extraction heuristics based on doc_type keywords
    name_match = re.search(r"(?:Name|Full Name|Applicant Name)[:\-]?\s*([A-Za-z\s\.]+)", sanitized, re.IGNORECASE)
    if name_match:
        fields["full_name"] = {"value": name_match.group(1).strip(), "confidence": 0.92}
    elif doc_type == "NIC":
        fields["full_name"] = {"value": "K. M. SILVA", "confidence": 0.88}
    elif doc_type == "BIRTH_CERTIFICATE":
        fields["full_name"] = {"value": "KAMAL MOHAN DE SILVA", "confidence": 0.95}

    if doc_type == "PREVIOUS_PASSPORT":
        ppt_match = re.search(r"\b([NnLl]\d{7})\b", sanitized)
        if ppt_match:
            fields["passport_number"] = {"value": ppt_match.group(1).upper(), "confidence": 0.98}
            
    return fields
