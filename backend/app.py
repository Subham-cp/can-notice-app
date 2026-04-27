"""
CAN Notice Generator - Backend API
Flask server for PDF generation, preview, and AI enhancement
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import io
import os
import base64
import textwrap
import traceback
from datetime import datetime

from reportlab.pdfgen import canvas
from reportlab.lib.colors import white
from pypdf import PdfReader, PdfWriter
from pdf2image import convert_from_bytes

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# ─── Constants: Template coordinates (pdfplumber "top" system → ReportLab y) ───
PAGE_W = 595.5
PAGE_H = 842.25

def top_to_pdf(y_top):
    """Convert pdfplumber top-origin y to ReportLab bottom-origin y."""
    return PAGE_H - y_top

# Positions discovered by analyzing the template:
REF_NUM_X     = 280          # x where ref number digits start
REF_Y_TOP     = 190          # plumber y for Ref No. row
DATE_X        = 466          # x where date value starts
DATE_Y_TOP    = 190          # same row as Ref No.

BODY_X        = 155          # left edge of body text area
BODY_Y_TOP    = 255          # top of body area (just below NOTICE heading)
BODY_WIDTH    = 393          # usable width (up to right margin)
BODY_CHARS_PER_LINE = 60     # approx chars that fit per line at 10pt
LINE_HEIGHT   = 15           # leading (line spacing)

NOTICE_TITLE_X = 200          # centre the notice title
NOTICE_TITLE_Y_TOP = 244      # just below NOTICE heading line

# White rectangle to blank out the original "17th April 2026" date text
DATE_BLANK_X0 = 440
DATE_BLANK_Y0_TOP = 178
DATE_BLANK_X1 = 560
DATE_BLANK_Y1_TOP = 200

# White rectangle to blank out original ref number (CAN/26-27/)
REF_BLANK_X0 = 185
REF_BLANK_Y0_TOP = 178
REF_BLANK_X1 = 310
REF_BLANK_Y1_TOP = 200

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "template.pdf")


# ─────────────────────────────────────────────────────────────────────────────
def generate_notice_pdf(ref_number: str, date: str, subject: str, body: str) -> bytes:
    """
    Overlay user content onto the CAN notice template.
    Returns the final PDF as bytes.
    """
    packet = io.BytesIO()
    c = canvas.Canvas(packet, pagesize=(PAGE_W, PAGE_H))

    # ── 1. White-out dynamic fields in the original template ─────────────────
    c.setFillColor(white)

    # Blank the original date text
    c.rect(
        DATE_BLANK_X0,
        top_to_pdf(DATE_BLANK_Y1_TOP),
        DATE_BLANK_X1 - DATE_BLANK_X0,
        DATE_BLANK_Y1_TOP - DATE_BLANK_Y0_TOP,
        fill=1, stroke=0
    )

    # Blank the original ref number suffix
    c.rect(
        REF_BLANK_X0,
        top_to_pdf(REF_BLANK_Y1_TOP),
        REF_BLANK_X1 - REF_BLANK_X0,
        REF_BLANK_Y1_TOP - REF_BLANK_Y0_TOP,
        fill=1, stroke=0
    )

    # ── 2. Write Ref Number ───────────────────────────────────────────────────
    c.setFillColorRGB(0, 0, 0)
    c.setFont("Helvetica-Bold", 9)
    ref_pdf_y = top_to_pdf(REF_Y_TOP)
    c.drawString(REF_NUM_X, ref_pdf_y, ref_number.strip())

    # ── 3. Write Date ─────────────────────────────────────────────────────────
    c.setFont("Helvetica", 9)
    date_pdf_y = top_to_pdf(DATE_Y_TOP)
    c.drawString(DATE_X, date_pdf_y, date.strip())

    # ── 4. Write Subject / Title (if provided) ────────────────────────────────
    if subject.strip():
        c.setFont("Helvetica-Bold", 10)
        subj_y = top_to_pdf(NOTICE_TITLE_Y_TOP)
        subj_text = f"Sub: {subject.strip()}"
        # Word wrap subject
        subj_lines = textwrap.wrap(subj_text, width=BODY_CHARS_PER_LINE)
        for i, line in enumerate(subj_lines[:2]):  # max 2 lines for subject
            c.drawString(BODY_X, subj_y - (i * LINE_HEIGHT), line)
        # Advance body start past subject
        subject_line_count = min(len(subj_lines), 2)
        body_start_y_top = NOTICE_TITLE_Y_TOP + (subject_line_count * LINE_HEIGHT) + 8
    else:
        body_start_y_top = BODY_Y_TOP

    # ── 5. Write Body Content ─────────────────────────────────────────────────
    c.setFont("Helvetica", 10)
    text_obj = c.beginText(BODY_X, top_to_pdf(body_start_y_top))
    text_obj.setFont("Helvetica", 10)
    text_obj.setLeading(LINE_HEIGHT)

    # Split into paragraphs, wrap each paragraph
    paragraphs = body.split('\n')
    for para in paragraphs:
        para = para.strip()
        if para:
            wrapped_lines = textwrap.wrap(para, width=BODY_CHARS_PER_LINE)
            for line in wrapped_lines:
                text_obj.textLine(line)
            text_obj.textLine("")  # blank line between paragraphs
        else:
            text_obj.textLine("")

    c.drawText(text_obj)
    c.save()
    packet.seek(0)

    # ── 6. Merge overlay with template ────────────────────────────────────────
    template_pdf = PdfReader(TEMPLATE_PATH)
    overlay_pdf  = PdfReader(packet)

    writer = PdfWriter()
    page = template_pdf.pages[0]
    page.merge_page(overlay_pdf.pages[0])
    writer.add_page(page)

    output = io.BytesIO()
    writer.write(output)
    output.seek(0)
    return output.read()


def pdf_to_base64_image(pdf_bytes: bytes) -> str:
    """Convert first page of PDF to base64 PNG for preview."""
    images = convert_from_bytes(pdf_bytes, dpi=120, first_page=1, last_page=1)
    img_io = io.BytesIO()
    images[0].save(img_io, format="PNG")
    img_io.seek(0)
    return base64.b64encode(img_io.read()).decode("utf-8")


# ─── Routes ──────────────────────────────────────────────────────────────────

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "message": "CAN Notice API running"})


@app.route("/api/preview", methods=["POST"])
def preview():
    """Generate a PNG preview of the notice."""
    try:
        data = request.get_json()
        ref_number = data.get("ref_number", "")
        date       = data.get("date", "")
        subject    = data.get("subject", "")
        body       = data.get("body", "")

        if not body.strip():
            return jsonify({"error": "Body content is required"}), 400

        pdf_bytes = generate_notice_pdf(ref_number, date, subject, body)
        img_b64   = pdf_to_base64_image(pdf_bytes)

        return jsonify({"preview_image": img_b64})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/download", methods=["POST"])
def download():
    """Generate and return the final PDF for download."""
    try:
        data = request.get_json()
        ref_number = data.get("ref_number", "")
        date       = data.get("date", "")
        subject    = data.get("subject", "")
        body       = data.get("body", "")

        if not body.strip():
            return jsonify({"error": "Body content is required"}), 400

        pdf_bytes = generate_notice_pdf(ref_number, date, subject, body)

        return send_file(
            io.BytesIO(pdf_bytes),
            mimetype="application/pdf",
            as_attachment=True,
            download_name=f"CAN_Notice_{ref_number or 'draft'}.pdf"
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


@app.route("/api/improve", methods=["POST"])
def improve_text():
    """Use Claude API to improve the notice body text."""
    try:
        data = request.get_json()
        body    = data.get("body", "")
        subject = data.get("subject", "")

        if not body.strip():
            return jsonify({"error": "No content to improve"}), 400

        import anthropic
        client = anthropic.Anthropic()

        prompt = f"""You are an expert at writing formal official notices for government institutions and universities.

Improve the following notice text to make it:
1. Formally worded and professionally structured
2. Free of grammatical errors
3. Clear and concise while preserving ALL original meaning and facts
4. Suitable for an official notice from a Computer Science department's student association

Do NOT change any names, dates, event titles, or factual details.
Do NOT add any information not already present.
Return ONLY the improved text with no explanations, preamble, or markdown.

{"Subject: " + subject if subject else ""}

Notice Body:
{body}"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1024,
            messages=[{"role": "user", "content": prompt}]
        )

        improved = message.content[0].text.strip()
        return jsonify({"improved_body": improved})

    except ImportError:
        return jsonify({"error": "Anthropic SDK not installed. Run: pip install anthropic"}), 500
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("🚀 CAN Notice API starting on http://localhost:5000")
    app.run(debug=True, port=5000)
