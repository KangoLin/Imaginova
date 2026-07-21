import imaplib, email

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

status, ids = conn.search(None, '(FROM "Agnes")')

if ids[0]:
    msg_id = ids[0].split()[-1]
    status, data = conn.fetch(msg_id, "(RFC822)")
    msg = email.message_from_bytes(data[0][1])
    print(f"Subject: {msg['Subject']}")
    print(f"Content-Type: {msg['Content-Type']}")
    print("---BODY---")
    if msg.is_multipart():
        for i, part in enumerate(msg.walk()):
            ct = part.get_content_type()
            print(f"[Part {i}] Content-Type: {ct}")
            payload = part.get_payload(decode=True)
            if payload:
                text = payload.decode("utf-8", errors="ignore")
                print(text[:500])
                print("---")
    else:
        payload = msg.get_payload(decode=True)
        if payload:
            print(payload.decode("utf-8", errors="ignore")[:500])

conn.logout()
