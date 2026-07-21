from fastapi import APIRouter, HTTPException

from app.config import settings
from app.schemas import AccountImport, AccountOut, RegisterRequest, RegisterResult
from app.token_manager import TokenManager
from app.platforms.agnesai.engine import AgnesAIEngine
from app.email_utils.imap import IMAPReader
from app.state import proxy_pool

router = APIRouter(prefix="/api/accounts", tags=["accounts"])


@router.get("/", response_model=list[AccountOut])
async def list_accounts():
    accounts = await TokenManager.list_accounts()
    result = []
    for acc in accounts:
        keys = await TokenManager.list_api_keys(account_id=acc.id)
        result.append(AccountOut(
            id=acc.id,
            email=acc.email,
            platform_user_id=acc.platform_user_id,
            is_active=acc.is_active,
            key_count=len(keys),
            created_at=acc.created_at,
        ))
    return result


@router.post("/register", response_model=RegisterResult)
async def register_account(req: RegisterRequest):
    proxy = await proxy_pool.get_next()
    engine = AgnesAIEngine(proxy=proxy)
    reader = IMAPReader(
        server=settings.imap_server,
        port=settings.imap_port,
        user=settings.imap_user,
        password=settings.imap_password,
    )
    try:
        await reader.connect()

        ok = await engine.send_verification(req.email)
        if not ok:
            raise HTTPException(status_code=400, detail="send verification failed")

        if proxy:
            print(f"[register] using proxy: {proxy}")
        print(f"[register] verification sent to {req.email}, waiting for code...")

        await engine.delay.wait_between_attempts()
        code = await reader.wait_for_code(sender="Agnes", timeout=120)
        if not code:
            raise HTTPException(status_code=400, detail="verification code not found")

        print(f"[register] code received, completing registration...")

        await engine.delay.wait_between_attempts()
        account_info = await engine.register(req.email, req.password, code=code)
        account = await TokenManager.save_account(
            email=account_info.email,
            password=account_info.password,
            platform_user_id=account_info.platform_user_id or "",
            access_token=account_info.access_token or "",
        )

        await engine.delay.wait_between_attempts()
        api_key = await engine.create_api_key()
        await TokenManager.save_api_key(
            account_id=account.id,
            platform_key_id=0,
            name="agnes-pool-auto",
            key_value=api_key,
        )
        return RegisterResult(
            success=True,
            message="registration completed",
            email=account.email,
            access_token=account.access_token,
            api_key=api_key,
        )
    except RuntimeError as e:
        msg = str(e)
        if "rate limit" in msg.lower() or "too many" in msg.lower():
            print(f"[register] rate limited, will retry after delay")
            raise HTTPException(status_code=429, detail=msg)
        raise HTTPException(status_code=400, detail=msg)
    finally:
        await engine.close()
        await reader.close()


@router.post("/import", response_model=AccountOut)
async def import_account(req: AccountImport):
    account = await TokenManager.save_account(
        email=req.email,
        password=req.password,
        platform_user_id=req.platform_user_id,
        access_token=req.access_token,
    )
    return AccountOut(
        id=account.id,
        email=account.email,
        platform_user_id=account.platform_user_id,
        is_active=account.is_active,
        key_count=0,
        created_at=account.created_at,
    )


@router.delete("/{account_id}")
async def delete_account(account_id: int):
    ok = await TokenManager.delete_account(account_id)
    if not ok:
        raise HTTPException(status_code=404, detail="account not found")
    return {"success": True, "message": "account deleted"}
