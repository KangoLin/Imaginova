import imaplib, email, re

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

# Test search patterns
patterns = [
    '(UNSEEN FROM "Agnes")',
    '(UNSEEN FROM "Agnes AI")',
    '(UNSEEN FROM "noreply@agnes-ai.com")',
    '(FROM "Agnes")',
]

for p in patterns:
    status, ids = conn.search(None, p)
    count = len(ids[0].split()) if ids[0] else 0
    print(f"{p}: {count}")
    if count:
        for mid in ids[0].split():
            s, d = conn.fetch(mid, "(RFC822)")
            msg = email.message_from_bytes(d[0][1])
            print(f"  From: {msg['From']}")
            print(f"  To: {msg['To']}")
            print(f"  Seen flags: {d[0][0]}")

conn.logout()
