from fastapi import APIRouter
from models.schemas import AdminLogin
from services.data_store import _use_supabase

router = APIRouter(tags=["Admin Auth"])

# ── Hardcoded fallback admin credentials ──
ADMIN_USERS = {
    "admin": {"password": "nexus2026", "name": "Dr. Pharmacist Admin", "role": "admin"},
    "pharmacist": {"password": "pharma123", "name": "Senior Pharmacist", "role": "pharmacist"},
}


def _check_supabase_admin(username: str, password: str):
    """Try to authenticate via Supabase admin_users table."""
    if not _use_supabase:
        return None
    try:
        from supabase_client import get_supabase
        sb = get_supabase()
        res = sb.table("admin_users").select("*").eq("username", username).limit(1).execute()
        if res.data:
            admin = res.data[0]
            if admin["password_hash"] == password:
                return {
                    "authenticated": True,
                    "message": "Login successful",
                    "name": admin["name"],
                    "role": admin["role"],
                    "token": f"admin-token-{username}-{admin['role']}",
                }
    except Exception:
        pass
    return None


@router.post("/admin/login")
def admin_login(data: AdminLogin):
    """Authenticate an admin/pharmacist user (checks Supabase first, then fallback)."""
    # Try Supabase first
    sb_result = _check_supabase_admin(data.username, data.password)
    if sb_result:
        return sb_result

    # Fallback to hardcoded
    admin = ADMIN_USERS.get(data.username)
    if not admin:
        return {"error": "Invalid admin credentials", "authenticated": False}
    if admin["password"] != data.password:
        return {"error": "Invalid admin credentials", "authenticated": False}
    return {
        "authenticated": True,
        "message": "Login successful",
        "name": admin["name"],
        "role": admin["role"],
        "token": f"admin-token-{data.username}-{admin['role']}",
    }
