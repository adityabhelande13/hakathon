"""
Data store — Supabase-backed with in-memory fallback.
Reads/writes to the Supabase database first. Falls back to local JSON
files if Supabase is unreachable (e.g. dev offline mode).
"""
import json
import os
import traceback
from datetime import date
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

# ── In-memory fallback (loaded from JSON files) ─────────

_medicines: list[dict] = []
_patients: list[dict] = []
_orders: list[dict] = []
_prescriptions: list[dict] = []
_fulfillment_logs: list[dict] = []
_refill_alerts: list[dict] = []
_order_counter = 100
_use_supabase = False


def _load_json():
    global _medicines, _patients, _orders, _order_counter
    try:
        with open(DATA_DIR / "medicines.json", "r") as f:
            _medicines = json.load(f)
        with open(DATA_DIR / "patients.json", "r") as f:
            _patients = json.load(f)
        with open(DATA_DIR / "orders.json", "r") as f:
            _orders = json.load(f)
        _order_counter = len(_orders) + 100
    except Exception:
        pass


def _init_supabase():
    global _use_supabase
    try:
        from supabase_client import get_supabase
        sb = get_supabase()
        # Quick health check
        sb.table("products").select("product_id").limit(1).execute()
        _use_supabase = True
        print("✅ Supabase connected — using cloud database")
    except Exception as e:
        _use_supabase = False
        print(f"⚠️  Supabase unavailable, using local JSON fallback: {e}")
        _load_json()


_init_supabase()
if not _use_supabase:
    _load_json()


def _sb():
    """Get the Supabase client."""
    from supabase_client import get_supabase
    return get_supabase()


# ── Products ─────────────────────────────────────────────

def get_all_products() -> list[dict]:
    if _use_supabase:
        try:
            res = _sb().table("products").select("*").order("product_id").execute()
            return res.data
        except Exception:
            traceback.print_exc()
    return _medicines


def get_product_by_id(product_id: str) -> dict | None:
    if _use_supabase:
        try:
            # Try numeric match first, then text
            try:
                pid = int(product_id)
                res = _sb().table("products").select("*").eq("product_id", pid).limit(1).execute()
            except ValueError:
                res = _sb().table("products").select("*").eq("product_id", product_id).limit(1).execute()
            if res.data:
                return res.data[0]
            return None
        except Exception:
            traceback.print_exc()
    for m in _medicines:
        if str(m["product_id"]) == str(product_id):
            return m
    return None


def search_products(query: str, category: str | None = None) -> list[dict]:
    if _use_supabase:
        try:
            q = _sb().table("products").select("*")
            if category:
                q = q.ilike("category", category)
            if query:
                q = q.or_(
                    f"product_name.ilike.%{query}%,"
                    f"active_ingredient.ilike.%{query}%,"
                    f"category.ilike.%{query}%"
                )
            res = q.execute()
            return res.data
        except Exception:
            traceback.print_exc()
    results = _medicines
    if category:
        results = [m for m in results if m["category"].lower() == category.lower()]
    if query:
        ql = query.lower()
        results = [
            m for m in results
            if ql in m["product_name"].lower()
            or ql in m["active_ingredient"].lower()
            or ql in m["category"].lower()
        ]
    return results


def update_stock(product_id: str, new_qty: int) -> dict | None:
    if _use_supabase:
        try:
            try:
                pid = int(product_id)
            except ValueError:
                pid = product_id
            res = _sb().table("products").update({"stock_quantity": new_qty}).eq("product_id", pid).execute()
            if res.data:
                return res.data[0]
        except Exception:
            traceback.print_exc()
    for m in _medicines:
        if str(m["product_id"]) == str(product_id):
            m["stock_quantity"] = new_qty
            return m
    return None


# ── Patients ─────────────────────────────────────────────

def get_patient_by_email(email: str) -> dict | None:
    if _use_supabase:
        try:
            res = _sb().table("patients").select("*").eq("email", email).limit(1).execute()
            if res.data:
                return res.data[0]
            return None
        except Exception:
            traceback.print_exc()
    for p in _patients:
        if p["email"] == email:
            return p
    return None


