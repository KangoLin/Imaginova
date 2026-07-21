import datetime

from pydantic import BaseModel


class AccountCreate(BaseModel):
    email: str
    password: str
    password_confirm: str
    code: str


class AccountOut(BaseModel):
    id: int
    email: str
    platform_user_id: str | None
    is_active: bool
    key_count: int = 0
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ApiKeyOut(BaseModel):
    id: int
    account_id: int
    name: str
    key_preview: str
    key_profile: str
    is_active: bool
    last_used_at: datetime.datetime | None
    created_at: datetime.datetime

    class Config:
        from_attributes = True


class ApiKeyFull(ApiKeyOut):
    key_value: str


class RegisterRequest(BaseModel):
    email: str
    password: str


class RegisterResult(BaseModel):
    success: bool
    message: str
    email: str | None = None
    access_token: str | None = None
    api_key: str | None = None


class AccountImport(BaseModel):
    email: str
    password: str = ""
    platform_user_id: str = ""
    access_token: str = ""


class ApiKeyImport(BaseModel):
    account_id: int
    name: str
    key_value: str
    platform_key_id: int | None = None


class ProxyConfig(BaseModel):
    target: str = "https://apihub.agnes-ai.com/v1"
    rotation_strategy: str = "round_robin"
    timeout_seconds: int = 300
