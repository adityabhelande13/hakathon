"""
Safety & Compliance Agent — Validates orders against business rules:
1. Prescription check
2. Stock check
3. Allergy/contraindication check
"""
from services.data_store import get_product_by_id, get_patient_by_id


def validate_order(patient_id: str, items: list[dict]) -> dict:
    """
    Validate a list of order items for a given patient.
    Returns: {"approved": bool, "items": [...], "message": str}
    """
    patient = get_patient_by_id(patient_id)
    if not patient:
        return {"approved": False, "items": [], "message": "Patient not found. Please register first."}

    approved_items = []
    rejected_items = []

    for item in items:
        product = get_product_by_id(item["product_id"])
        if not product:
            rejected_items.append({**item, "reason": "Product not found in our database."})
            continue

        # Check 1: Prescription required?
        if product["prescription_required"] and not patient.get("prescription_uploaded", False):
            rejected_items.append({
                **item,
                "reason": f"{product['product_name']} requires a valid prescription. Please upload one first."
            })
            continue

        # Check 2: Stock available?
        if product["stock_quantity"] < item.get("qty", 1):
            rejected_items.append({
                **item,
                "reason": f"Insufficient stock for {product['product_name']}. Available: {product['stock_quantity']}."
            })
            continue

        # Check 3: Allergy check
        patient_allergies = [a.lower() for a in patient.get("allergies", [])]
        if product["active_ingredient"].lower() in patient_allergies:
            rejected_items.append({
                **item,
                "reason": f"⚠️ SAFETY ALERT: {product['product_name']} contains {product['active_ingredient']}, which conflicts with your known allergy."
            })
            continue

        # Passed all checks
        approved_items.append(item)

    if rejected_items and not approved_items:
        reasons = "; ".join([r["reason"] for r in rejected_items])
        return {
            "approved": False,
            "items": [],
            "rejected": rejected_items,
            "message": f"Order cannot proceed: {reasons}",
        }
    elif rejected_items:
        reasons = "; ".join([r["reason"] for r in rejected_items])
        return {
            "approved": True,
            "items": approved_items,
            "rejected": rejected_items,
            "message": f"Some items were removed: {reasons}. Proceeding with approved items.",
        }
    else:
        return {
            "approved": True,
            "items": approved_items,
            "rejected": [],
            "message": "All items passed safety checks. Ready to order.",
        }
