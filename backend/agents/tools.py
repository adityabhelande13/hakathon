"""
Tool-Use Agent — Executes real actions:
- Place orders in the database
- Trigger fulfillment webhooks
- Send notifications (mocked)
"""
from services.data_store import create_order, add_fulfillment_log


def place_order(patient_id: str, items: list[dict]) -> list[dict]:
    """Place orders for a list of approved items."""
    placed_orders = []
    for item in items:
        order = create_order(
            patient_id=patient_id,
            product_id=item["product_id"],
            quantity=item.get("qty", 1),
        )
        if order:
            placed_orders.append(order)
    return placed_orders


def trigger_fulfillment(orders: list[dict]) -> list[dict]:
    """Log fulfillment webhook calls for placed orders."""
    logs = []
    for order in orders:
        import random
        status = "fulfilled" if random.random() < 0.8 else "pending"
        log = add_fulfillment_log(
            order_id=order["order_id"],
            status=status,
            payload=order,
        )
        logs.append(log)
    return logs


def send_notification(patient_id: str, message: str) -> dict:
    """Mock notification — in production would send email/WhatsApp."""
    return {
        "type": "notification",
        "patient_id": patient_id,
        "message": message,
        "channel": "whatsapp",
        "status": "sent",
    }
