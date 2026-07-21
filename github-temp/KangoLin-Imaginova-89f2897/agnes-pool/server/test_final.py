import asyncio
import sys
sys.path.insert(0, ".")

from app.platforms.agnesai.engine import AgnesAIEngine
from app.email_utils.imap import IMAPReader
from app.config import settings
from app.token_manager import TokenManager
from app.database import init_db
from datetime import datetime


async def main():
    ts = datetime.now().strftime("%H%M%S")
    email = f"agnes{ts}@imaginova.online"
    password = "TestPass123!"

    print(f"[1] Email: {email}")
    print(f"[2] Sending verification...")

    engine = AgnesAIEngine()
    ok = await engine.send_verification(email)
    print(f"    -> {ok}")
    if not ok:
        return
    await engine.close()

    print(f"[3] Waiting for code via IMAP...")
    reader = IMAPReader(
        server=settings.imap_server,
        port=settings.imap_port,
        user=settings.imap_user,
        password=settings.imap_password,
    )
    await reader.connect()

    code = await reader.wait_for_code(sender="Agnes", timeout=180)
    print(f"    -> code: {code}")

    if not code:
        print("[FAIL] No code received")
        await reader.close()
        return
    await reader.close()

    print(f"[4] Registering...")
    engine = AgnesAIEngine()
    account_info = await engine.register(email, password, code=code)
    print(f"    -> registered: {account_info.email}")

    print(f"[5] Creating API key...")
    api_key = await engine.create_api_key()
    print(f"    -> key: {api_key}")
    await engine.close()

    print(f"[6] Saving to database...")
    await init_db()
    account = await TokenManager.save_account(
        email=account_info.email,
        password=account_info.password,
        platform_user_id=account_info.platform_user_id or "",
        access_token=account_info.access_token or "",
    )
    print(f"    -> account id: {account.id}")

    print(f"\n✅ 注册成功！")
    print(f"   Email:   {email}")
    print(f"   Password: {password}")
    print(f"   API Key: {api_key}")


asyncio.run(main())
