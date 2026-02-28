# Nexus Pharmacy Backend — Database Schema & Data

## Supabase Setup
You need to configure the Supabase client in `services/supabase_client.py`. Use the Supabase Python SDK.

## Schema Definition
Create the following tables in PostgreSQL (Supabase). Ensure you set up appropriate Row Level Security (RLS) policies if needed, though for the MVP, focus on the CRUD operations from the FastAPI backend using the service role key.

| Table | Columns |
|---|---|
| `patients` | id (uuid, PK), patient_id (text, unique), name, age, gender, email, phone, password_hash, allergies (text[]), medical_history, preferred_language, prescription_uploaded (bool), created_at |
| `products` | id (uuid, PK), product_id (text, unique), product_name, price (numeric), description, package_size, stock_quantity (int), prescription_required (bool), active_ingredient, category, manufacturer, image_url, created_at |
| `orders` | id (uuid, PK), patient_id (FK), product_id (FK), product_name, quantity (int), total_price (numeric), purchase_date (timestamp), dosage_frequency (text), status (text), created_at |
| `prescriptions` | id (uuid, PK), patient_id (FK), file_url (text), uploaded_at (timestamp), verified (bool) |
| `refill_alerts` | id (uuid, PK), patient_id (FK), product_id (FK), predicted_run_out_date (date), alert_sent (bool), created_at |
| `fulfillment_logs` | id (uuid, PK), order_id (FK), webhook_url, payload (jsonb), status (text), sent_at |

## Mock Data Sourcing
You must create seed scripts to populate the database from CSVs located in the `data/` directory.

### `data/medicines.csv` (At least 30 diverse items)
Must include fields matching the `products` table. Example:
`MED001, Dolo 650, 30, 500, false, Paracetamol, Pain Relief, Micro Labs`
`MED003, Metformin 500mg, 45, 300, true, Metformin, Diabetes, USV`

### `data/order_history.csv` (At least 50 records)
Must include fields matching the `orders` table. Example:
`PAT001, MED003, Metformin 500mg, 30, 2026-01-15, twice_daily`

## Objective
Write a Python script (`scripts/seed_db.py`) that uses the Supabase client to drop existing tables, recreate them, and insert the data from the CSV files.
