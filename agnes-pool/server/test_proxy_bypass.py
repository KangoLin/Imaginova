import httpx

with open("working_proxies.txt") as f:
    proxies = [l.strip() for l in f if l.strip()]

proxy_url = proxies[0] if proxies else "http://122.246.4.6:17981"
print(f"Testing proxy: {proxy_url}")

headers = {
    "Content-Type": "application/json",
    "Origin": "https://platform.agnes-ai.com",
    "Referer": "https://platform.agnes-ai.com/",
    "Authorization": "Bearer null",
}

test_email = "proxy-bypass-test-01@imaginova.online"

# Direct request (no proxy)
resp_direct = httpx.get(
    "https://platform-backend.agnes-ai.com/api/verification",
    params={"email": test_email, "purpose": "register"},
    headers=headers,
    timeout=15,
)
msg = resp_direct.json().get("message", "?")
print(f"Direct:   HTTP {resp_direct.status_code} - {msg[:80]}")

# Via proxy
try:
    with httpx.Client(proxy=proxy_url, timeout=15) as client:
        resp_proxy = client.get(
            "https://platform-backend.agnes-ai.com/api/verification",
            params={"email": test_email, "purpose": "register"},
            headers=headers,
        )
        msg = resp_proxy.json().get("message", "?")
        print(f"Via proxy: HTTP {resp_proxy.status_code} - {msg[:80]}")
except Exception as e:
    print(f"Via proxy: FAILED - {e}")
