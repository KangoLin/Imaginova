import re


def extract_verification_code(text: str) -> str | None:
    match = re.search(
        r"(?:验证码|verification code|code)[^:]*?:[\s]*(\d{4,8})",
        text,
        re.IGNORECASE,
    )
    if match:
        return match.group(1)
    match = re.search(r"\b(\d{6})\b", text)
    if match:
        return match.group(1)
    return None


def make_headers(token: str | None = None, lang: str = "zh-CN") -> dict:
    headers = {
        "Content-Type": "application/json",
        "X-User-Language": lang,
        "Origin": "https://platform.agnes-ai.com",
        "Referer": "https://platform.agnes-ai.com/",
    }
    if token:
        headers["Authorization"] = f"Bearer {token}"
    else:
        headers["Authorization"] = "Bearer null"
    return headers