def get_patient_by_id(patient_id: str) -> dict | None:
    if _use_supabase:
        try:
            res = _sb().table("patients").select("*").eq("patient_id", patient_id).limit(1).execute()
            if res.data:
                return res.data[0]
            return None
        except Exception:
            traceback.print_exc()
    for p in _patients:
        if p["patient_id"] == patient_id:
            return p
    return None


def update_patient_profile(patient_id: str, data: dict) -> dict | None:
    # Filter out None values
    update_data = {k: v for k, v in data.items() if v is not None}
    if not update_data:
        return get_patient_by_id(patient_id)
        
    if _use_supabase:
        try:
            res = _sb().table("patients").update(update_data).eq("patient_id", patient_id).execute()
            if res.data:
                return res.data[0]
        except Exception:
            traceback.print_exc()
            
    # Fallback
    for p in _patients:
        if p["patient_id"] == patient_id:
            p.update(update_data)
            return p
    return None



def create_patient(data: dict) -> dict:
    if _use_supabase:
        try:
            # Get next patient_id
            res = _sb().table("patients").select("patient_id").order("id", desc=True).limit(1).execute()
            if res.data:
                last_num = int(res.data[0]["patient_id"].replace("PAT", ""))
                new_id = f"PAT{last_num + 1:03d}"
            else:
                new_id = "PAT001"

            patient = {
                "patient_id": new_id,
                "name": data["name"],
                "age": data.get("age", 30),
                "gender": data.get("gender", "O"),
                "email": data["email"],
                "phone": data.get("phone", ""),
                "password_hash": data.get("password_hash", ""),
                "allergies": [],
                "medical_history": [],
                "prescription_uploaded": False,
            }
            res = _sb().table("patients").insert(patient).execute()
            if res.data:
                return res.data[0]
        except Exception:
            traceback.print_exc()

    # Fallback
    patient_id = f"PAT{len(_patients) + 1:03d}"
    patient = {
        "patient_id": patient_id,
        "name": data["name"],
        "age": data.get("age"),
        "gender": data.get("gender"),
        "email": data["email"],
        "phone": data["phone"],
        "password_hash": data.get("password_hash", ""),
        "allergies": [],
        "medical_history": "",
        "preferred_language": "en",
        "prescription_uploaded": False,
    }
    _patients.append(patient)
    return patient


def set_prescription_uploaded(patient_id: str):
    if _use_supabase:
        try:
            _sb().table("patients").update({"prescription_uploaded": True}).eq("patient_id", patient_id).execute()
            return
        except Exception:
            traceback.print_exc()
    for p in _patients:
        if p["patient_id"] == patient_id:
            p["prescription_uploaded"] = True
            break


# ── Orders ───────────────────────────────────────────────

def get_orders_by_patient(patient_id: str) -> list[dict]:
    if _use_supabase:
        try:
            res = _sb().table("orders").select("*").eq("patient_id", patient_id).order("id", desc=True).execute()
            return res.data
        except Exception:
            traceback.print_exc()
    return [o for o in _orders if o["patient_id"] == patient_id]


def get_all_orders() -> list[dict]:
    """Get ALL orders — for admin dashboard."""
    if _use_supabase:
        try:
            res = _sb().table("orders").select("*").order("id", desc=True).execute()
            return res.data
        except Exception:
            traceback.print_exc()
    return _orders


def create_order(patient_id: str, product_id: str, quantity: int) -> dict | None:
    global _order_counter
    product = get_product_by_id(str(product_id))
    if not product:
        return None
    if product.get("stock_quantity", 0) < quantity:
        return None

    if _use_supabase:
        try:
            order = {
                "patient_id": patient_id,
                "product_id": int(product_id) if str(product_id).isdigit() else product_id,
                "product_name": product["product_name"],
                "quantity": quantity,
                "total_price": round(float(product["price"]) * quantity, 2),
                "dosage_frequency": "as_needed",
                "status": "confirmed",
            }
            res = _sb().table("orders").insert(order).execute()
            # Update stock
            new_stock = product["stock_quantity"] - quantity
            update_stock(str(product_id), new_stock)
            if res.data:
                return res.data[0]
        except Exception:
            traceback.print_exc()

    # Fallback
    product["stock_quantity"] -= quantity
    _order_counter += 1
    order = {
        "order_id": f"ORD{_order_counter:03d}",
        "patient_id": patient_id,
        "product_id": product_id,
        "product_name": product["product_name"],
        "quantity": quantity,
        "total_price": round(product["price"] * quantity, 2),
        "purchase_date": str(date.today()),
        "dosage_frequency": "as_needed",
        "status": "confirmed",
    }
    _orders.append(order)
    return order


