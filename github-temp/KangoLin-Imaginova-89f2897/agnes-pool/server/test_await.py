import asyncio
import sys
sys.path.insert(0, ".")
import imaplib, email


async def test():
    from app.platforms.agnesai.engine import AgnesAIEngine
    engine = AgnesAIEngine()
    ok = await engine.send_verification("agnestest3@imaginova.online")
    print(f"Send verification: {ok}")

    await asyncio.sleep(60)

    conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
    conn.login("2633313990@qq.com", "pevwikagcwigdjfb")

    conn.select("INBOX")
    status, ids = conn.search(None, "ALL")
    all_ids = ids[0].split()
    print(f"Total inbox: {len(all_ids)}")
    if all_ids:
        for msg_id in all_ids[-5:]:
            status, data = conn.fetch(msg_id, "(RFC822)")
            msg = email.message_from_bytes(data[0][1])
            to_val = msg["To"]
            print(f"  [{msg['Date'][:25]}] From: {msg['From']} -> To: {to_val}")

    # Search for any imaginova reference
    status, ids = conn.search(None, 'BODY "imaginova"')
    print(f"\nWith 'imaginova' in body: {len(ids[0].split()) if ids[0] else 0}")

    status, ids = conn.search(None, 'TO "@imaginova.online"')
    print(f"TO @imaginova.online: {len(ids[0].split()) if ids[0] else 0}")

    # Check Junk
    conn.select("Junk")
    status, ids = conn.search(None, "ALL")
    print(f"\nJunk: {len(ids[0].split()) if ids[0] else 0} emails")
    if ids[0]:
        for msg_id in ids[0].split()[-3:]:
            status, data = conn.fetch(msg_id, "(RFC822)")
            msg = email.message_from_bytes(data[0][1])
            print(f"  From: {msg['From']} -> To: {msg['To']}")

    conn.logout()


asyncio.run(test())
