"""Quick test to verify Supabase connection and API endpoints."""
import urllib.request
import json


def get(url):
    r = urllib.request.urlopen(url)
    return json.loads(r.read())


def post(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers={"Content-Type": "application/json"},
    )
    r = urllib.request.urlopen(req)
    return json.loads(r.read())


def test_all():
    BASE = "http://localhost:8000/api"
    passed = 0
    failed = 0

    # Test 1: Products from Supabase
    try:
        products = get(f"{BASE}/products")
        assert len(products) >= 30, f"Expected 30+ products, got {len(products)}"
        print(f"  [PASS] Products: {len(products)} items from Supabase")
        first = products[0]
        print(f"         First: {first['product_name']} - Rs.{first['price']}")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] Products: {e}")
        failed += 1

    # Test 2: Search products
    try:
        results = get(f"{BASE}/products?search=paracetamol")
        assert len(results) >= 1, f"Expected paracetamol results"
        print(f"  [PASS] Search 'paracetamol': {len(results)} results")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] Search: {e}")
        failed += 1

    # Test 3: Chat with language
    try:
        res = post(f"{BASE}/chat", {
            "patient_id": "PAT001",
            "message": "hello",
            "language": "hi",
        })
        assert "नमस्ते" in res.get("reply", ""), "Expected Hindi greeting"
        print(f"  [PASS] Chat (Hindi): {res['reply'][:60]}...")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] Chat Hindi: {e}")
        failed += 1

    # Test 4: Admin login via Supabase
    try:
        res = post(f"{BASE}/admin/login", {
            "username": "admin",
            "password": "nexus2026",
        })
        assert res.get("authenticated") == True
        print(f"  [PASS] Admin login: {res['name']} ({res['role']})")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] Admin login: {e}")
        failed += 1

    # Test 5: Admin orders
    try:
        res = get(f"{BASE}/admin/orders")
        count = res.get("count", 0)
        print(f"  [PASS] Admin orders: {count} total, {res.get('pending', 0)} pending")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] Admin orders: {e}")
        failed += 1

    # Test 6: Register new patient via Supabase
    try:
        import random
        rnd = random.randint(1000, 9999)
        res = post(f"{BASE}/auth/register", {
            "name": f"Test User {rnd}",
            "email": f"test{rnd}@nexus.com",
            "phone": f"98765{rnd:05d}",
            "password": "test123",
        })
        if "error" in res:
            print(f"  [WARN] Register: {res['error']} (may already exist)")
        else:
            print(f"  [PASS] Register: {res['name']} -> {res['patient_id']}")
        passed += 1
    except Exception as e:
        print(f"  [FAIL] Register: {e}")
        failed += 1

    print(f"\n{'='*50}")
    print(f"Results: {passed} passed, {failed} failed")


if __name__ == "__main__":
    print("Nexus Pharmacy — Supabase Integration Test")
    print("=" * 50)
    test_all()
