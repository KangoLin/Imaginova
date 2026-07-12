import abc
from dataclasses import dataclass


@dataclass
class AccountInfo:
    email: str
    password: str
    platform_user_id: str | None = None
    access_token: str | None = None


class BaseEngine(abc.ABC):

    @abc.abstractmethod
    async def send_verification(self, email: str) -> bool:
        ...

    @abc.abstractmethod
    async def register(self, email: str, password: str, code: str) -> AccountInfo:
        ...

    @abc.abstractmethod
    async def login(self, email: str, password: str) -> str:
        ...

    @abc.abstractmethod
    async def create_api_key(self, name: str = "agnes-pool") -> str:
        ...

    @abc.abstractmethod
    async def list_api_keys(self) -> list[dict]:
        ...
