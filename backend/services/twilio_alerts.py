"""
Twilio WhatsApp Alert Service.
Sends WhatsApp messages for:
  1. Patient medicine refill reminders
  2. Admin low-stock inventory alerts
"""
import os
from dotenv import load_dotenv

load_dotenv()

TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID", "")
TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN", "")
TWILIO_WHATSAPP_FROM = os.getenv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886")

_client = None


def _get_client():
    """Lazy-initialize the Twilio client."""
    global _client
    if _client is None:
        if not TWILIO_ACCOUNT_SID or not TWILIO_AUTH_TOKEN:
            return None
        from twilio.rest import Client
        _client = Client(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
    return _client


def send_refill_reminder(patient_phone: str, medicine_name: str, patient_name: str = "User") -> dict:
    """Send a WhatsApp refill reminder to a patient."""
    client = _get_client()
    body = (
        f"💊 *Nexus Pharmacy Refill Reminder*\n\n"
        f"Hi {patient_name},\n"
        f"It's time to refill your *{medicine_name}*.\n\n"
        f"Order now through the Nexus Pharmacy app or reply to this message for assistance.\n\n"
        f"— Your AI Pharmacist 🤖"
    )

    if client is None:
        # No Twilio credentials — return simulated response
        return {
            "status": "simulated",
            "message": f"Refill reminder for '{medicine_name}' would be sent to {patient_phone}",
            "body": body,
        }

    try:
        message = client.messages.create(
            body=body,
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{patient_phone}",
        )
        return {"status": "sent", "sid": message.sid, "to": patient_phone}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def send_low_stock_alert(admin_phone: str, product_name: str, stock_qty: int) -> dict:
    """Send a WhatsApp low-stock alert to an admin."""
    client = _get_client()
    body = (
        f"⚠️ *Nexus Pharmacy — Low Stock Alert*\n\n"
        f"Product: *{product_name}*\n"
        f"Remaining Stock: *{stock_qty} units*\n\n"
        f"Please reorder to avoid stockouts.\n\n"
        f"— Nexus Inventory System"
    )

    if client is None:
        return {
            "status": "simulated",
            "message": f"Low-stock alert for '{product_name}' ({stock_qty} left) would be sent to {admin_phone}",
            "body": body,
        }

    try:
        message = client.messages.create(
            body=body,
            from_=TWILIO_WHATSAPP_FROM,
            to=f"whatsapp:{admin_phone}",
        )
        return {"status": "sent", "sid": message.sid, "to": admin_phone}
    except Exception as e:
        return {"status": "error", "error": str(e)}
