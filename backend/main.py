import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import products, patients, orders, prescriptions, chat, inventory, webhooks, admin_auth, alerts, email_alerts
from services.data_store import get_patient_by_email, get_patient_by_id
from services.email_alerts import send_refill_reminder_email
from agents.refill import calculate_refill_alerts


async def automated_reminder_loop():
    """Background task that sends automated reminders every 6 hours for users with <= 3 days of meds."""
    # Force initial wait of 5 seconds for backend to settle
    await asyncio.sleep(5)
    
    while True:
        try:
            print("🕒 Running automated refill scanner...")
            alerts = calculate_refill_alerts(days_threshold=3)
            
            # For demonstration purposes: send ALL generated alerts to Aditya Bhelande
            demo_patient = get_patient_by_email("bhelandeaditya@gmail.com")
            demo_email = demo_patient.get("email") if demo_patient else "bhelandeaditya@gmail.com"
            demo_name = demo_patient.get("name") if demo_patient else "Aditya Bhelande"
            
            count = 0
            for alert in alerts:
                # Calculate days remaining
                days_left = alert.get("days_remaining", 0)
                
                if days_left <= 3:
                    # In a real system, we'd lookup the specific patient:
                    # p = get_patient_by_id(alert["patient_id"])
                    
                    # For demo: always send to Aditya Bhelande
                    send_refill_reminder_email(
                        to_email=demo_email,
                        medicine_name=alert.get("product_name", "your medicine"),
                        patient_name=demo_name
                    )
                    count += 1
                    
            print(f"✅ Automated scanner finished. Sent {count} refill reminders.")
            
            # Wait 6 hours
            await asyncio.sleep(6 * 3600)
        except asyncio.CancelledError:
            break
        except Exception as e:
            import traceback
            traceback.print_exc()
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

