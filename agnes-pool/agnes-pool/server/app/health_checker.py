import asyncio
import datetime

import httpx

from app.token_manager import TokenManager
from app.proxy.router import balancer


CHECK_INTERVAL = 300
CHECK_TIMEOUT = 15


class HealthChecker:
    def __init__(self):
        self._task: asyncio.Task | None = None
        self._results: dict[int, dict] = {}

    async def _check_key(self, key_id: int, key_value: str) -> dict:
        headers = {
            "Authorization": f"Bearer {key_value}",
            "Content-Type": "application/json",
        }
        start = asyncio.get_event_loop().time()
        try:
            async with httpx.AsyncClient(timeout=CHECK_TIMEOUT) as client:
                resp = await client.post(
                    "https://apihub.agnes-ai.com/v1/images/generations",
                    headers=headers,
                    json={"model": "agnes-image-2.1-flash", "prompt": "health", "n": 1},
                )
            latency = asyncio.get_event_loop().time() - start
            if resp.status_code in (200, 400, 503):
                return {"status": "ok", "latency": round(latency, 2), "checked_at": datetime.datetime.now().isoformat()}
            return {"status": "invalid", "http_code": resp.status_code, "checked_at": datetime.datetime.now().isoformat()}
        except httpx.TimeoutException:
            return {"status": "error", "error": "timeout", "checked_at": datetime.datetime.now().isoformat()}
        except httpx.ConnectError as e:
            return {"status": "error", "error": "connect failed", "checked_at": datetime.datetime.now().isoformat()}
        except httpx.HTTPStatusError as e:
            return {"status": "error", "error": f"http_{e.response.status_code}", "checked_at": datetime.datetime.now().isoformat()}
        except Exception as e:
            msg = str(e) or type(e).__name__
            return {"status": "error", "error": msg[:100], "checked_at": datetime.datetime.now().isoformat()}

    async def run_check(self):
        await balancer.refresh_keys()
        keys = balancer.get_keys()
        for i, key in enumerate(keys):
            if i > 0:
                await asyncio.sleep(5)
            result = await self._check_key(key.id, key.key_value)
            self._results[key.id] = result
            if result["status"] == "invalid":
                await TokenManager.toggle_key(key.id, False)
                print(f"[health] key {key.id} ({key.key_preview}) marked inactive (HTTP {result.get('http_code')})")
            elif result["status"] == "ok":
                print(f"[health] key {key.id} ({key.key_preview}) OK ({result['latency']}s)")
            else:
                print(f"[health] key {key.id} ({key.key_preview}) {result['status']}: {result.get('error', '')}")

    async def _loop(self):
        while True:
            try:
                await self.run_check()
            except Exception as e:
                print(f"[health] check error: {e}")
            await asyncio.sleep(CHECK_INTERVAL)

    def start(self):
        if self._task is None:
            self._task = asyncio.create_task(self._loop())
            print(f"[health] started (interval={CHECK_INTERVAL}s)")

    def get_results(self) -> dict:
        return dict(self._results)


checker = HealthChecker()
