import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import products, patients, orders, prescriptions, chat, inventory, webhooks, admin_auth, alerts, email_alerts
from services.data_store import get_patient_by_email
from services.email_alerts import send_refill_reminder_email


async def automated_reminder_loop():
    """Background task that sends an automated reminder every 6 hours."""
    while True:
        try:
            # Wait 6 hours
            await asyncio.sleep(6 * 3600)
            
            # Send to Aditya Bhelande as requested
            patient = get_patient_by_email("bhelandeaditya@gmail.com")
            if patient:
                send_refill_reminder_email(
                    to_email=patient.get("email"),
                    medicine_name="Metformin 500mg",
                    patient_name=patient.get("name", "Aditya Bhelande")
                )
                print(f"✅ Automated 6-hour reminder sent to {patient.get('email')}!")
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"❌ Automation error: {e}")
            await asyncio.sleep(60) # Wait a minute before retrying on error


@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(automated_reminder_loop())
    yield
    task.cancel()


app = FastAPI(
    title="Nexus Pharmacy API",
    description="Agentic AI-Powered Pharmacy Backend",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://hakathon-coral.vercel.app",
        "https://*.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    allow_origin_regex=r"https://.*\.vercel\.app",
)

app.include_router(products.router, prefix="/api")
app.include_router(patients.router, prefix="/api")
app.include_router(orders.router, prefix="/api")
app.include_router(prescriptions.router, prefix="/api")
app.include_router(chat.router, prefix="/api")
app.include_router(inventory.router, prefix="/api")
app.include_router(webhooks.router, prefix="/api")
app.include_router(admin_auth.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")
app.include_router(email_alerts.router, prefix="/api")


@app.get("/")
def root():
    return {"status": "Nexus Pharmacy API is running", "docs": "/docs"}

