import asyncio
import httpx
import time
import sys

TEST_URL = "https://platform-backend.agnes-ai.com/api/verification"
TEST_PARAMS = {"email": "proxy-test-probe@imaginova.online", "purpose": "register"}
TEST_HEADERS = {
    "Content-Type": "application/json",
    "Origin": "https://platform.agnes-ai.com",
    "Referer": "https://platform.agnes-ai.com/",
    "Authorization": "Bearer null",
}
CONCURRENCY = 50
TIMEOUT = 10.0


async def test_proxy(sem: asyncio.Semaphore, proxy: str) -> tuple[str, bool, float]:
    async with sem:
        start = time.time()
        try:
            proxy_url = f"http://{proxy}"
            async with httpx.AsyncClient(proxy=proxy_url, timeout=TIMEOUT) as client:
                resp = await client.get(TEST_URL, params=TEST_PARAMS, headers=TEST_HEADERS)
                elapsed = time.time() - start
                return proxy, True, elapsed
        except Exception:
            elapsed = time.time() - start
            return proxy, False, elapsed


async def main():
    max_proxies = 500
    with open("free_proxies.txt") as f:
        proxies = [l.strip() for l in f if l.strip()][:max_proxies]

    print(f"Testing {len(proxies)} proxies against Agnes AI...")

    sem = asyncio.Semaphore(CONCURRENCY)
    tasks = [test_proxy(sem, p) for p in proxies]

    working = []
    done = 0
    start_time = time.time()

    for coro in asyncio.as_completed(tasks):
        proxy, ok, elapsed = await coro
        done += 1
        if ok:
            proxy_url = f"http://{proxy}"
            working.append(proxy_url)
        if done % 100 == 0:
            elapsed_total = time.time() - start_time
            print(f"  {done}/{len(proxies)} tested, {len(working)} working ({elapsed_total:.0f}s)")

    elapsed_total = time.time() - start_time
    print(f"\nDone: {len(working)}/{len(proxies)} proxies work")
    print(f"Time: {elapsed_total:.0f}s")

    with open("working_proxies.txt", "w") as f:
        f.write("\n".join(working))
    print(f"Saved working proxies to working_proxies.txt")

    if working:
        preview = ",".join(working[:10])
        if len(working) > 10:
            preview += ",..."
        print(f"\nPROXY_LIST 配置 ({len(working)} proxies):")
        print(f'PROXY_LIST={preview}')


if __name__ == "__main__":
    asyncio.run(main())
