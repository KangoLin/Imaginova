import asyncio
import sys
sys.path.insert(0, ".")

from app.database import init_db
from app.token_manager import TokenManager


async def main():
    await init_db()

    # Create account entry for our test account
    account = await TokenManager.save_account(
        email="2633313990@qq.com",
        password="<manual-registration>",
        platform_user_id="",
        access_token="",
    )
    print(f"Account created: id={account.id}, email={account.email}")

    # Import the test key
    key_value = "sk-GOaBp95QwiZn4gtbJFBLz1znyJIAcsKKz0tT5nDWj7l6ew0f"
    api_key = await TokenManager.save_api_key(
        account_id=account.id,
        platform_key_id=0,
        name="agnes-pool-test",
        key_value=key_value,
    )
    print(f"Key imported: id={api_key.id}, preview={api_key.key_preview}")

    # Verify
    keys = await TokenManager.list_api_keys()
    print(f"\nTotal keys in database: {len(keys)}")
    for k in keys:
        print(f"  [{k.id}] {k.key_preview} (account_id={k.account_id})")


asyncio.run(main())