def update_order_status(order_id: str, new_status: str) -> dict | None:
    """Update order status in Supabase."""
    if _use_supabase:
        try:
            # order_id is the Supabase row id
            try:
                oid = int(order_id)
                res = _sb().table("orders").update({"status": new_status}).eq("id", oid).execute()
            except ValueError:
                res = _sb().table("orders").update({"status": new_status}).eq("id", order_id).execute()
            if res.data:
                return res.data[0]
        except Exception:
            traceback.print_exc()
    # Fallback
    for order in _orders:
        if order.get("order_id") == order_id:
            order["status"] = new_status
            return order
    return None


# ── Prescriptions ────────────────────────────────────────

def add_prescription(patient_id: str, file_url: str, extracted_text: str = "") -> dict:
    if _use_supabase:
        try:
            rec = {
                "patient_id": patient_id,
                "file_name": file_url,
                "verified": True,
                "extracted_text": extracted_text,
            }
            res = _sb().table("prescriptions").insert(rec).execute()
            set_prescription_uploaded(patient_id)
            if res.data:
                return res.data[0]
        except Exception:
            traceback.print_exc()

    rec = {
        "id": len(_prescriptions) + 1,
        "patient_id": patient_id,
        "file_url": file_url,
        "uploaded_at": "2026-02-28T00:00:00",
        "verified": True,
        "extracted_text": extracted_text,
    }
    _prescriptions.append(rec)
    set_prescription_uploaded(patient_id)
    return rec


def get_prescriptions(patient_id: str) -> list[dict]:
    if _use_supabase:
        try:
            res = _sb().table("prescriptions").select("*").eq("patient_id", patient_id).execute()
            return res.data
        except Exception:
            traceback.print_exc()
    return [p for p in _prescriptions if p["patient_id"] == patient_id]


# ── Chat Logs ────────────────────────────────────────────

def save_chat_log(patient_id: str, message: str, reply: str, card_data: dict | None, language: str = "en"):
    """Save a chat interaction to Supabase."""
    if _use_supabase:
        try:
            _sb().table("chat_logs").insert({
                "patient_id": patient_id,
                "message": message,
                "reply": reply,
                "card_data": card_data or {},
                "language": language,
            }).execute()
        except Exception:
            traceback.print_exc()


def get_chat_history(patient_id: str) -> list[dict]:
    if _use_supabase:
        try:
            res = _sb().table("chat_logs").select("*").eq("patient_id", patient_id).order("created_at").execute()
            return res.data
        except Exception:
            traceback.print_exc()
    return []


# ── Fulfillment Logs ─────────────────────────────────────

def add_fulfillment_log(order_id: str, status: str, payload: dict) -> dict:
    if _use_supabase:
        try:
            log = {
                "order_id": order_id,
                "patient_id": payload.get("patient_id", ""),
                "status": status,
                "webhook_response": payload,
            }
            res = _sb().table("fulfillment_logs").insert(log).execute()
            if res.data:
                return res.data[0]
        except Exception:
            traceback.print_exc()

    log = {
        "id": len(_fulfillment_logs) + 1,
        "order_id": order_id,
        "status": status,
        "payload": payload,
    }
    _fulfillment_logs.append(log)
    return log


# ── Refill Alerts ────────────────────────────────────────

def add_refill_alert(patient_id: str, product_id: str, run_out_date: str) -> dict:
    alert = {
        "id": len(_refill_alerts) + 1,
        "patient_id": patient_id,
        "product_id": product_id,
        "predicted_run_out_date": run_out_date,
        "alert_sent": False,
    }
    _refill_alerts.append(alert)
    return alert


def get_refill_alerts() -> list[dict]:
    return _refill_alerts
