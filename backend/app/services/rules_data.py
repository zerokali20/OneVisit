from datetime import datetime, timezone

VERIFIED_RULES_DATA = [
    {
        "rule_code": "RULE-LK-PASS-001",
        "title": "National Identity Card (NIC) Requirement",
        "category": "IDENTITY",
        "description": "Applicants aged 16 years or older must submit the original National Identity Card (NIC) or electronic NIC (smart card) issued by the Department for Registration of Persons.",
        "official_source_url": "http://www.immigration.gov.lk/web/index.php?option=com_content&view=article&id=138&Itemid=198&lang=en",
        "source_name": "Department of Immigration and Emigration Sri Lanka - Passport Requirements",
        "verification_date": datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc),
        "review_status": "VERIFIED",
        "version": 1
    },
    {
        "rule_code": "RULE-LK-PASS-002",
        "title": "Certified Original Birth Certificate",
        "category": "CITIZENSHIP",
        "description": "Original Birth Certificate issued by the Registrar General's Department or a certified copy issued within the last 3 months by the Divisional Secretariat is mandatory.",
        "official_source_url": "http://www.immigration.gov.lk/web/index.php?option=com_content&view=article&id=138&Itemid=198&lang=en",
        "source_name": "Department of Immigration and Emigration Sri Lanka - Birth Certificate Guidelines",
        "verification_date": datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc),
        "review_status": "VERIFIED",
        "version": 1
    },
    {
        "rule_code": "RULE-LK-PASS-003",
        "title": "Cross-Document Identity Consistency",
        "category": "IDENTITY",
        "description": "The applicant's full name, date of birth, and identity number must match consistently across the application questionnaire, National Identity Card, and Birth Certificate.",
        "official_source_url": "http://www.immigration.gov.lk/web/index.php?option=com_content&view=article&id=140&Itemid=200&lang=en",
        "source_name": "Department of Immigration and Emigration Sri Lanka - Application Guidelines",
        "verification_date": datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc),
        "review_status": "VERIFIED",
        "version": 1
    },
    {
        "rule_code": "RULE-LK-PASS-004",
        "title": "Previous Passport Surrender or Cancellation Proof",
        "category": "PREVIOUS_PASSPORT",
        "description": "Applicants who previously held a Sri Lankan passport (ordinary, diplomatic, or official) must produce the current/previous passport for cancellation. If lost, a certified Police Report and Form K-35A are required.",
        "official_source_url": "http://www.immigration.gov.lk/web/index.php?option=com_content&view=article&id=141&Itemid=201&lang=en",
        "source_name": "Department of Immigration and Emigration Sri Lanka - Alterations and Renewals",
        "verification_date": datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc),
        "review_status": "VERIFIED",
        "version": 1
    },
    {
        "rule_code": "RULE-LK-PASS-005",
        "title": "Regional Office Lodgement Eligibility",
        "category": "JURISDICTION",
        "description": "Passport applications can be lodged at the Colombo Head Office (Battaramulla) or Regional Branch Offices (Kandy, Matara, Vavuniya, Kurunegala). Applicants submitting at regional branches must present district residence proof or provincial verification if requested.",
        "official_source_url": "http://www.immigration.gov.lk/web/index.php?option=com_content&view=article&id=139&Itemid=199&lang=en",
        "source_name": "Department of Immigration and Emigration Sri Lanka - Regional Branches",
        "verification_date": datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc),
        "review_status": "VERIFIED",
        "version": 1
    },
    {
        "rule_code": "RULE-LK-PASS-006",
        "title": "Biometric Studio Photo Acknowledgement Receipt",
        "category": "BIOMETRICS",
        "description": "Applicants must obtain a photograph meeting ICAO specifications taken by an authorized studio in Sri Lanka, and submit the Studio Acknowledgement Receipt barcode issued within 3 months.",
        "official_source_url": "http://www.immigration.gov.lk/web/index.php?option=com_content&view=article&id=142&Itemid=202&lang=en",
        "source_name": "Department of Immigration and Emigration Sri Lanka - Biometric Specifications",
        "verification_date": datetime(2026, 1, 15, 10, 0, tzinfo=timezone.utc),
        "review_status": "VERIFIED",
        "version": 1
    }
]
