import asyncio
import itertools
from collections import defaultdict

from app.db_models import ApiKey
from app.token_manager import TokenManager


class KeyBalancer:
    def __init__(self, strategy: str = "round_robin"):
        self._strategy = strategy
        self._round_robin: itertools.cycle | None = None
        self._usage_count: dict[int, int] = defaultdict(int)
        self._success_count: dict[int, int] = defaultdict(int)
        self._fail_count: dict[int, int] = defaultdict(int)
        self._lock = asyncio.Lock()
        self._keys: list[ApiKey] = []
        self._cooldowns: dict[int, float] = {}

    async def refresh_keys(self):
        async with self._lock:
            self._keys = await TokenManager.get_all_active_keys()
            if self._strategy == "round_robin":
                self._round_robin = itertools.cycle(self._keys)

    async def get_key(self) -> ApiKey | None:
        async with self._lock:
            if not self._keys:
                await self.refresh_keys()
            if not self._keys:
                return None
            self._cleanup_cooldowns()
            if self._strategy == "round_robin" and self._round_robin:
                for _ in range(len(self._keys)):
                    key = next(self._round_robin)
                    if key.id not in self._cooldowns:
                        self._usage_count[key.id] += 1
                        return key
                return None
            for key in self._keys:
                if key.id not in self._cooldowns:
                    self._usage_count[key.id] += 1
                    return key
            return None

    async def get_all_available(self) -> list[ApiKey]:
        async with self._lock:
            self._cleanup_cooldowns()
            return [k for k in self._keys if k.id not in self._cooldowns]

    async def mark_rate_limited(self, key_id: int, cooldown_seconds: int = 60):
        async with self._lock:
            self._cooldowns[key_id] = asyncio.get_event_loop().time() + cooldown_seconds

    async def release_key(self, key_id: int):
        async with self._lock:
            self._cooldowns.pop(key_id, None)

    async def mark_success(self, key_id: int):
        async with self._lock:
            self._success_count[key_id] += 1

    async def mark_failed(self, key_id: int):
        async with self._lock:
            self._fail_count[key_id] += 1
            self._usage_count[key_id] = max(0, self._usage_count[key_id] - 1)

    def get_keys(self) -> list[ApiKey]:
        return list(self._keys)

    def _cleanup_cooldowns(self):
        now = asyncio.get_event_loop().time()
        expired = [k for k, t in self._cooldowns.items() if t <= now]
        for k in expired:
            del self._cooldowns[k]

    def get_stats(self) -> dict:
        now = asyncio.get_event_loop().time()
        cooled = len([k for k, t in self._cooldowns.items() if t > now])

        per_key = []
        for key in self._keys:
            calls = self._usage_count.get(key.id, 0)
            ok = self._success_count.get(key.id, 0)
            fail = self._fail_count.get(key.id, 0)
            rate = round(ok / (ok + fail) * 100, 1) if (ok + fail) > 0 else 100.0
            per_key.append({
                "key_id": key.id,
                "key_preview": key.key_preview,
                "account_id": key.account_id,
                "calls": calls,
                "success": ok,
                "fail": fail,
                "success_rate": rate,
                "last_used": (key.last_used_at.isoformat() if key.last_used_at else None),
                "is_active": key.is_active,
            })

        return {
            "total_keys": len(self._keys),
            "active_keys": len([k for k in self._keys if k.is_active]),
            "usage": dict(self._usage_count),
            "cooldown_keys": cooled,
            "per_key": per_key,
        }
