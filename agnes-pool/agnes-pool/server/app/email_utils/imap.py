import imaplib
import email
import re
from email.message import Message

from app.platforms.agnesai.helpers import extract_verification_code


class IMAPReader:
    def __init__(
        self,
        server: str,
        port: int = 993,
        user: str = "",
        password: str = "",
        mailbox: str = "INBOX",
    ):
        self.server = server
        self.port = port
        self.user = user
        self.password = password
        self.mailbox = mailbox
        self._conn: imaplib.IMAP4_SSL | None = None

    async def connect(self):
        self._conn = imaplib.IMAP4_SSL(self.server, self.port)
        self._conn.login(self.user, self.password)
        self._conn.select(self.mailbox)

    @staticmethod
    def _strip_html(html: str) -> str:
        text = re.sub(r"<[^>]+>", " ", html)
        text = re.sub(r"\s+", " ", text)
        return text.strip()

    def _fetch_body(self, msg_id: bytes) -> str:
        if not self._conn:
            raise RuntimeError("not connected")
        status, data = self._conn.fetch(msg_id, "(BODY.PEEK[])")
        if status != "OK":
            return ""
        raw_email = data[0][1]
        msg = email.message_from_bytes(raw_email)

        body = ""
        if msg.is_multipart():
            for part in msg.walk():
                ct = part.get_content_type()
                if ct == "text/plain":
                    payload = part.get_payload(decode=True)
                    if payload:
                        body += payload.decode("utf-8", errors="ignore")
                elif ct == "text/html" and not body:
                    payload = part.get_payload(decode=True)
                    if payload:
                        body += self._strip_html(
                            payload.decode("utf-8", errors="ignore")
                        )
        else:
            payload = msg.get_payload(decode=True)
            if payload:
                raw = payload.decode("utf-8", errors="ignore")
                ct = msg.get_content_type()
                if ct == "text/html":
                    raw = self._strip_html(raw)
                body = raw
        return body

    def get_verification_code(self, sender: str = "", max_attempts: int = 5) -> str | None:
        if not self._conn:
            raise RuntimeError("not connected")
        for _ in range(max_attempts):
            status, ids = self._conn.search(None, f'(UNSEEN FROM "{sender}")')
            if status != "OK" or not ids[0]:
                return None
            for msg_id in reversed(ids[0].split()):
                body = self._fetch_body(msg_id)
                code = extract_verification_code(body)
                if code:
                    self._conn.store(msg_id, "+FLAGS", "\\Seen")
                    return code
        return None

    async def wait_for_code(self, sender: str = "", timeout: int = 120) -> str | None:
        import asyncio
        deadline = asyncio.get_event_loop().time() + timeout
        while asyncio.get_event_loop().time() < deadline:
            code = self.get_verification_code(sender)
            if code:
                return code
            await asyncio.sleep(5)
        return None

    async def close(self):
        if self._conn:
            self._conn.logout()
