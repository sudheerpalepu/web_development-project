from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    Preformatted,
    SimpleDocTemplate,
    Spacer,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "FINAL_PROJECT_REPORT.md"
OUTPUT = ROOT / "output/pdf/Career_Guide_Dashboard_Final_Project_Report_with_References.pdf"


def inline_markup(text: str) -> str:
    text = html.escape(text.strip())
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    text = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", text)
    return text


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(colors.white)
    canvas.rect(0, 0, letter[0], letter[1], stroke=0, fill=1)
    canvas.setFont("Helvetica", 9)
    canvas.setFillColor(colors.HexColor("#666666"))
    canvas.drawRightString(7.5 * inch, 0.5 * inch, f"Page {doc.page}")
    canvas.restoreState()


def build_story() -> list:
    styles = getSampleStyleSheet()
    styles.add(
        ParagraphStyle(
            name="TitleMain",
            parent=styles["Title"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            spaceAfter=18,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Heading",
            parent=styles["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=14,
            leading=18,
            spaceBefore=12,
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Subheading",
            parent=styles["Heading3"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=15,
            spaceBefore=9,
            spaceAfter=5,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BodyReport",
            parent=styles["BodyText"],
            fontName="Helvetica",
            fontSize=10.2,
            leading=14,
            spaceAfter=7,
        )
    )
    styles.add(
        ParagraphStyle(
            name="Reference",
            parent=styles["BodyReport"],
            fontSize=9.4,
            leading=12.5,
            firstLineIndent=-0.25 * inch,
            leftIndent=0.25 * inch,
            spaceAfter=6,
        )
    )
    styles.add(
        ParagraphStyle(
            name="BulletReport",
            parent=styles["BodyReport"],
            leftIndent=0,
            firstLineIndent=0,
        )
    )

    story: list = []
    bullet_items: list[ListItem] = []
    in_code = False
    code_lines: list[str] = []
    in_references = False

    def flush_bullets() -> None:
        nonlocal bullet_items
        if bullet_items:
            story.append(
                ListFlowable(
                    bullet_items,
                    bulletType="bullet",
                    start="circle",
                    leftIndent=18,
                    bulletFontName="Helvetica",
                    bulletFontSize=8,
                )
            )
            story.append(Spacer(1, 4))
            bullet_items = []

    def flush_code() -> None:
        nonlocal code_lines
        if code_lines:
            story.append(
                Preformatted(
                    "\n".join(code_lines),
                    ParagraphStyle(
                        name="CodeBlock",
                        fontName="Courier",
                        fontSize=8.5,
                        leading=11,
                        backColor=colors.HexColor("#f4f4f4"),
                        borderPadding=6,
                        spaceAfter=8,
                    ),
                )
            )
            code_lines = []

    for raw_line in SOURCE.read_text(encoding="utf-8").splitlines():
        line = raw_line.rstrip()

        if line.startswith("```"):
            if in_code:
                flush_code()
                in_code = False
            else:
                flush_bullets()
                in_code = True
            continue

        if in_code:
            code_lines.append(line)
            continue

        if not line.strip():
            flush_bullets()
            continue

        if line.startswith("# "):
            flush_bullets()
            story.append(Paragraph(inline_markup(line[2:]), styles["TitleMain"]))
            continue

        if line.startswith("## "):
            flush_bullets()
            heading = line[3:]
            if heading.startswith("18. References"):
                story.append(PageBreak())
                in_references = True
            story.append(Paragraph(inline_markup(heading), styles["Heading"]))
            continue

        if line.startswith("### "):
            flush_bullets()
            story.append(Paragraph(inline_markup(line[4:]), styles["Subheading"]))
            continue

        if line.startswith("- "):
            bullet_items.append(
                ListItem(Paragraph(inline_markup(line[2:]), styles["BulletReport"]))
            )
            continue

        flush_bullets()
        style = styles["Reference"] if in_references else styles["BodyReport"]
        story.append(Paragraph(inline_markup(line), style))

    flush_bullets()
    flush_code()
    return story


def main() -> None:
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=letter,
        leftMargin=0.8 * inch,
        rightMargin=0.8 * inch,
        topMargin=0.72 * inch,
        bottomMargin=0.72 * inch,
        title="Career Guide Dashboard Final Project Report",
        author="Sudheer Palepu",
    )
    doc.build(build_story(), onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(OUTPUT)


if __name__ == "__main__":
    main()
