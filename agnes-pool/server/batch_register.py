import argparse
import asyncio
import random
import sys
sys.path.insert(0, ".")

from app.config import settings
from app.platforms.agnesai.engine import AgnesAIEngine
from app.email_utils.imap import IMAPReader
from app.email_utils.catchall import CatchAllEmailGenerator
from app.token_manager import TokenManager
from app.database import init_db


async def register_one(email: str, password: str) -> dict:
    engine = AgnesAIEngine()
    reader = IMAPReader(
        server=settings.imap_server,
        port=settings.imap_port,
        user=settings.imap_user,
        password=settings.imap_password,
    )
    try:
        await reader.connect()
        ok = await engine.send_verification(email)
        if not ok:
            return {"success": False, "email": email, "error": "发送验证码失败"}
        print(f"  [>] 验证码已发送，等待接收...")
        code = await reader.wait_for_code(sender="Agnes", timeout=120)
        if not code:
            return {"success": False, "email": email, "error": "未收到验证码"}
        print(f"  [>] 验证码: {code}")
        account_info = await engine.register(email, password, code=code)
        print(f"  [>] 注册成功，创建 API Key...")
        api_key = await engine.create_api_key()
        account = await TokenManager.save_account(
            email=account_info.email,
            password=account_info.password,
            platform_user_id=account_info.platform_user_id or "",
            access_token=account_info.access_token or "",
        )
        await TokenManager.save_api_key(
            account_id=account.id,
            platform_key_id=0,
            name="agnes-pool-auto",
            key_value=api_key,
        )
        return {"success": True, "email": email, "api_key": api_key}
    except RuntimeError as e:
        msg = str(e)
        if "rate limit" in msg.lower() or "too many" in msg.lower():
            return {"success": False, "email": email, "error": msg, "rate_limited": True}
        if "already registered" in msg.lower():
            return {"success": False, "email": email, "error": msg, "email_exists": True}
        return {"success": False, "email": email, "error": msg}
    finally:
        await engine.close()
        await reader.close()


async def batch_register(count: int, password: str = "TestPass123!", start: int = 50):
    await init_db()

    gen = CatchAllEmailGenerator(settings.catchall_domain or "imaginova.online")
    gen._counter = start

    results = {"success": 0, "failed": 0, "rate_limited": False}

    for i in range(count):
        email = gen.generate()
        sep = "="*40
        print(f"\n[{i+1}/{count}] {sep}")
        print(f"[{i+1}/{count}] 注册 {email}")
        print(f"[{i+1}/{count}] {sep}")

        result = await register_one(email, password)

        if result["success"]:
            print(f"  [OK] Key: sk-...{result['api_key'][-8:]}")
            results["success"] += 1
        else:
            print(f"  [FAIL] {result.get('error')}")
            results["failed"] += 1
            if result.get("rate_limited"):
                results["rate_limited"] = True

        if i < count - 1:
            if result.get("rate_limited"):
                wait = 90
            else:
                wait = random.uniform(15, 30)
            print(f"  [WAIT] 等待 {wait:.0f} 秒...")
            await asyncio.sleep(wait)

    sep = "="*40
    print(f"\n{sep}")
    print(f"批量注册完成: {results['success']} 成功, {results['failed']} 失败")

    print(f"\n当前账号列表:")
    accounts = await TokenManager.list_accounts()
    for acc in accounts:
        keys = await TokenManager.list_api_keys(account_id=acc.id)
        active_keys = [k for k in keys if k.is_active]
        print(f"  [{acc.id}] {acc.email} - {len(active_keys)} active key(s)")
    all_keys = await TokenManager.get_all_active_keys()
    print(f"\n活跃 Key 总数: {len(all_keys)}")

    return results


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="批量注册 Agnes AI 账号")
    parser.add_argument("--count", type=int, default=5, help="注册数量 (默认 5)")
    parser.add_argument("--password", default="TestPass123!")
    parser.add_argument("--start", type=int, default=50, help="邮箱编号起始 (默认 50)")
    args = parser.parse_args()

    asyncio.run(batch_register(args.count, args.password, args.start))
