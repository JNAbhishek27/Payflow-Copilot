# 🚀 PayFlow Copilot

> **AI-Powered Quote-to-Payment Agent for Freelancers, Independent Creators, Consultants, and Small Businesses.**

PayFlow Copilot automates the end-to-end commercial workflow: converting messy natural-language customer requests into mathematically validated quotes, giving the business owner strict approval control, executing secure payments via **PayPal Sandbox Orders API v2**, maintaining an audit-grade **AG Grid** ledger, and delivering **Gemini-powered business insights** grounded in real database records.

---

## 🌟 Key Highlights & Architecture

- **Zero-Hallucination Financial Logic**: The Gemini AI agent structures line items and customer information, but all monetary subtotals, taxes, discounts, and totals are computed server-side in Python using strict `Decimal` arithmetic.
- **Strict Human-in-the-Loop Governance**: AI proposes quotes and drafts reminder emails, but cannot unilaterally execute financial actions or issue checkout links without owner approval.
- **Verified PayPal Sandbox Payments**: Built on PayPal REST Orders API v2 and JavaScript SDK v6. Payments are never marked as completed until the backend cryptographically verifies a completed capture or webhook event.
- **Audit-Grade Ledger**: Powered by **AG Grid Community v33** with multi-column sorting, real-time filtering, customizable pagination, audit details drawer, and 1-click CSV export.
- **Grounded AI Business Analytics**: Financial queries are grounded by calculating actual aggregates from PostgreSQL/SQLite first and feeding only verified metrics to Gemini.
- **Zero-Secret Frontend Design**: PayPal client secrets and Gemini API keys remain strictly on the backend. Only the public PayPal Client ID is exposed to the browser.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, AG Grid Community v33, Lucide Icons |
| **Backend** | Python 3.10+, FastAPI, Pydantic v2, SQLAlchemy 2.0, HTTPX, Uvicorn |
| **AI Agent** | Official Google Gen AI SDK (`google-genai`), Gemini 2.5 Flash |
| **Payments** | PayPal REST Orders API v2, PayPal JS SDK v6, Webhook Signature Verification |
| **Database** | PostgreSQL (Supabase ready) / SQLite for local development |

---

## 📁 Project Structure

```text
payflow-copilot/
├── .env.example                  # Root environment configuration template
├── .gitignore                    # Git security & secret exclusion rules
├── README.md                     # Comprehensive project documentation
├── backend/
│   ├── .env.example              # Backend environment template
│   ├── requirements.txt          # Python dependencies
│   └── app/
│       ├── main.py               # FastAPI entrypoint, middleware, and routers
│       ├── core/
│       │   ├── config.py         # Pydantic BaseSettings & env resolution
│       │   ├── database.py       # SQLAlchemy engine and session factory
│       │   └── seed.py           # Realistic database seeder
│       ├── models/
│       │   └── entities.py       # Customer, Quote, QuoteItem, Transaction, WebhookEvent
│       ├── routers/
│       │   ├── copilot.py        # AI quote extraction & reminder drafting
│       │   ├── data.py           # Quotes, transactions & dashboard metrics
│       │   ├── insights.py       # Grounded financial Q&A endpoint
│       │   ├── payments.py       # PayPal order creation and verified capture
│       │   └── webhooks.py       # Cryptographic webhook signature verification
│       ├── schemas/
│       │   ├── ai.py             # Pydantic schemas for Gemini structured outputs
│       │   └── payments.py       # DTOs for orders, captures, and ledger
│       └── services/
│           ├── ai_agent.py       # Google Gen AI SDK integration & safe fallback
│           ├── analytics_service.py # Python financial aggregate calculations
│           └── paypal_service.py # PayPal OAuth token & Orders API v2 client
└── frontend/
    ├── .env.example              # Frontend environment template
    ├── package.json              # React, Vite, Tailwind & AG Grid dependencies
    ├── vite.config.ts            # Vite build configuration & API proxy
    ├── index.html                # Entrypoint HTML with typography
    └── src/
        ├── App.tsx               # Primary application state coordinator
        ├── types/                # TypeScript interface definitions
        ├── data/                 # Labelled realistic demo records
        ├── components/
        │   ├── Navbar.tsx        # Top executive bar with search & fast triggers
        │   ├── Sidebar.tsx       # Persistent platform navigation
        │   └── PayPalCheckoutModal.tsx # Sandbox buyer checkout modal
        └── pages/
            ├── DashboardPage.tsx     # Executive financial overview & trend chart
            ├── CopilotPage.tsx       # AI prompt chat & structured quote preview
            ├── QuotesPage.tsx        # Quote pipeline review & approval actions
            ├── TransactionsPage.tsx  # AG Grid payment ledger & CSV export
            ├── InsightsPage.tsx      # Grounded AI analytics & follow-up drafts
            └── SettingsPage.tsx      # Sandbox credentials & system health
```

---

