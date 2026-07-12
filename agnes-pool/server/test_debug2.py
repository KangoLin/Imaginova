import asyncio
import sys
sys.path.insert(0, ".")

from app.platforms.agnesai.engine import AgnesAIEngine
from app.platforms.agnesai.helpers import make_headers
import httpx


async def test():
    email = "agnestest@imaginova.online"
    print(f"1. Sending verification to {email}")

    async with httpx.AsyncClient(base_url="https://platform-backend.agnes-ai.com", timeout=30) as client:
        resp = await client.get(
            "/api/verification",
            params={"email": email, "purpose": "register"},
            headers=make_headers(),
        )
        data = resp.json()
        print(f"   Response: {data}")

    await asyncio.sleep(30)

    # Check QQ inbox
    import imaplib, email, re
    conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
    conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
    conn.select("INBOX")

    status, ids = conn.search(None, '(UNSEEN FROM "noreply@agnes-ai.com")')
    print(f"\n2. Unseen from agnes-ai.com: {len(ids[0].split()) if ids[0] else 0}")

    if ids[0]:
        for msg_id in ids[0].split():
            status, data = conn.fetch(msg_id, "(RFC822)")
            msg = email.message_from_bytes(data[0][1])
            print(f"   From: {msg['From']}")
            print(f"   Subject: {msg['Subject']}")
            print(f"   To: {msg['To']}")

    # Also check in ALL
    status, ids = conn.search(None, '(FROM "agnes-ai.com")')
    print(f"\n3. Total from agnes-ai.com: {len(ids[0].split()) if ids[0] else 0}")
    if ids[0]:
        for msg_id in ids[0].split()[-3:]:
            status, data = conn.fetch(msg_id, "(RFC822)")
            msg = email.message_from_bytes(data[0][1])
            print(f"   From: {msg['From']}")
            print(f"   Subject: {msg['Subject']}")
            print(f"   To: {msg['To']}")

    # Check spam folder
    print("\n4. Checking spam/junk folder...")
    try:
        conn.select("[Gmail]/Spam")
        status, ids = conn.search(None, '(FROM "agnes-ai.com")')
        print(f"   Spam from agnes-ai.com: {len(ids[0].split()) if ids[0] else 0}")
    except:
        print("   No spam folder")
    
    # Check all folders  
    print("\n5. Available folders:")
    status, folders = conn.list()
    for f in folders:
        name = f.decode().split('"/"')[-1].strip('" ')
        print(f"   {name}")

    conn.logout()


asyncio.run(test())
