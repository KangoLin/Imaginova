import imaplib, email
import re

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

status, ids = conn.search(None, '(UNSEEN FROM "Agnes")')
if not ids[0]:
    status, ids = conn.search(None, '(FROM "Agnes")')

print(f"Found {len(ids[0].split()) if ids[0] else 0} Agnes AI emails")

if ids[0]:
    for msg_id in ids[0].split()[-3:]:
        status, data = conn.fetch(msg_id, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                if part.get_content_type() == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        body = payload.decode("utf-8", errors="ignore")
                        break
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                body = payload.decode("utf-8", errors="ignore")
        codes = re.findall(r"(\d{6})", body)
        print(f"  [{msg['Date']}] {msg['Subject']} -> codes: {codes[:3]}")

conn.logout()
