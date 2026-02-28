# Nexus Pharmacy Backend — Implementation Plan & Milestone Checklist

Use this guide as your exact sequence of steps to build the FastAPI backend. Create a new branch or work directly in the `d:\Nexus\backend` folder.

## Milestone 1: Environment & Database
1. Initialize the Python virtual environment and `requirements.txt`. Install `fastapi`, `uvicorn`, `supabase`, `langchain`, `google-genai` (or openai), `langfuse`, `pydantic`.
2. Set up the `.env` file with placeholders for `SUPABASE_URL`, `SUPABASE_KEY`, `GEMINI_API_KEY`, and `LANGFUSE_PUBLIC_KEY`.
3. Write the Supabase setup script (`scripts/seed_db.py`). It should use the Python Supabase SDK to recreate tables based on schema (`02_database_schema_and_mock_data.md`) and insert the mock CSV data.

## Milestone 2: Core REST API
1. Create Pydantic schemas in `models/schemas.py`.
2. Build the basic CRUD routes in `routers/products.py` and `routers/patients.py`.
3. Create `routers/orders.py`. Ensure order placement properly computes totals and decrements the `products` table stock.
4. Integrate the routers into `main.py` and test via the automatically generated Swagger UI (`http://localhost:8000/docs`).

## Milestone 3: Base LangChain Integration
1. Configure `services/llm.py` to instantiate the Chat model.
2. Configure `services/langfuse_client.py` and wrap basic LLM requests with the `@observe` decorator to ensure traces appear in the Langfuse dashboard.
3. Build the `/api/chat` route in `routers/chat.py` with a simple echo or direct LLM pass-through to establish the connection with the frontend.

## Milestone 4: The Agentic Pipeline
This is the most critical feature. Do this step-by-step.
1. Build `agents/tools.py` with Python functions simulating database writes and webhook triggers. Decorate them appropriately so LangChain can use them as tools.
2. Build `agents/conversational.py` to handle the NLU extraction. Test it with complex inputs like "Get me 2 strips of dolo and my diabetes stuff".
3. Build `agents/safety.py`. It MUST query the Supabase database during execution to verify prescriptions and stock.
4. Build `agents/orchestrator.py` using LangGraph or a standard AgentExecutor to route the sequence: Extract -> Verify -> Act.

## Milestone 5: Webhooks & Refill Cron
1. Build the mock fulfillment webhook in `routers/webhooks.py`. Ensure it randomly succeeds/fails to test frontend error handling.
2. Implement the `refill.py` logic. If schedule-based tasks are complex, expose an endpoint `POST /api/admin/trigger-refill-scan` that runs the logic and generates the alerts.

## Handoff Note
When completing these milestones, prioritize the integrity of the AI logic (Milestone 4). The frontend is already built to consume the `/api/chat` endpoint and expects `card_data` JSON objects when confirmations are needed. Always refer to `04_ai_agent_architecture.md` for the payload structure.