## ⚡ Quick Start Guide

### Prerequisites
- **Node.js** (v18+) and **npm**
- **Python** (v3.10+)
- (Optional) **PayPal Developer Account** for Sandbox testing
- (Optional) **Google Gemini API Key** from [Google AI Studio](https://aistudio.google.com/)

---

### 1. Clone & Set Up Environment Variables

```bash
git clone https://github.com/your-username/payflow-copilot.git
cd payflow-copilot

# Copy backend environment template
cp backend/.env.example backend/.env

# Copy frontend environment template
cp frontend/.env.example frontend/.env
```

Edit `backend/.env` with your credentials:
```env
GEMINI_API_KEY=your_gemini_api_key
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
PAYPAL_WEBHOOK_ID=your_webhook_id
DATABASE_URL=sqlite:///./payflow.db
FRONTEND_URL=http://localhost:5173
```

*(Note: If `GEMINI_API_KEY` or `PAYPAL_CLIENT_SECRET` are left blank, PayFlow Copilot will automatically run in high-fidelity deterministic simulation mode for local testing).*

---

### 2. Backend Installation & Startup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI server
uvicorn app.main:app --port 8000 --reload
```
The backend API and Swagger docs will be live at:
- **API Base**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/api/health`

---

### 3. Frontend Installation & Startup

Open a new terminal:

```bash
cd frontend

# Install npm packages
npm install

# Start Vite dev server
npm run dev
```
The React SaaS application will be running at **`http://localhost:5173`**.

---

## 🧪 Testing the Core Workflows

### A. Test Natural-Language Quote Generation (AI Copilot)
1. Open the **AI Copilot** page from the sidebar.
2. Click the sample prompt:  
   *"Create a quote for Alex. Two social media banners at $35 each and one logo revision at $20."*
3. Watch the AI parse the customer name and line items into the structured preview panel.
4. Adjust quantities or prices live—subtotals and totals recalculate with server-grade Decimal math.
5. Click **"Approve & Push to Quotes Pipeline"**.

### B. Test PayPal Sandbox Checkout Flow
1. Navigate to **Quotes & Approvals**.
2. Select an approved quote (or approve an outstanding draft).
3. Click **"Open PayPal Checkout"**.
4. The backend initializes a PayPal Orders API v2 order (`intent: CAPTURE`).
5. Click **"Checkout as Sandbox Buyer"** to trigger capture verification.
6. The backend verifies the capture result (`status: COMPLETED`), commits the transaction to the database, and marks the quote as paid.

### C. Test AG Grid Payment Ledger
1. Go to **Transactions**.
2. Filter transactions using the instant search bar (search by customer name, quote number, or transaction ID).
3. Sort by amount or date.
4. Click **"Details"** on any row to open the complete audit trail modal.
5. Click **"Export CSV"** to generate an immediate spreadsheet export.

### D. Test Grounded AI Insights
1. Navigate to **AI Insights**.
2. Click any of the pre-configured analytical inquiries:
   - *"What is my total revenue?"*
   - *"What payments are pending?"*
   - *"What is my average order value?"*
   - *"Which customers need follow-up?"*
3. Verify that the response includes:
   - Date range for the audit window.
   - 4 supporting metric cards.
   - Concise explanation referencing database records.
4. Review the automated follow-up reminder drafts and copy them with 1-click.

---

## 🔒 Security Posture & Guardrails

- **Cryptographic Webhook Verification**: All incoming webhooks sent to `/api/webhooks/paypal` verify headers (`PAYPAL-TRANSMISSION-ID`, `PAYPAL-TRANSMISSION-SIG`, etc.) against PayPal's verification service. Unverified payloads are rejected with `HTTP 401`.
- **Idempotency Protection**: Repeated capture or webhook requests return the existing verified transaction record, preventing double captures or balance crediting.
- **Client Secret Isolation**: PayPal Client Secrets and Gemini API keys are never bundled in frontend assets or transmitted to the browser.
- **Zero Frontend Arithmetic Trust**: The backend ignores any client-submitted monetary totals, recalculating all values directly from database records.

---

## 🚢 Deployment (Render & Supabase)

### Backend Deployment (Render Web Service)
1. Set **Build Command**: `pip install -r requirements.txt`
2. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add Environment Variables:
   - `GEMINI_API_KEY`
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
   - `PAYPAL_MODE=sandbox`
   - `DATABASE_URL` (Supabase connection pooler string)
   - `CORS_ORIGINS` (Your production frontend URL)

### Frontend Deployment (Render Static Site)
1. Set **Build Command**: `npm install && npm run build`
2. Set **Publish Directory**: `dist`
3. Add Environment Variables:
   - `VITE_API_URL` (Your Render backend service URL)
   - `VITE_PAYPAL_CLIENT_ID` (Your public sandbox client ID)

---

## 📄 License
This project was designed and built for hackathon and commercial evaluation under the **MIT License**.

