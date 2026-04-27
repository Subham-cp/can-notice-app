# 📋 CAN Notice Generator

**Official Notice Generator for the Computer Association of NERIST (CAN)**  
Department of Computer Science and Engineering · NERIST, Arunachal Pradesh

> Fill in notice details → AI-enhance → Preview → Download PDF  
> The original Canva template design is **preserved 100%**.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🔒 **Template Locked** | Original Canva PDF design preserved exactly — only content is filled in |
| 📝 **Smart Form** | Ref number, date, subject, and multi-paragraph body |
| ✨ **AI Text Improvement** | Uses Claude AI to refine grammar and formal tone |
| 👁 **Live Preview** | See the notice exactly as it will print before downloading |
| ↩ **Revert** | Compare AI-improved vs original — revert with one click |
| ⬇ **PDF Download** | Download the final notice with official template intact |

---

## 🖥 Tech Stack

```
Frontend  →  React 18 + Vite  (runs on port 3000)
Backend   →  Flask (Python)   (runs on port 5000)
PDF       →  reportlab + pypdf + pdf2image
AI        →  Claude API (claude-sonnet-4)
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.10+
- Node.js 18+
- `poppler-utils` for PDF-to-image conversion

```bash
# Ubuntu/Debian
sudo apt install poppler-utils

# macOS
brew install poppler
```

---

### Step 1 — Clone & Setup

```bash
git clone https://github.com/your-org/can-notice-app.git
cd can-notice-app
```

---

### Step 2 — Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key (for AI Improve feature)
export ANTHROPIC_API_KEY=sk-ant-...   # Windows: set ANTHROPIC_API_KEY=...

# Start backend
python app.py
# → Running on http://localhost:5000
```

> ⚠️ **Important**: Place `template.pdf` (the official CAN notice template) inside the `backend/` folder. It's already included if you cloned the repo.

---

### Step 3 — Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → Running on http://localhost:3000
```

---

### Step 4 — Use the App

1. Open **http://localhost:3000** in your browser
2. Fill in:
   - **Notice Number** (e.g. `001` → becomes `CAN/26-27/001`)
   - **Date** (e.g. `25th April 2026`)
   - **Subject** (optional)
   - **Notice Body** (main text, use blank lines for paragraphs)
3. (Optional) Click **✨ AI Improve** to refine the language
4. Click **👁 Preview** to see the generated notice
5. Click **⬇ Download PDF** to save the final PDF

---

## 📁 Project Structure

```
can-notice-app/
├── backend/
│   ├── app.py              # Flask API server
│   ├── requirements.txt    # Python dependencies
│   └── template.pdf        # The locked CAN notice template
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Root component + state management
│   │   ├── App.css                    # All styles (dark academic theme)
│   │   ├── main.jsx                   # Entry point
│   │   └── components/
│   │       ├── Header.jsx             # Top navigation bar
│   │       ├── NoticeForm.jsx         # Input form + action buttons
│   │       └── PreviewPanel.jsx       # PDF preview area
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🌐 API Reference

All endpoints accept/return JSON.

### `POST /api/preview`
Generate a PNG preview of the notice.

**Request:**
```json
{
  "ref_number": "001",
  "date": "25th April 2026",
  "subject": "Annual Symposium",
  "body": "This is to inform all students..."
}
```

**Response:**
```json
{
  "preview_image": "<base64-encoded PNG>"
}
```

---

### `POST /api/download`
Download the final PDF.

**Request:** Same as `/api/preview`  
**Response:** Binary PDF file (`Content-Type: application/pdf`)

---

### `POST /api/improve`
AI-enhance the notice body text.

**Request:**
```json
{
  "body": "we are doing event on 5th may...",
  "subject": "Optional subject"
}
```

**Response:**
```json
{
  "improved_body": "This is to inform that an event is scheduled on 5th May..."
}
```

---

## ☁️ Deployment

### Option A — Render (Recommended Free Tier)

**Backend (Web Service):**
```
Build Command:  pip install -r requirements.txt
Start Command:  gunicorn app:app --bind 0.0.0.0:$PORT
Environment:    ANTHROPIC_API_KEY=sk-ant-...
```

**Frontend (Static Site):**
```
Build Command:     npm install && npm run build
Publish Directory: dist
Env Variable:      VITE_API_URL=https://your-backend.onrender.com
```

---

### Option B — Railway

```bash
# From backend/ folder
railway up

# From frontend/ folder (after setting VITE_API_URL)
npm run build
railway up
```

---

### Option C — Self-Hosted (VPS/Ubuntu)

```bash
# Install Nginx + Gunicorn
pip install gunicorn
gunicorn app:app --bind 127.0.0.1:5000 --daemon

# Build frontend
cd frontend && npm run build
# Serve dist/ with Nginx
```

---

## 🔧 Configuration

| Variable | Location | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Backend env | Required for AI Improve |
| `VITE_API_URL` | Frontend env | Backend URL for production |

---

## 📐 Template Coordinate Reference

The PDF template is A4 (595.5 × 842.25 pt). Key zones:

| Zone | Plumber Y | Purpose |
|---|---|---|
| Header | 0–170 | Institution name, logos |
| Ref/Date row | 184–200 | Dynamic: ref number + date |
| NOTICE heading | 207–235 | Fixed large title |
| Body area | 250–700 | Dynamic: subject + body text |
| Signatures | 720–760 | Fixed: signatories |

The body area uses the center of the page (x: 155–548), leaving the left sidebar (roles column) and right margin untouched.

---

## 🤝 Contributing

Issues and PRs welcome. When modifying PDF coordinates, always verify with:
```bash
python3 -c "
import pdfplumber
with pdfplumber.open('backend/template.pdf') as pdf:
    for w in pdf.pages[0].extract_words():
        print(w)
"
```

---

## 📄 License

Internal use — Computer Association of NERIST (CAN), NERIST CSE Department.
