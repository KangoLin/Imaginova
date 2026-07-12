import datetime

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.db_models import Account, ApiKey


class TokenManager:

    @staticmethod
    async def save_account(
        email: str,
        password: str,
        platform_user_id: str,
        access_token: str,
    ) -> Account:
        async with async_session() as session:
            existing = await session.execute(
                select(Account).where(Account.email == email)
            )
            account = existing.scalar_one_or_none()
            if account:
                account.access_token = access_token
                account.platform_user_id = platform_user_id
            else:
                account = Account(
                    email=email,
                    password=password,
                    platform_user_id=platform_user_id,
                    access_token=access_token,
                )
                session.add(account)
            await session.commit()
            await session.refresh(account)
            return account

    @staticmethod
    async def save_api_key(
        account_id: int,
        platform_key_id: int,
        name: str,
        key_value: str,
    ) -> ApiKey:
        async with async_session() as session:
            api_key = ApiKey(
                account_id=account_id,
                platform_key_id=platform_key_id,
                name=name,
                key_value=key_value,
                key_preview=key_value[:12] + "...",
            )
            session.add(api_key)
            await session.commit()
            await session.refresh(api_key)
            return api_key

    @staticmethod
    async def list_accounts() -> list[Account]:
        async with async_session() as session:
            result = await session.execute(select(Account))
            return list(result.scalars().all())

    @staticmethod
    async def list_api_keys(account_id: int | None = None) -> list[ApiKey]:
        async with async_session() as session:
            if account_id:
                result = await session.execute(
                    select(ApiKey).where(ApiKey.account_id == account_id)
                )
            else:
                result = await session.execute(select(ApiKey))
            return list(result.scalars().all())

    @staticmethod
    async def get_all_active_keys() -> list[ApiKey]:
        async with async_session() as session:
            result = await session.execute(
                select(ApiKey).where(ApiKey.is_active == True)
            )
            return list(result.scalars().all())

    @staticmethod
    async def toggle_key(key_id: int, active: bool) -> bool:
        async with async_session() as session:
            result = await session.execute(select(ApiKey).where(ApiKey.id == key_id))
            key = result.scalar_one_or_none()
            if not key:
                return False
            key.is_active = active
            await session.commit()
            return True

    @staticmethod
    async def delete_key(key_id: int) -> bool:
        async with async_session() as session:
            result = await session.execute(
                delete(ApiKey).where(ApiKey.id == key_id)
            )
            await session.commit()
            return result.rowcount > 0

    @staticmethod
    async def update_key_used(key_id: int):
        async with async_session() as session:
            result = await session.execute(
                select(ApiKey).where(ApiKey.id == key_id)
            )
            key = result.scalar_one_or_none()
            if key:
                key.last_used_at = datetime.datetime.now()
                await session.commit()

    @staticmethod
    async def delete_account(account_id: int) -> bool:
        async with async_session() as session:
            await session.execute(delete(ApiKey).where(ApiKey.account_id == account_id))
            result = await session.execute(
                delete(Account).where(Account.id == account_id)
            )
            await session.commit()
            return result.rowcount > 0
