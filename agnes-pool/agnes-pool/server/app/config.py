from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "sqlite+aiosqlite:///./agnes_pool.db"

    platform_api_base: str = "https://platform-backend.agnes-ai.com"
    generation_api_base: str = "https://apihub.agnes-ai.com/v1"
    video_query_base: str = "https://apihub.agnes-ai.com"

    imap_server: str = ""
    imap_port: int = 993
    imap_user: str = ""
    imap_password: str = ""
    imap_mailbox: str = "INBOX"
    catchall_domain: str = ""

    proxy_host: str = "0.0.0.0"
    proxy_port: int = 8080

    key_rotation_strategy: str = "round_robin"
    proxy_timeout_seconds: int = 300
    max_keys_per_account: int = 20

    proxy_list: str = ""
    register_min_delay: float = 3.0
    register_max_delay: float = 8.0
    register_jitter: float = 2.0
    register_retry_delay: float = 90.0

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
