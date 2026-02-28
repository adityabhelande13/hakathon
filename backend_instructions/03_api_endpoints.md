# Nexus Pharmacy Backend — API Endpoints

Implement the following REST API endpoints in FastAPI using `APIRouter` to structure the application. All endpoints should use Pydantic models for validation (`models/schemas.py`).

## 1. Products Router (`routers/products.py`)
- `GET /api/products`: List all products. Support query parameters for `category`, `search` (fuzzy name search), and pagination.
- `GET /api/products/{product_id}`: Get detailed product info.

## 2. Patients Router (`routers/patients.py`)
- `POST /api/auth/register`: Create a new patient.
- `POST /api/auth/login`: Authenticate and return a JWT.
- `GET /api/patients/me`: Get current patient profile based on JWT.

## 3. Prescriptions Router (`routers/prescriptions.py`)
- `POST /api/prescriptions/upload`: Accept a file upload. Store it in Supabase Storage and record the URL in the `prescriptions` table. Update the patient's `prescription_uploaded` flag to `true`.

## 4. Orders Router (`routers/orders.py`)
- `POST /api/orders`: Place a standard eCommerce order (bypassing the AI chat). Must decrement stock in the `products` table.
- `GET /api/orders`: Get order history for the authenticated patient.

## 5. Webhooks Router (`routers/webhooks.py`)
- `POST /api/webhooks/fulfillment`: A mock endpoint that accepts an order payload. It simulates warehouse fulfillment. It should randomly succeed or fail after a 2-second delay, logging the result to `fulfillment_logs`.

## 6. Admin Inventory Router (`routers/inventory.py`)
- `GET /api/admin/inventory`: List all products with their current stock levels.
- `PUT /api/admin/inventory/{product_id}`: Manually update stock.

## 7. Chat Router (`routers/chat.py`)
- `POST /api/chat`: The core AI endpoint.
  - Request: `{"patient_id": "...", "message": "I need my diabetes meds"}`
  - It forwards this to the Agent Orchestrator.
  - Response: `{"reply": "...", "card_data": {...}}` (Returns structured data alongside text if an interactive UI card, like an order confirmation, should be shown).
