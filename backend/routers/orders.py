from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from models.schemas import OrderCreate
from services.data_store import (
    create_order, get_orders_by_patient, get_product_by_id,
    get_patient_by_id, get_all_orders, update_order_status,
)

router = APIRouter(tags=["Orders"])


class StatusUpdate(BaseModel):
    status: str


@router.post("/orders")
def place_order(data: OrderCreate):
    product = get_product_by_id(data.product_id)
    if not product:
        return {"error": "Product not found"}
    if product.get("stock_quantity", 0) < data.quantity:
        return {"error": f"Insufficient stock. Available: {product['stock_quantity']}"}

    order = create_order(data.patient_id, data.product_id, data.quantity)
    if not order:
        return {"error": "Failed to create order"}
    return {"message": "Order placed successfully", "order": order}


@router.get("/orders/{patient_id}")
def get_orders(patient_id: str):
    orders = get_orders_by_patient(patient_id)
    return {"orders": orders, "count": len(orders)}


@router.get("/admin/orders")
def admin_get_all_orders():
    """Get ALL orders across all patients — for pharmacist admin view."""
    all_orders = get_all_orders()
    enriched = []
    for order in all_orders:
        patient = get_patient_by_id(order.get("patient_id", ""))
        enriched.append({
            **order,
            "order_id": str(order.get("id", order.get("order_id", ""))),
            "patient_name": patient["name"] if patient else "Unknown",
        })
    enriched.sort(key=lambda x: x.get("id", 0), reverse=True)
    return {
        "orders": enriched,
        "count": len(enriched),
        "pending": len([o for o in enriched if o.get("status") in ("confirmed", "processing")]),
        "delivered": len([o for o in enriched if o.get("status") == "delivered"]),
    }


@router.put("/admin/orders/{order_id}/status")
def admin_update_order_status(order_id: str, body: StatusUpdate):
    """Update order status — used by pharmacist."""
    result = update_order_status(order_id, body.status)
    if result:
        return {"message": f"Order {order_id} updated to {body.status}", "order": result}
    return {"error": "Order not found"}
