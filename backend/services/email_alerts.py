"""
Email Alert Service.
Sends email notifications for:
  1. Patient medicine refill reminders
  2. Admin low-stock inventory alerts

Uses Python's built-in smtplib — no extra dependencies needed.
Configure SMTP credentials in .env (supports Gmail, Outlook, etc.)
"""
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_NAME = os.getenv("SMTP_FROM_NAME", "Nexus Pharmacy")


def _send_email(to_email: str, subject: str, html_body: str) -> dict:
    """Send an email via SMTP. Returns status dict."""
    if not SMTP_USER or not SMTP_PASSWORD:
        return {
            "status": "simulated",
            "message": f"Email would be sent to {to_email}",
            "subject": subject,
            "body_preview": html_body[:200],
        }

    try:
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{SMTP_FROM_NAME} <{SMTP_USER}>"
        msg["To"] = to_email
        msg["Subject"] = subject
        msg.attach(MIMEText(html_body, "html"))

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())

        return {"status": "sent", "to": to_email, "subject": subject}
    except Exception as e:
        return {"status": "error", "error": str(e)}


def send_refill_reminder_email(to_email: str, medicine_name: str, patient_name: str = "User") -> dict:
    """Send a refill reminder email to a patient."""
    subject = f"💊 Refill Reminder — {medicine_name}"
    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; background: #0A0A0F; color: #F0F0F5; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #45C4F9, #FF6B9E); padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; color: white;">💊 Nexus Pharmacy</h1>
        <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Refill Reminder</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 15px;">Hi <strong>{patient_name}</strong>,</p>
        <p style="font-size: 15px;">It's time to refill your <strong>{medicine_name}</strong>.</p>
        <p style="font-size: 14px; color: #9ca3af;">Order now through the Nexus Pharmacy app or reply to this email for assistance.</p>
        <hr style="border: none; border-top: 1px solid #1A1A2E; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">— Your AI Pharmacist 🤖</p>
      </div>
    </div>
    """
    return _send_email(to_email, subject, html_body)


def send_low_stock_alert_email(to_email: str, product_name: str, stock_qty: int) -> dict:
    """Send a low-stock alert email to an admin."""
    subject = f"⚠️ Low Stock Alert — {product_name} ({stock_qty} left)"
    html_body = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: auto; background: #0A0A0F; color: #F0F0F5; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #f59e0b, #ef4444); padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; color: white;">⚠️ Nexus Pharmacy</h1>
        <p style="margin: 4px 0 0; color: rgba(255,255,255,0.8); font-size: 13px;">Low Stock Alert</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 15px;">Product: <strong>{product_name}</strong></p>
        <p style="font-size: 15px;">Remaining Stock: <strong style="color: #ef4444;">{stock_qty} units</strong></p>
        <p style="font-size: 14px; color: #9ca3af;">Please reorder to avoid stockouts.</p>
        <hr style="border: none; border-top: 1px solid #1A1A2E; margin: 20px 0;" />
        <p style="font-size: 12px; color: #6b7280; text-align: center;">— Nexus Inventory System</p>
      </div>
    </div>
    """
    return _send_email(to_email, subject, html_body)
