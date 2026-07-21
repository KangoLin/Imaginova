import imaplib, email, re

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

def strip_html(html):
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

from app.platforms.agnesai.helpers import extract_verification_code

status, ids = conn.search(None, '(FROM "Agnes")')
if ids[0]:
    for msg_id in ids[0].split()[-3:]:
        status, data = conn.fetch(msg_id, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                ct = part.get_content_type()
                payload = part.get_payload(decode=True)
                if payload:
                    text = payload.decode("utf-8", errors="ignore")
                    if ct == "text/plain":
                        body += text
                    elif ct == "text/html" and not body:
                        body += strip_html(text)
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                raw = payload.decode("utf-8", errors="ignore")
                body = strip_html(raw) if msg.get_content_type() == "text/html" else raw
        code = extract_verification_code(body)
        print(f"  {msg['Subject']} -> code: {code}")

conn.logout()
