import random
import asyncio
from fastapi import APIRouter
from models.schemas import WebhookPayload
from services.data_store import add_fulfillment_log

router = APIRouter(tags=["Webhooks"])


@router.post("/webhooks/fulfillment")
async def mock_fulfillment(payload: WebhookPayload):
    # Simulate processing delay
    await asyncio.sleep(1)

    # Randomly succeed or fail (80% success rate)
    success = random.random() < 0.8
    status = "fulfilled" if success else "failed"

    log = add_fulfillment_log(
        order_id=payload.order_id,
        status=status,
        payload={"order_id": payload.order_id, "patient_id": payload.patient_id, "items": payload.items},
    )

    return {
        "status": status,
        "message": "Order fulfilled and shipped" if success else "Fulfillment failed — retry queued",
        "log": log,
    }
