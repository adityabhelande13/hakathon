from pydantic import BaseModel
from typing import Optional


class ProductOut(BaseModel):
    product_id: str
    product_name: str
    price: float
    description: str
    package_size: str
    stock_quantity: int
    prescription_required: bool
    active_ingredient: str
    category: str
    manufacturer: str
    image_url: Optional[str] = None


class PatientRegister(BaseModel):
    name: str
    email: str
    phone: str
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None


class PatientLogin(BaseModel):
    email: str
    password: str


class PatientOut(BaseModel):
    patient_id: str
    name: str
    email: str
    phone: str
    age: Optional[int] = None
    gender: Optional[str] = None
    allergies: list[str] = []
    preferred_store: Optional[str] = None
    prescription_uploaded: bool = False


class PatientUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    allergies: Optional[list[str]] = None
    preferred_store: Optional[str] = None


class OrderCreate(BaseModel):
    patient_id: str
    product_id: str
    quantity: int


class OrderOut(BaseModel):
    order_id: str
    patient_id: str
    product_id: str
    product_name: str
    quantity: int
    total_price: float
    purchase_date: str
    dosage_frequency: str
    status: str


class ChatRequest(BaseModel):
    patient_id: str
    message: str
    language: Optional[str] = "en"


class ChatResponse(BaseModel):
    reply: str
    card_data: Optional[dict] = None


class InventoryUpdate(BaseModel):
    stock_quantity: int


class WebhookPayload(BaseModel):
    order_id: str
    patient_id: str
    items: list[dict]


class AdminLogin(BaseModel):
    username: str
    password: str

