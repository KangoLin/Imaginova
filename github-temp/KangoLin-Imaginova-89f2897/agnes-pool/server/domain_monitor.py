import asyncio
import datetime
import httpx
import sys
import os

sys.path.insert(0, ".")
from app.config import settings

CHECK_INTERVAL = 1800
LOG_FILE = "domain_monitor.log"
PROXY_FILE = "working_proxies.txt"

HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://platform.agnes-ai.com",
    "Referer": "https://platform.agnes-ai.com/",
    "Authorization": "Bearer null",
}


def log(msg: str):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    line = f"[{ts}] {msg}"
    print(line)
    with open(LOG_FILE, "a", encoding="utf-8") as f:
        f.write(line + "\n")


def load_proxies() -> list[str]:
    if not os.path.exists(PROXY_FILE):
        return []
    with open(PROXY_FILE) as f:
        return [l.strip() for l in f if l.strip()]


async def check_domain() -> tuple[bool, str]:
    domain = settings.catchall_domain or "imaginova.online"
    email = f"monitor-{datetime.datetime.now().timestamp():.0f}@{domain}"
    proxies = load_proxies()

    if not proxies:
        return False, "no proxies available"

    for proxy_url in proxies[:5]:
        try:
            async with httpx.AsyncClient(proxy=proxy_url, timeout=15) as client:
                resp = await client.get(
                    "https://platform-backend.agnes-ai.com/api/verification",
                    params={"email": email, "purpose": "register"},
                    headers=HEADERS,
                )
                msg = resp.json().get("message", "")
                domain_blocked = "email domain" in msg.lower()
                return not domain_blocked, msg
        except Exception as e:
            continue

    return False, "all proxies failed"


async def monitor_loop():
    log("=== Domain limit monitor started ===")
    log(f"Check interval: {CHECK_INTERVAL}s")
    log(f"Domain: {settings.catchall_domain}")

    while True:
        cleared, detail = await check_domain()
        if cleared:
            log(f"*** DOMAIN UNBLOCKED! Response: {detail[:100]} ***")
            log("You can now register new accounts.")
        else:
            log(f"Still blocked: {detail[:100]}")
        await asyncio.sleep(CHECK_INTERVAL)


if __name__ == "__main__":
    try:
        asyncio.run(monitor_loop())
    except KeyboardInterrupt:
        log("Monitor stopped by user")
