"""
Supabase client configuration for the Nexus Pharmacy backend.
Loads credentials from .env file, falls back to environment variables.
"""
import os
from pathlib import Path

# Load .env file if present
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).resolve().parent / ".env"
    load_dotenv(env_path)
except ImportError:
    pass

SUPABASE_URL = os.getenv(
    "SUPABASE_URL",
    "https://sdexlzjymkygkowyivan.supabase.co"
)
SUPABASE_ANON_KEY = os.getenv(
    "SUPABASE_ANON_KEY",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkZXhsemp5bWt5Z2tvd3lpdmFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIyMTQyMzQsImV4cCI6MjA4Nzc5MDIzNH0.uORvNThPAHiaxlWDt4KQBe76hiPPFGmMSvy_dk781Oo"
)

import socket

# ISP DNS poisoning bypass: Force resolution of supabase.co to real Cloudflare IPs
# This prevents httpx ConnectTimeouts when ISPs like Jio/Airtel hijack the DNS resolver.
_original_getaddrinfo = socket.getaddrinfo

def _custom_getaddrinfo(*args, **kwargs):
    if args and isinstance(args[0], str) and "supabase.co" in args[0]:
        # args[1] is the port (usually 443)
        return [(socket.AF_INET, socket.SOCK_STREAM, socket.IPPROTO_TCP, '', ('104.18.38.10', args[1]))]
    return _original_getaddrinfo(*args, **kwargs)

socket.getaddrinfo = _custom_getaddrinfo

# ── Lazy-init Supabase client ──

_client = None


def get_supabase():
    """Return a cached Supabase client instance with a shorter timeout."""
    global _client
    if _client is None:
        from supabase import create_client, ClientOptions
        import httpx
        _client = create_client(
            SUPABASE_URL,
            SUPABASE_ANON_KEY,
            options=ClientOptions(
                postgrest_client_timeout=5,  # 5 second timeout
            ),
        )
    return _client
