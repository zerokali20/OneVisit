import os
import json
from pathlib import Path
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

from app.core.config import settings

def generate_pdf_report(case_data: dict, report_data: dict, filepath: Path) -> Path:
    """Generate a clean, printable PDF readiness report."""
    doc = SimpleDocTemplate(
        str(filepath),
        pagesize=letter,
        rightMargin=40,
        leftMargin=40,
        topMargin=40,
        bottomMargin=40
    )
    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#123B70')
    )
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=14,
        textColor=colors.HexColor('#475569')
    )
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=16,
        textColor=colors.HexColor('#123B70'),
        spaceBefore=12,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#1E293B')
    )
    disclaimer_style = ParagraphStyle(
        'Disclaimer',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#64748B')
    )
    
    elements = []
    
    # Header
    elements.append(Paragraph("OneVisit — Application Preparation Report", title_style))
    elements.append(Paragraph("Civic Assistance for Sri Lankan Passport Applications | InnovaX 1.0", subtitle_style))
    elements.append(Spacer(1, 10))
    elements.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor('#123B70'), spaceAfter=15))
    
    # Status Banner
    status = report_data.get("overall_status", "UNVERIFIED")
    status_bg = colors.HexColor('#DCFCE7') if status == "READY" else colors.HexColor('#FEF3C7')
    status_text_color = colors.HexColor('#166534') if status == "READY" else colors.HexColor('#92400E')
    
    status_table = Table(
        [
            [
                Paragraph(f"<b>CASE REFERENCE:</b> {case_data.get('case_number')}", body_style),
                Paragraph(f"<b>ROUTE:</b> {case_data.get('route', 'N/A')}", body_style)
            ],
            [
                Paragraph(f"<b>REGIONAL OFFICE:</b> {case_data.get('regional_office', 'N/A')}", body_style),
                Paragraph(f"<b>READINESS STATUS:</b> <font color='{status_text_color.hexval()}'><b>{status}</b></font>", body_style)
            ]
        ],
        colWidths=[260, 260]
    )
    status_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), colors.HexColor('#F8FAFC')),
        ('BOX', (0, 0), (-1, -1), 1, colors.HexColor('#CBD5E1')),
        ('INNERGRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E2E8F0')),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(status_table)
    elements.append(Spacer(1, 15))
    
    # Executive Summary
    elements.append(Paragraph("Assessment Summary", section_title))
    elements.append(Paragraph(report_data.get("summary", "No summary provided."), body_style))
    elements.append(Spacer(1, 10))
    
    # Satisfied Rules
    satisfied = report_data.get("satisfied_rules", [])
    if isinstance(satisfied, str):
        try:
            satisfied = json.loads(satisfied)
        except Exception:
            satisfied = []
            
    elements.append(Paragraph("Satisfied Requirements", section_title))
    if satisfied:
        sat_data = [["Rule Code", "Verification Details"]]
        for r in satisfied:
            sat_data.append([r.get("rule_code", ""), r.get("details", "")])
        sat_table = Table(sat_data, colWidths=[120, 400])
        sat_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#E2E8F0')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#CBD5E1')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(sat_table)
    else:
        elements.append(Paragraph("No requirements confirmed yet.", body_style))
    elements.append(Spacer(1, 10))

    # Missing Items or Discrepancies
    missing = report_data.get("missing_items", [])
    if isinstance(missing, str):
        try:
            missing = json.loads(missing)
        except Exception:
            missing = []
            
    if missing:
        elements.append(Paragraph("Pending Items & Required Actions", section_title))
        mis_data = [["Missing Item", "Rule Code", "Action Required"]]
        for m in missing:
            mis_data.append([m.get("item", ""), m.get("rule_code", ""), m.get("action", "")])
        mis_table = Table(mis_data, colWidths=[130, 110, 280])
        mis_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEE2E2')),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#FCA5A5')),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ]))
        elements.append(mis_table)
        elements.append(Spacer(1, 10))

    # Recommendations
    recs = report_data.get("recommendations", [])
    if isinstance(recs, str):
        try:
            recs = json.loads(recs)
        except Exception:
            recs = []
            
    if recs:
        elements.append(Paragraph("Preparation Recommendations", section_title))
        for idx, rec in enumerate(recs, 1):
            elements.append(Paragraph(f"• {rec}", body_style))
        elements.append(Spacer(1, 10))
        
    # Official Disclaimer
    elements.append(Spacer(1, 15))
    elements.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor('#E2E8F0'), spaceAfter=10))
    disclaimer_text = (
        "<b>LEGAL DISCLAIMER:</b> OneVisit is an independent civic-tech preparation assistant. "
        "It does NOT represent the Department of Immigration and Emigration Sri Lanka (DIE). "
        "A status of READY indicates your application matches the verified checklist rules recorded in OneVisit. "
        "Final acceptance, eligibility, and issuance remain strictly at the statutory discretion of DIE officials."
    )
    elements.append(Paragraph(disclaimer_text, disclaimer_style))
    
    doc.build(elements)
    return filepath
