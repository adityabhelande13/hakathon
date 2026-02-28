from fastapi import APIRouter, Query
from typing import Optional
from services.data_store import get_all_products, get_product_by_id, search_products

router = APIRouter(tags=["Products"])


@router.get("/products")
def list_products(
    search: Optional[str] = Query(None, description="Search by name or ingredient"),
    category: Optional[str] = Query(None, description="Filter by category"),
):
    if search or category:
        return search_products(search or "", category)
    return get_all_products()


@router.get("/products/{product_id}")
def get_product(product_id: str):
    product = get_product_by_id(product_id)
    if not product:
        return {"error": "Product not found"}
    return product
