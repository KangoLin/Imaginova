import httpx

from app.config import settings
from app.platforms.base import BaseEngine, AccountInfo
from app.platforms.registry import PlatformRegistry
from app.platforms.agnesai.constants import (
    PLATFORM_API_BASE,
    VERIFICATION_ENDPOINT,
    REGISTER_ENDPOINT,
    LOGIN_ENDPOINT,
    TOKEN_ENDPOINT,
)
from app.platforms.agnesai.helpers import make_headers
from app.proxy_pool import DelayStrategy


@PlatformRegistry.register("agnesai")
class AgnesAIEngine(BaseEngine):
    def __init__(self, proxy: str | None = None):
        kwargs = {"base_url": PLATFORM_API_BASE, "timeout": 30}
        if proxy:
            kwargs["proxy"] = proxy
        self._client = httpx.AsyncClient(**kwargs)
        self._token: str | None = None
        self._user_id: int | None = None
        self.delay = DelayStrategy(
            min_delay=settings.register_min_delay,
            max_delay=settings.register_max_delay,
            jitter=settings.register_jitter,
            retry_delay=settings.register_retry_delay,
        )

    async def send_verification(self, email: str) -> bool:
        try:
            resp = await self._client.get(
                VERIFICATION_ENDPOINT,
                params={"email": email, "purpose": "register"},
                headers=make_headers(),
            )
            data = resp.json()
            return data.get("code") == 200
        except httpx.ConnectError as e:
            print(f"[engine] connection error: {e}")
            return False

    async def register(self, email: str, password: str, code: str) -> AccountInfo:
        resp = await self._client.post(
            REGISTER_ENDPOINT,
            json={
                "email": email,
                "password": password,
                "password_confirm": password,
                "code": code,
            },
            headers=make_headers(),
        )
        data = resp.json()
        if data.get("code") != 200:
            raise RuntimeError(data.get("message", "registration failed"))
        user_data = data.get("data", {})
        self._token = user_data.get("access_token")
        self._user_id = user_data.get("user", {}).get("id")
        return AccountInfo(
            email=email,
            password=password,
            platform_user_id=str(self._user_id),
            access_token=self._token,
        )

    async def login(self, email: str, password: str) -> str:
        resp = await self._client.post(
            LOGIN_ENDPOINT,
            json={"username": email, "password": password},
            headers=make_headers(),
        )
        data = resp.json()
        if data.get("code") != 200:
            raise RuntimeError(data.get("message", "login failed"))
        self._token = data["data"]["access_token"]
        self._user_id = data["data"].get("user", {}).get("id")
        return self._token

    async def create_api_key(self, name: str = "agnes-pool") -> str:
        if not self._token:
            raise RuntimeError("not logged in")
        resp = await self._client.post(
            TOKEN_ENDPOINT,
            json={"name": name, "api_key_profile": "default"},
            headers=make_headers(token=self._token),
        )
        data = resp.json()
        if data.get("code") != 200:
            raise RuntimeError(data.get("message", "create api key failed"))
        return data["data"]["key"]

    async def list_api_keys(self) -> list[dict]:
        if not self._token:
            raise RuntimeError("not logged in")
        resp = await self._client.get(
            TOKEN_ENDPOINT,
            params={"key_profile": "default"},
            headers=make_headers(token=self._token),
        )
        data = resp.json()
        if data.get("code") != 200:
            raise RuntimeError(data.get("message", "list api keys failed"))
        return data["data"].get("items", [])

    async def close(self):
        await self._client.aclose()
