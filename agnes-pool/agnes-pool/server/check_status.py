import httpx

r = httpx.get("http://localhost:8000/api/accounts/")
print("Accounts:")
for a in r.json():
    print(f"  [{a['id']}] {a['email']} ({a['key_count']} keys)")

r2 = httpx.get("http://localhost:8000/api/keys/")
print("Keys:")
for k in r2.json():
    print(f"  [{k['id']}] {k['key_preview']} (account {k['account_id']})")
