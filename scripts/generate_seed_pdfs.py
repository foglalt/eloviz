from __future__ import annotations

import json
import shutil
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "output" / "pdf"
PUBLIC = ROOT / "public" / "studies"
OUTPUT.mkdir(parents=True, exist_ok=True)
PUBLIC.mkdir(parents=True, exist_ok=True)

font_candidates = [
    ("Cormorant", Path("C:/Windows/Fonts/georgia.ttf")),
    ("Cormorant-Bold", Path("C:/Windows/Fonts/georgiab.ttf")),
]
for name, path in font_candidates:
    if not path.exists():
        raise SystemExit(f"Missing required font: {path}")
    pdfmetrics.registerFont(TTFont(name, str(path)))

seed = json.loads((ROOT / "data" / "seed-content.json").read_text(encoding="utf-8"))


def footer(canvas, doc):
    canvas.saveState()
    width, _ = A4
    canvas.setStrokeColor(colors.HexColor("#B8C7C2"))
    canvas.line(22 * mm, 17 * mm, width - 22 * mm, 17 * mm)
    canvas.setFont("Cormorant", 8)
    canvas.setFillColor(colors.HexColor("#365B59"))
    canvas.drawString(22 * mm, 11 * mm, "ÉLŐ VÍZ · BIBLIATANULMÁNY")
    canvas.drawRightString(width - 22 * mm, 11 * mm, str(doc.page))
    canvas.restoreState()


styles = getSampleStyleSheet()
title_style = ParagraphStyle(
    "TitleHu", parent=styles["Title"], fontName="Cormorant-Bold", fontSize=27,
    leading=32, textColor=colors.HexColor("#123D3D"), alignment=TA_CENTER,
    spaceAfter=10 * mm,
)
lead_style = ParagraphStyle(
    "LeadHu", parent=styles["BodyText"], fontName="Cormorant", fontSize=13,
    leading=19, textColor=colors.HexColor("#365B59"), spaceAfter=9 * mm,
)
heading_style = ParagraphStyle(
    "HeadingHu", parent=styles["Heading2"], fontName="Cormorant-Bold", fontSize=17,
    leading=22, textColor=colors.HexColor("#0D5554"), spaceBefore=7 * mm, spaceAfter=3 * mm,
)
body_style = ParagraphStyle(
    "BodyHu", parent=styles["BodyText"], fontName="Cormorant", fontSize=11.5,
    leading=17, textColor=colors.HexColor("#183C3A"), spaceAfter=4 * mm,
)
reference_style = ParagraphStyle(
    "ReferenceHu", parent=body_style, fontName="Cormorant-Bold", fontSize=10.5,
    leading=15, textColor=colors.HexColor("#0D7772"), leftIndent=4 * mm,
)

for study in seed["studies"]:
    output_path = OUTPUT / f"{study['slug']}.pdf"
    document = SimpleDocTemplate(
        str(output_path), pagesize=A4, leftMargin=25 * mm, rightMargin=25 * mm,
        topMargin=24 * mm, bottomMargin=24 * mm,
        title=study["title"], author="Élő Víz",
    )
    story = [
        Spacer(1, 9 * mm),
        Paragraph(study["title"], title_style),
        Paragraph(study["summary"], lead_style),
        Paragraph("Kapcsolódó igeszakaszok", heading_style),
    ]
    for reference in study["references"]:
        story.append(Paragraph(reference["label"], reference_style))
    story.append(Spacer(1, 5 * mm))
    for section in study["sections"]:
        story.append(Paragraph(section["title"], heading_style))
        for paragraph in section["paragraphs"]:
            story.append(Paragraph(paragraph, body_style))
    story.extend([
        Spacer(1, 8 * mm),
        Paragraph("„Aki szomjúhozik, jöjjön el; és aki akarja, vegye az élet vizét ingyen.” – Jelenések 22:17", reference_style),
    ])
    document.build(story, onFirstPage=footer, onLaterPages=footer)
    shutil.copy2(output_path, PUBLIC / output_path.name)
    print(output_path)
