import asyncio
import sys
sys.path.insert(0, ".")

from app.platforms.agnesai.engine import AgnesAIEngine
from app.token_manager import TokenManager
from app.database import init_db


async def create_keys_for_account(account_id: int, email: str, password: str, target_keys: int):
    count_existing = len(await TokenManager.list_api_keys(account_id=account_id))
    to_create = max(0, target_keys - count_existing)
    if to_create == 0:
        print(f"  [-] {email} 已有 {count_existing} 个 Key，已达目标")
        return 0

    engine = AgnesAIEngine()
    try:
        print(f"  [>] 登录 {email}...")
        await engine.login(email, password)
        print(f"  [>] 登录成功，需要创建 {to_create} 个 Key")

        created = 0
        for i in range(to_create):
            try:
                api_key = await engine.create_api_key(name=f"agnes-pool-{i+1}")
                await TokenManager.save_api_key(
                    account_id=account_id,
                    platform_key_id=0,
                    name=f"agnes-pool-{i+1}",
                    key_value=api_key,
                )
                created += 1
                print(f"    [{i+1}/{to_create}] Key: sk-...{api_key[-8:]}")
                if i < to_create - 1:
                    await asyncio.sleep(1)
            except RuntimeError as e:
                msg = str(e)
                if "rate limit" in msg.lower():
                    print(f"    [RATE_LIMIT] 等待 90 秒...")
                    await asyncio.sleep(90)
                else:
                    print(f"    [FAIL] {msg}")
                    break
        return created
    finally:
        await engine.close()


async def main():
    await init_db()

    accounts = [
        (3, "agnetest10@imaginova.online", "TestPass123!"),
        (4, "agnetest11@imaginova.online", "TestPass123!"),
        (5, "agnes0051@imaginova.online", "TestPass123!"),
    ]

    target_keys = 10
    total_created = 0

    for acct_id, email, password in accounts:
        print(f"\n{'='*50}")
        print(f"处理: {email}")
        n = await create_keys_for_account(acct_id, email, password, target_keys)
        total_created += n
        print(f"  => 创建 {n} 个新 Key")

    print(f"\n{'='*50}")
    print(f"总计创建 {total_created} 个 Key")

    all_keys = await TokenManager.get_all_active_keys()
    print(f"活跃 Key 总数: {len(all_keys)}")

    accounts_all = await TokenManager.list_accounts()
    for acc in accounts_all:
        keys = await TokenManager.list_api_keys(account_id=acc.id)
        active = [k for k in keys if k.is_active]
        print(f"  [{acc.id}] {acc.email}: {len(active)} active / {len(keys)} total")


if __name__ == "__main__":
    asyncio.run(main())
