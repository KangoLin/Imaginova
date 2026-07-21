import imaplib, email, re

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

status, ids = conn.search(None, '(FROM "Agnes")')

def strip_html(html):
    text = re.sub(r"<[^>]+>", " ", html)
    text = re.sub(r"\s+", " ", text)
    return text.strip()

def extract_code(text):
    match = re.search(r"\b(\d{6})\b", text)
    if match:
        return match.group(1)
    match = re.search(r"(?:verification code)[:\s]*(\d{4,8})", text, re.IGNORECASE)
    if match:
        return match.group(1)
    return None

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
        code = extract_code(body)
        print(f"  [{msg['Date']}] {msg['Subject']} -> code: {code}")

conn.logout()
