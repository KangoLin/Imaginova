import httpx, json

r = httpx.post("http://localhost:8000/api/proxy/health-check/run", timeout=120)
print("Health check results:")
results = r.json().get("results", {})
for key_id, info in results.items():
    status = info["status"]
    detail = info.get("latency") or info.get("error", "")
    print(f"  Key {key_id}: {status} - {detail}")

r2 = httpx.get("http://localhost:8000/api/proxy/stats")
print("\nPer-key stats:")
for k in r2.json().get("per_key", []):
    print(f"  [{k['key_id']}] {k['key_preview']} - calls={k['calls']} ok={k['success']} fail={k['fail']} rate={k['success_rate']}%")
