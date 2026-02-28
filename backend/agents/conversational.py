"""
Conversational Agent — Extracts medicine names, quantities, and dosages
from messy human text using fuzzy matching against the product database.
"""
from thefuzz import fuzz, process
from services.data_store import get_all_products


def extract_order_intent(message: str) -> list[dict]:
    """
    Parse a natural language message and extract structured order items.
    Returns a list of dicts: [{"product_id": ..., "product_name": ..., "qty": ..., "price": ...}]
    """
    products = get_all_products()
    product_names = {p["product_name"].lower(): p for p in products}

    # Also build a lookup by active ingredient
    ingredient_map: dict[str, list[dict]] = {}
    for p in products:
        key = p["active_ingredient"].lower()
        ingredient_map.setdefault(key, []).append(p)

    message_lower = message.lower()
    found_items: list[dict] = []
    matched_ids: set[str] = set()

    # Strategy 1: Fuzzy match product names
    for name, product in product_names.items():
        score = fuzz.partial_ratio(name, message_lower)
        if score >= 75 and product["product_id"] not in matched_ids:
            qty = _extract_quantity(message_lower, name)
            found_items.append({
                "product_id": product["product_id"],
                "product_name": product["product_name"],
                "qty": qty,
                "price": product["price"],
                "prescription_required": product["prescription_required"],
            })
            matched_ids.add(product["product_id"])

    # Strategy 2: Match by common disease keywords
    keyword_map = {
        "diabetes": ["Metformin", "Glimepiride", "Insulin Glargine"],
        "blood pressure": ["Amlodipine", "Losartan", "Telmisartan"],
        "bp": ["Amlodipine", "Losartan", "Telmisartan"],
        "hypertension": ["Amlodipine", "Losartan", "Telmisartan"],
        "cholesterol": ["Atorvastatin"],
        "fever": ["Dolo 650", "Crocin Advance"],
        "pain": ["Dolo 650", "Ibuprofen 400mg", "Diclofenac Gel"],
        "headache": ["Dolo 650", "Crocin Advance"],
        "cold": ["Cetirizine 10mg", "Crocin Advance"],
        "allergy": ["Cetirizine 10mg", "Montelukast 10mg"],
        "acidity": ["Omeprazole 20mg", "Pan-D", "Ranitidine 150mg"],
        "gastric": ["Omeprazole 20mg", "Pan-D"],
        "infection": ["Azithromycin 500mg", "Amoxicillin 500mg", "Augmentin 625"],
        "antibiotic": ["Azithromycin 500mg", "Amoxicillin 500mg"],
        "thyroid": ["Levothyroxine 50mcg"],
        "asthma": ["Montelukast 10mg", "Salbutamol Inhaler"],
        "vitamin": ["Vitamin D3 60K", "Vitamin B Complex", "Multivitamin Tablets"],
        "diarrhea": ["ORS Sachets", "Loperamide 2mg"],
        "wound": ["Betadine Solution", "Bandage Roll"],
    }

    for keyword, med_names in keyword_map.items():
        if keyword in message_lower:
            for med_name in med_names:
                # Find the product
                match = next((p for p in products if p["product_name"] == med_name), None)
                if match and match["product_id"] not in matched_ids:
                    found_items.append({
                        "product_id": match["product_id"],
                        "product_name": match["product_name"],
                        "qty": 1,
                        "price": match["price"],
                        "prescription_required": match["prescription_required"],
                    })
                    matched_ids.add(match["product_id"])
                    break  # Take the first match per keyword

    return found_items


def _extract_quantity(message: str, product_name: str) -> int:
    """Try to extract a numeric quantity from the message."""
    import re
    # Patterns: "2 strips", "3 boxes", "quantity 5", just a number near the product name
    numbers = re.findall(r'(\d+)', message)
    # Filter out numbers that are likely dosages (like 650, 500, 400)
    quantities = [int(n) for n in numbers if int(n) < 100]
    return quantities[0] if quantities else 1
