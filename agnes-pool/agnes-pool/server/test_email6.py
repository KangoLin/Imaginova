import imaplib, email, re

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

def strip_html(html):
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def find_codes(text):
    return re.findall(r"(?:verification code)[:\s]*(\d{4,8})", text, re.IGNORECASE)

status, ids = conn.search(None, '(FROM "Agnes")')
if ids[0]:
    msg_id = ids[0].split()[-1]
    status, data = conn.fetch(msg_id, "(RFC822)")
    msg = email.message_from_bytes(data[0][1])
    body = ""
    if msg.is_multipart():
        for part in msg.walk():
            ct = part.get_content_type()
            payload = part.get_payload(decode=True)
            if payload:
                text = payload.decode("utf-8", errors="ignore")
                if ct == "text/html" and not body:
                    body += strip_html(text)
    
    idx = body.lower().find("verification code")
    if idx >= 0:
        before = body[idx-30:idx]
        after = body[idx:idx+100]
        print("BEFORE:", repr(before))
        print("AFTER:", repr(after))
        print("CODES:", find_codes(after))
    
    m = re.search(r"verification code.{0,20}(\d{4,8})", body, re.IGNORECASE)
    if m:
        print("MATCH:", repr(m.group(0)), "-> code:", m.group(1))

conn.logout()
