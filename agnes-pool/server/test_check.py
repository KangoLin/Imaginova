import imaplib, email, time

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

status, ids = conn.search(None, "UNSEEN")
print(f"UNSEEN: {len(ids[0].split()) if ids[0] else 0}")

if ids[0]:
    for mid in ids[0].split()[-3:]:
        s, d = conn.fetch(mid, "(RFC822)")
        msg = email.message_from_bytes(d[0][1])
        print(f'  From: {msg["From"]}')
        print(f'  To: {msg["To"]}')
        print(f'  Subject: {msg["Subject"]}')
        print()

# Check specific TO
conn.select("INBOX")
status, ids = conn.search(None, 'TO "@imaginova.online"')
print(f"TO @imaginova.online: {len(ids[0].split()) if ids[0] else 0}")

conn.logout()
