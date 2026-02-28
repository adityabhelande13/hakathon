from fastapi import APIRouter
from models.schemas import InventoryUpdate
from services.data_store import get_all_products, update_stock, get_refill_alerts

router = APIRouter(tags=["Admin"])


@router.get("/admin/inventory")
def list_inventory():
    products = get_all_products()
    return {
        "products": products,
        "total": len(products),
        "low_stock": len([p for p in products if p["stock_quantity"] < 50]),
        "out_of_stock": len([p for p in products if p["stock_quantity"] == 0]),
    }


@router.put("/admin/inventory/{product_id}")
def update_inventory(product_id: str, data: InventoryUpdate):
    product = update_stock(product_id, data.stock_quantity)
    if not product:
        return {"error": "Product not found"}
    return {"message": "Stock updated", "product": product}


@router.get("/admin/refill-alerts")
def list_refill_alerts():
    return get_refill_alerts()
