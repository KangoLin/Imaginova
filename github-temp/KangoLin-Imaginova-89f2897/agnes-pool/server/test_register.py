import asyncio
import sys
sys.path.insert(0, ".")

from app.config import settings
from app.platforms.agnesai.engine import AgnesAIEngine
from app.email_utils.imap import IMAPReader
from app.token_manager import TokenManager
from app.email_utils.catchall import CatchAllEmailGenerator
from app.database import init_db


async def test():
    await init_db()

    gen = CatchAllEmailGenerator(settings.catchall_domain or "imaginova.online")
    email = gen.generate()
    password = "TestPass123!"

    print(f"1. Generated email: {email}")

    engine = AgnesAIEngine()
    reader = IMAPReader(
        server=settings.imap_server,
        port=settings.imap_port,
        user=settings.imap_user,
        password=settings.imap_password,
    )

    try:
        await reader.connect()
        print("2. IMAP connected")

        ok = await engine.send_verification(email)
        print(f"3. Verification sent: {ok}")
        if not ok:
            print("FAILED: send verification")
            return

        code = await reader.wait_for_code(sender="Agnes", timeout=120)
        print(f"4. Got code: {code}")
        if not code:
            print("FAILED: no code")
            return

        account_info = await engine.register(email, password, code=code)
        print(f"5. Registered: {account_info.email}")

        api_key = await engine.create_api_key()
        print(f"6. API Key: {api_key}")

        account = await TokenManager.save_account(
            email=account_info.email,
            password=account_info.password,
            platform_user_id=account_info.platform_user_id or "",
            access_token=account_info.access_token or "",
        )
        print(f"7. Saved account id={account.id}")

        print("\n✅ SUCCESS! Full registration completed.")
        print(f"   Email: {email}")
        print(f"   Password: {password}")
        print(f"   API Key: {api_key}")
    finally:
        await engine.close()
        await reader.close()


asyncio.run(test())
