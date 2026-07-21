import httpx
import sys

proxy_file = "working_proxies.txt"
try:
    with open(proxy_file) as f:
        proxies = [l.strip() for l in f if l.strip()]
except FileNotFoundError:
    proxies = []

headers = {
    "Content-Type": "application/json",
    "Origin": "https://platform.agnes-ai.com",
    "Referer": "https://platform.agnes-ai.com/",
    "Authorization": "Bearer null",
}

test_email = f"domain-limit-check-{hash('check') % 100000}@imaginova.online"

def try_via_proxy(proxy_url):
    try:
        with httpx.Client(proxy=proxy_url, timeout=15) as client:
            resp = client.get(
                "https://platform-backend.agnes-ai.com/api/verification",
                params={"email": test_email, "purpose": "register"},
                headers=headers,
            )
            return resp.status_code, resp.json().get("message", "?")
    except Exception as e:
        return None, str(e)[:60]

print(f"Test email: {test_email}")
print()

# Direct
resp = httpx.get(
    "https://platform-backend.agnes-ai.com/api/verification",
    params={"email": test_email, "purpose": "register"},
    headers=headers,
    timeout=15,
)
print(f"Direct:     HTTP {resp.status_code} - {resp.json().get('message', '?')[:100]}")

if proxies:
    for proxy in proxies[:3]:
        status, msg = try_via_proxy(proxy)
        if status:
            print(f"Proxy:      HTTP {status} - {msg[:100]}")
            if "domain" not in msg.lower():
                print("\n*** DOMAIN LIMIT APPEARS CLEARED! ***")
            break
        else:
            print(f"Proxy fail: {msg}")
else:
    print("No proxies available")
