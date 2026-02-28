from fastapi import APIRouter
from models.schemas import PatientRegister, PatientLogin, PatientOut, PatientUpdate
from services.data_store import get_patient_by_email, get_patient_by_id, create_patient, update_patient_profile

router = APIRouter(tags=["Patients"])


@router.post("/auth/register")
def register(data: PatientRegister):
    existing = get_patient_by_email(data.email)
    if existing:
        return {"error": "Email already registered"}

    patient = create_patient({
        "name": data.name,
        "email": data.email,
        "phone": data.phone,
        "password_hash": data.password,  # In prod: hash with bcrypt
        "age": data.age,
        "gender": data.gender,
    })
    return {
        "message": "Registration successful",
        "patient_id": patient["patient_id"],
        "name": patient["name"],
    }


@router.post("/auth/login")
def login(data: PatientLogin):
    patient = get_patient_by_email(data.email)
    if not patient:
        return {"error": "Invalid credentials"}
    # In production: verify bcrypt hash
    return {
        "message": "Login successful",
        "patient_id": patient["patient_id"],
        "name": patient["name"],
        "token": f"mock-jwt-token-{patient['patient_id']}",
    }


@router.get("/patients/{patient_id}")
def get_patient(patient_id: str):
    patient = get_patient_by_id(patient_id)
    if not patient:
        return {"error": "Patient not found"}
    return PatientOut(
        patient_id=patient["patient_id"],
        name=patient["name"],
        email=patient["email"],
        phone=patient["phone"],
        age=patient.get("age"),
        gender=patient.get("gender"),
        allergies=patient.get("allergies", []),
        preferred_store=patient.get("preferred_store"),
        prescription_uploaded=patient.get("prescription_uploaded", False),
    )


@router.put("/patients/{patient_id}")
def update_patient(patient_id: str, data: PatientUpdate):
    patient = update_patient_profile(patient_id, data.model_dump(exclude_unset=True))
    if not patient:
        return {"error": "Patient not found"}
    return PatientOut(
        patient_id=patient["patient_id"],
        name=patient["name"],
        email=patient["email"],
        phone=patient["phone"],
        age=patient.get("age"),
        gender=patient.get("gender"),
        allergies=patient.get("allergies", []),
        preferred_store=patient.get("preferred_store"),
        prescription_uploaded=patient.get("prescription_uploaded", False),
    )
