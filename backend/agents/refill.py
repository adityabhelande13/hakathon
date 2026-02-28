"""
Predictive Refill Agent — Calculates when patients will run out of medicine
and generates proactive refill alerts.
"""
from datetime import datetime, timedelta
from services.data_store import get_all_products, get_orders_by_patient, add_refill_alert
from services.data_store import _patients

DOSAGE_INTERVALS = {
    "once_daily": 1,
    "twice_daily": 0.5,
    "three_times_daily": 0.333,
    "once_weekly": 7,
    "as_needed": 3,  # Assume 3 days per unit for as-needed
}


def calculate_refill_alerts(days_threshold: int = 7) -> list[dict]:
    """
    Scan all patients' recent orders and predict which medicines
    will run out within `days_threshold` days.
    """
    alerts = []
    today = datetime.now()

    for patient in _patients:
        patient_id = patient["patient_id"]
        orders = get_orders_by_patient(patient_id)

        # Group by product — take the most recent order per product
        latest_orders: dict[str, dict] = {}
        for order in orders:
            pid = order["product_id"]
            if pid not in latest_orders or order["purchase_date"] > latest_orders[pid]["purchase_date"]:
                latest_orders[pid] = order

        for product_id, order in latest_orders.items():
            freq = order.get("dosage_frequency", "once_daily")
            interval = DOSAGE_INTERVALS.get(freq, 1)
            quantity = order["quantity"]

            # Calculate days of supply
            days_of_supply = quantity * interval

            # Parse purchase date
            try:
                purchase_date = datetime.strptime(order["purchase_date"], "%Y-%m-%d")
            except (ValueError, KeyError):
                continue

            run_out_date = purchase_date + timedelta(days=days_of_supply)

            # Check if within threshold
            days_until_runout = (run_out_date - today).days
            if days_until_runout <= days_threshold:
                alert = add_refill_alert(
                    patient_id=patient_id,
                    product_id=product_id,
                    run_out_date=run_out_date.strftime("%Y-%m-%d"),
                )
                alert["product_name"] = order["product_name"]
                alert["patient_name"] = patient["name"]
                alert["days_remaining"] = max(0, days_until_runout)
                alerts.append(alert)

    return alerts
