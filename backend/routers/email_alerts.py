from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.email_alerts import send_refill_reminder_email, send_low_stock_alert_email

router = APIRouter(tags=["Email Alerts"])


class EmailRefillReminderRequest(BaseModel):
    to_email: str              # e.g. "patient@example.com"
    medicine_name: str         # e.g. "Metformin 500mg"
    patient_name: Optional[str] = "User"


class EmailLowStockAlertRequest(BaseModel):
    to_email: str              # e.g. "admin@nexuspharmacy.com"
    product_name: str          # e.g. "Dolo 650mg"
    stock_quantity: int        # e.g. 5


@router.post("/email-alerts/refill-reminder")
def trigger_email_refill_reminder(data: EmailRefillReminderRequest):
    """Send an email refill reminder to a patient."""
    result = send_refill_reminder_email(
        to_email=data.to_email,
        medicine_name=data.medicine_name,
        patient_name=data.patient_name or "User",
    )
    return result


@router.post("/email-alerts/low-stock")
def trigger_email_low_stock_alert(data: EmailLowStockAlertRequest):
    """Send an email low-stock alert to an admin."""
    result = send_low_stock_alert_email(
        to_email=data.to_email,
        product_name=data.product_name,
        stock_qty=data.stock_quantity,
    )
    return result
