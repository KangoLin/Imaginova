import imaplib, email

conn = imaplib.IMAP4_SSL("imap.qq.com", 993)
conn.login("2633313990@qq.com", "pevwikagcwigdjfb")

# Check Junk folder
conn.select("Junk")
status, ids = conn.search(None, "ALL")
print(f"Junk folder: {len(ids[0].split()) if ids[0] else 0} emails")
if ids[0]:
    for msg_id in ids[0].split()[-5:]:
        status, data = conn.fetch(msg_id, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        print(f"  From: {msg['From']}")
        print(f"  To: {msg['To']}")
        print(f"  Subject: {msg['Subject']}")
        print("  ---")

# Also check INBOX for any email sent TO imaginova.online domain
conn.select("INBOX")
status, ids = conn.search(None, '(TO "@imaginova.online")')
print(f"\nINBOX to imaginova.online: {len(ids[0].split()) if ids[0] else 0}")

# Also search for the specific recipient
status, ids = conn.search(None, '(TO "agnestest")')
print(f"INBOX to agnestest: {len(ids[0].split()) if ids[0] else 0}")

# Re-check the original Agnes emails - what did they look like?
status, ids = conn.search(None, '(FROM "noreply@agnes")')
print(f"\nAll from noreply@agnes: {len(ids[0].split()) if ids[0] else 0}")
if ids[0]:
    for msg_id in ids[0].split():
        status, data = conn.fetch(msg_id, "(RFC822)")
        msg = email.message_from_bytes(data[0][1])
        print(f"  From: {msg['From']}")
        print(f"  To: {msg['To']}")
        print(f"  Date: {msg['Date']}")

conn.logout()
