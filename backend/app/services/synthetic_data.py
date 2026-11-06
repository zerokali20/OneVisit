from typing import List, Dict, Any

SCENARIO_A_DOCS = [
    {
        "doc_type": "NIC",
        "file_name": "Synthetic_SL_NIC_K_M_Silva.pdf",
        "extracted_fields": {
            "full_name": "K. M. SILVA",
            "nic_number": "199413502910",
            "date_of_birth": "1994-05-14",
            "gender": "MALE",
            "address": "No. 42, Peradeniya Road, Kandy"
        },
        "raw_text": "DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA\nNATIONAL IDENTITY CARD\nID No: 199413502910\nName: K. M. SILVA\nDate of Birth: 14/05/1994\nSex: M\nAddress: No. 42, Peradeniya Road, Kandy"
    },
    {
        "doc_type": "BIRTH_CERTIFICATE",
        "file_name": "Synthetic_Birth_Certificate_Kamal_Mohan_de_Silva.pdf",
        "extracted_fields": {
            "full_name": "KAMAL MOHAN DE SILVA",
            "nic_number": "199413502910",
            "date_of_birth": "1994-05-14",
            "father_name": "Mohan de Silva",
            "mother_name": "Sunethra Perera",
            "place_of_birth": "General Hospital Kandy"
        },
        "raw_text": "REGISTRAR GENERAL'S DEPARTMENT - SRI LANKA\nCERTIFIED COPY OF BIRTH REGISTRATION ENTRY\nFull Name: KAMAL MOHAN DE SILVA\nDate of Birth: 14/05/1994\nFather's Full Name: Mohan de Silva\nMother's Full Name: Sunethra Perera\nRegistration Division: Kandy Four Gravets"
    },
    {
        "doc_type": "PHOTO_RECEIPT",
        "file_name": "Synthetic_Studio_Biometric_Photo_Receipt.pdf",
        "extracted_fields": {
            "studio_name": "Studio Supreme Kandy",
            "reference_number": "BC-KDY-2026-9812",
            "date_taken": "2026-02-10",
            "icao_compliant": "YES"
        },
        "raw_text": "DEPARTMENT OF IMMIGRATION AND EMIGRATION - SRI LANKA\nAUTHORIZED PHOTOGRAPHER ACKNOWLEDGEMENT\nStudio: Studio Supreme Kandy (Auth ID: 1044)\nBarcode Reference: BC-KDY-2026-9812\nDate of Capture: 2026-02-10\nICAO Standards: Verified Passed"
    }
]

SCENARIO_B_DOCS = [
    {
        "doc_type": "NIC",
        "file_name": "Synthetic_SL_NIC_Priyani_Fernando.pdf",
        "extracted_fields": {
            "full_name": "PRIYANI NIMALKA FERNANDO",
            "nic_number": "198865403211",
            "date_of_birth": "1988-08-22",
            "gender": "FEMALE",
            "address": "15/3 Galle Road, Colombo 03"
        },
        "raw_text": "DEMOCRATIC SOCIALIST REPUBLIC OF SRI LANKA\nNATIONAL IDENTITY CARD\nID No: 198865403211\nName: PRIYANI NIMALKA FERNANDO\nDate of Birth: 22/08/1988\nSex: F"
    },
    {
        "doc_type": "BIRTH_CERTIFICATE",
        "file_name": "Synthetic_Birth_Certificate_Priyani_Fernando.pdf",
        "extracted_fields": {
            "full_name": "PRIYANI NIMALKA FERNANDO",
            "nic_number": "198865403211",
            "date_of_birth": "1988-08-22",
            "place_of_birth": "Castle Street Hospital Colombo"
        },
        "raw_text": "REGISTRAR GENERAL'S DEPARTMENT - SRI LANKA\nCERTIFIED COPY OF BIRTH REGISTRATION ENTRY\nFull Name: PRIYANI NIMALKA FERNANDO\nDate of Birth: 22/08/1988"
    },
    {
        "doc_type": "PHOTO_RECEIPT",
        "file_name": "Synthetic_Biometric_Photo_Receipt_Priyani.pdf",
        "extracted_fields": {
            "studio_name": "Color Lab Colombo",
            "reference_number": "BC-CMB-2026-4431",
            "date_taken": "2026-02-18",
            "icao_compliant": "YES"
        },
        "raw_text": "AUTHORIZED PHOTOGRAPHER ACKNOWLEDGEMENT\nBarcode: BC-CMB-2026-4431\nDate: 2026-02-18"
    }
    # Note: PREVIOUS_PASSPORT document is intentionally omitted to verify missing evidence detection!
]
