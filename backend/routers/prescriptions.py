from fastapi import APIRouter, UploadFile, File, Form
from services.data_store import add_prescription, get_prescriptions
from services.ocr import extract_text

router = APIRouter(tags=["Prescriptions"])


@router.post("/prescriptions/upload")
async def upload_prescription(
    patient_id: str = Form(...),
    file: UploadFile = File(...),
):
    # Read the file for OCR processing
    file_bytes = await file.read()
    extracted_text = extract_text(file_bytes, file.filename)

    # In production: upload to Supabase Storage
    # For now, we simulate a successful upload
    file_url = f"/uploads/{patient_id}/{file.filename}"
    record = add_prescription(patient_id, file_url, extracted_text=extracted_text)
    
    return {
        "message": "Prescription uploaded successfully",
        "prescription": record,
        "extracted_text": extracted_text,
    }


@router.get("/prescriptions/{patient_id}")
def list_prescriptions(patient_id: str):
    return get_prescriptions(patient_id)
