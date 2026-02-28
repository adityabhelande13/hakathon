from fastapi import APIRouter
from models.schemas import ChatRequest
from agents.orchestrator import process_message
from services.data_store import save_chat_log

router = APIRouter(tags=["Chat"])


@router.post("/chat")
def chat(req: ChatRequest):
    language = req.language or "en"
    result = process_message(req.patient_id, req.message, language=language)

    # Save chat interaction to Supabase
    save_chat_log(
        patient_id=req.patient_id,
        message=req.message,
        reply=result.get("reply", ""),
        card_data=result.get("card_data"),
        language=language,
    )

    return result
