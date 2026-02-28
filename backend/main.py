from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import products, patients, orders, prescriptions, chat, inventory, webhooks, admin_auth

app = FastAPI(
    title="Nexus Pharmacy API",
    description="Agentic AI-Powered Pharmacy Backend",
    version="1.0.0",
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


@app.get("/")
def root():
    return {"status": "Nexus Pharmacy API is running", "docs": "/docs"}

