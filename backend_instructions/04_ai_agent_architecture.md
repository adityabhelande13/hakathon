# Nexus Pharmacy Backend — AI Agentic Architecture

The defining feature of Nexus Pharmacy is the autonomous Agentic AI ecosystem built with LangChain and Google Gemini (or OpenAI).

## Observability (Mandatory)
Every LLM call, agent decision, and sub-agent invocation MUST be traced using **Langfuse**. Wrap the main orchestrator in a Langfuse trace. Record intermediate outputs and tool returns.

## Agent Design

### 1. Orchestrator Agent (`agents/orchestrator.py`)
- **Role**: The entry point for the `/api/chat` route.
- **Task**: Analyzes the incoming user message to determine intent.
- **Routing**: 
  - If placing a new order: Routes to Conversational Agent.
  - If asking general questions: Responds directly.

### 2. Conversational Agent (`agents/conversational.py`)
- **Role**: Extracts structured data from raw, messy human text.
- **Task**: 
  - Identify medicine names using fuzzy matching against the `medicines.csv` (or product DB).
  - Extract quantities and dosages.
  - If ambiguity exists (e.g. "I want Dolo" but there are multiple variants), prompt the user back via the orchestrator.
- **Output**: A structured order intent. Example `[{"product_id": "MED001", "qty": 2}]`.
- **Next Step**: Passes intent to the Safety Agent.

### 3. Safety & Compliance Agent (`agents/safety.py`)
- **Role**: Validates the order against business rules.
- **Checks**:
  1. *Prescription Check*: If the product has `prescription_required=True` in DB, check the patient record. If `prescription_uploaded=False`, REJECT the order and tell the user to upload it.
  2. *Stock Check*: Is the requested quantity <= `stock_quantity` in DB?
  3. *Contraindication Check* (Optional bonus): Does the active ingredient conflict with the patient's `allergies`?
- **Output**: Approved OR Rejected with natural language explanation.
- **Next Step**: If approved, passes execution to Tool Agent.

### 4. Predictive Refill Agent (`agents/refill.py`)
- **Role**: A background service (can be exposed via an admin API route) that scans `orders` table.
- **Task**: Calculate `predicted_run_out_date` for maintenance medicines (e.g. Diabetes, BP).
  - Logic: `purchase_date` + (`quantity` * standard dosage interval).
- **Action**: Generates alerts in `refill_alerts` table. Prompts the Tool Agent to send mock WhatsApp/Email reminders.

### 5. Tool-Use Agent (`agents/tools.py`)
- **Role**: Modifies external state. Only executed if the Order is approved by the Safety Agent.
- **Available Tools**:
  - `create_database_order(patient_id, items)`: Writes rows to the `orders` table and decrements stock in `products`.
  - `trigger_webhook(order_id)`: Sends a POST request to `/api/webhooks/fulfillment`.
  - `send_notification(patient_id, msg)`: A dummy function that logs to `fulfillment_logs`.
- **Output**: Returns the success status to the Orchestrator, which formulates the final response to the user.

## Return Payload for the Frontend UI
The frontend expects rich UI elements. If an order is successfully interpreted but requires user confirmation, the AI should return:
```json
{
  "reply": "I found your prescription for Metformin 500mg. Would you like to refill it now for ₹45.00?",
  "card_data": {
    "type": "order_confirmation",
    "product_name": "Metformin 500mg",
    "price": 45.00,
    "product_id": "MED003"
  }
}
```
If `card_data` is present, the frontend renders the interactive "Confirm Order" card.
