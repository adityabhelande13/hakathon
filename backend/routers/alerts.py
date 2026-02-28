from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.twilio_alerts import send_refill_reminder, send_low_stock_alert

router = APIRouter(tags=["Alerts"])


class RefillReminderRequest(BaseModel):
    patient_phone: str        # e.g. "+919876543210"
    medicine_name: str        # e.g. "Metformin 500mg"
    patient_name: Optional[str] = "User"


class LowStockAlertRequest(BaseModel):
    admin_phone: str          # e.g. "+919876543210"
    product_name: str         # e.g. "Dolo 650mg"
    stock_quantity: int       # e.g. 5


@router.post("/alerts/refill-reminder")
def trigger_refill_reminder(data: RefillReminderRequest):
    """Send a WhatsApp refill reminder to a patient."""
    result = send_refill_reminder(
        patient_phone=data.patient_phone,
        medicine_name=data.medicine_name,
        patient_name=data.patient_name or "User",
    )
    return result


@router.post("/alerts/low-stock")
def trigger_low_stock_alert(data: LowStockAlertRequest):
    """Send a WhatsApp low-stock alert to an admin."""
    result = send_low_stock_alert(
        admin_phone=data.admin_phone,
        product_name=data.product_name,
        stock_qty=data.stock_quantity,
    )
    return result
