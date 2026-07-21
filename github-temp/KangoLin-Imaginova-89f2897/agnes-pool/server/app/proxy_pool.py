import asyncio
import random
from typing import Optional


class ProxyPool:
    def __init__(self, proxies: list[str] | None = None):
        self._proxies = proxies or []
        self._index = 0
        self._lock = asyncio.Lock()

    def add_proxy(self, proxy: str):
        if proxy not in self._proxies:
            self._proxies.append(proxy)

    def load_from_text(self, text: str):
        for line in text.strip().splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                self.add_proxy(line)

    async def get_next(self) -> Optional[str]:
        if not self._proxies:
            return None
        async with self._lock:
            proxy = self._proxies[self._index]
            self._index = (self._index + 1) % len(self._proxies)
            return proxy

    def clear(self):
        self._proxies.clear()
        self._index = 0

    async def get_random(self) -> Optional[str]:
        if not self._proxies:
            return None
        async with self._lock:
            return random.choice(self._proxies)

    @property
    def count(self) -> int:
        return len(self._proxies)


class DelayStrategy:
    def __init__(
        self,
        min_delay: float = 2.0,
        max_delay: float = 5.0,
        jitter: float = 1.0,
        retry_delay: float = 60.0,
    ):
        self.min_delay = min_delay
        self.max_delay = max_delay
        self.jitter = jitter
        self.retry_delay = retry_delay

    async def wait_between_attempts(self):
        base = random.uniform(self.min_delay, self.max_delay)
        jitter = random.uniform(0, self.jitter)
        await asyncio.sleep(base + jitter)

    async def wait_on_rate_limit(self):
        await asyncio.sleep(self.retry_delay)
