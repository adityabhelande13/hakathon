# Nexus Pharmacy Backend — Overview & Tech Stack

## Project Goal
You are tasked with building the backend for **Nexus Pharmacy**, an Agentic AI-powered eCommerce pharmacy platform. The frontend (Next.js 14) has already been built and relies on the backend features you will develop in the `d:\Nexus\backend\` directory.

## Core Tech Stack
- **Framework**: FastAPI (Python 3.11+)
- **Database**: Supabase (PostgreSQL, Auth, Storage)
- **AI/LLM**: Google Gemini API (or OpenAI) orchestrated via LangChain
- **Observability**: Langfuse (for tracing LLM calls and agent decisions)

## Directory Structure to Create
```text
backend/
├── main.py                # FastAPI app entry point
├── routers/
│   ├── products.py        # GET /products, GET /products/{id}, search
│   ├── orders.py          # POST /orders, GET /orders/{patient_id}
│   ├── patients.py        # Auth, profile, registration
│   ├── prescriptions.py   # Upload, validate
│   ├── inventory.py       # Admin stock management
│   ├── chat.py            # AI conversational endpoint
│   └── webhooks.py        # Mock fulfillment, email, WhatsApp
├── agents/
│   ├── orchestrator.py    # Main agent router
│   ├── conversational.py  # NLU for ordering
│   ├── safety.py          # Prescription + stock enforcement
│   ├── refill.py          # Predictive refill calculator
│   └── tools.py           # DB writes, webhooks, notifications
├── services/
│   ├── supabase_client.py # Client wrapper
│   ├── langfuse_client.py # Tracing
│   └── llm.py             # Provider abstraction
├── data/
│   ├── medicines.csv      # Seed data
│   └── order_history.csv  # Seed data
├── models/
│   └── schemas.py         # Pydantic models
├── requirements.txt
└── .env                   
```

## First Steps
1. Initialize the Python virtual environment and `requirements.txt`.
2. Setup FastAPI in `main.py` with CORS enabled for the Next.js frontend (localhost:3000).
3. Follow the subsequent instruction files for DB schema, API design, and the AI agent system.
