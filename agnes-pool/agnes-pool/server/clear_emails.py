import imaplib
import os

os.chdir(os.path.dirname(__file__))

# Load settings manually from .env
from app.config import settings

conn = imaplib.IMAP4_SSL(settings.imap_server, settings.imap_port)
conn.login(settings.imap_user, settings.imap_password)
conn.select("INBOX")

status, ids = conn.search(None, '(UNSEEN FROM "Agnes")')
if status == "OK" and ids[0]:
    msg_ids = ids[0].split()
    print(f"Unread from Agnes: {len(msg_ids)}")
    for mid in msg_ids:
        status2, data2 = conn.fetch(mid, "(BODY.PEEK[HEADER.FIELDS (DATE SUBJECT)])")
        print(f"  [{mid.decode()}] {data2[0][1].decode('utf-8','ignore')[:100].strip()}")
    conn.store(b",".join(msg_ids), "+FLAGS", "\\Seen")
    print("All marked as SEEN")
else:
    print("No unread from Agnes found")

conn.logout()
