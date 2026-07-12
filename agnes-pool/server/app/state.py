from app.config import settings
from app.proxy_pool import ProxyPool


proxy_pool = ProxyPool()


def init_proxy_pool():
    raw = settings.proxy_list
    if raw:
        proxy_pool.load_from_text(raw)

    if proxy_pool.count > 0:
        print(f"Proxy pool initialized with {proxy_pool.count} proxies")
    else:
        print("Proxy pool is empty — registrations will use direct connection")
