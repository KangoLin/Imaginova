import asyncio
import sys
sys.path.insert(0, ".")
import imaplib, email, re


async def test():
    from app.platforms.agnesai.engine import AgnesAIEngine
    from app.email_utils.imap import IMAPReader
    from app.config import settings

    email_addr = "agnestest4@imaginova.online"
    password = "TestPass123!"

    print(f"1. Using email: {email_addr}")

    # Send verification
    engine = AgnesAIEngine()
    ok = await engine.send_verification(email_addr)
    print(f"2. Verification sent: {ok}")
    await engine.close()

    # Wait for code via IMAP
    reader = IMAPReader(
        server=settings.imap_server,
        port=settings.imap_port,
        user=settings.imap_user,
        password=settings.imap_password,
    )
    await reader.connect()
    print("3. IMAP connected, waiting for code...")

    code = await reader.wait_for_code(sender="Agnes", timeout=180)
    print(f"4. Got code: {code}")
    await reader.close()

    if code:
        engine = AgnesAIEngine()
        try:
            account_info = await engine.register(email_addr, password, code=code)
            print(f"5. Registered: {account_info.email}")

            api_key = await engine.create_api_key()
            print(f"6. API Key: {api_key}")

            from app.token_manager import TokenManager
            from app.database import init_db
            await init_db()
            account = await TokenManager.save_account(
                email=account_info.email,
                password=account_info.password,
                platform_user_id=account_info.platform_user_id or "",
                access_token=account_info.access_token or "",
            )
            print(f"7. Saved account id={account.id}")
            print("\n✅ 注册成功！")
            print(f"   Email: {email_addr}")
            print(f"   Password: {password}")
            print(f"   API Key: {api_key}")
        finally:
            await engine.close()


asyncio.run(test())
