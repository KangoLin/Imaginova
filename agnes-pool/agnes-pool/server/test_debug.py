import imaplib, email

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")
conn.select("INBOX")

# List all unseen messages
status, ids = conn.search(None, "UNSEEN")
print(f"UNSEEN messages: {len(ids[0].split()) if ids[0] else 0}")

if ids[0]:
    for msg_id in ids[0].split()[-5:]:
        status, data = conn.fetch(msg_id, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        print(f"  From: {msg['From']}")
        print(f"  Subject: {msg['Subject']}")
        print(f"  Date: {msg['Date']}")
        print("  ---")

# Also check for Agnes in ALL (not just unseen)
print("\nAll Agnes messages:")
status, ids = conn.search(None, '(FROM "Agnes")')
if ids[0]:
    for msg_id in ids[0].split()[-3:]:
        status, data = conn.fetch(msg_id, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        print(f"  From: {msg['From']}")
        print(f"  Subject: {msg['Subject']}")
        print(f"  Date: {msg['Date']}")
        seen_flag = 'Seen' if '\\Seen' in str(data) else 'UNSEEN'
    print(f"  Seen: {seen_flag}")

# Check if there are new messages from any sender
print("\nAll UNSEEN with senders:")
status, ids = conn.search(None, "UNSEEN")
if ids[0]:
    for msg_id in ids[0].split()[-5:]:
        status, data = conn.fetch(msg_id, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        print(f"  From: {msg['From']}")

conn.close()
conn.logout()
