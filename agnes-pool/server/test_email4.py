import imaplib, email, re

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

status, ids = conn.search(None, '(FROM "Agnes")')

def strip_html(html):
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

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
    # Find all 6-digit numbers
    print("All 6-digit numbers:", re.findall(r"\b(\d{6})\b", body))
    # Find code after "verification code"
    m = re.search(r"verification code[:\s]*(\d{4,8})", body, re.IGNORECASE)
    if m:
        print(f"Code after 'verification code': {m.group(1)}")
    # Print part around verification code
    idx = body.lower().find("verification code")
    if idx >= 0:
        print(f"Context: ...{body[idx:idx+80]}...")

conn.logout()
