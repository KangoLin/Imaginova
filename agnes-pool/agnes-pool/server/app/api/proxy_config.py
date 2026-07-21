from pydantic import BaseModel

from fastapi import APIRouter

from app.proxy.router import balancer as proxy_balancer
from app.health_checker import checker as health_checker
from app.state import proxy_pool

router = APIRouter(prefix="/api/proxy", tags=["proxy"])


class ProxyAddRequest(BaseModel):
    proxy_url: str


@router.get("/pool")
async def get_proxy_pool():
    return {"proxies": proxy_pool._proxies, "count": proxy_pool.count}


@router.post("/pool/add")
async def add_proxy(req: ProxyAddRequest):
    proxy_pool.add_proxy(req.proxy_url)
    return {"success": True, "count": proxy_pool.count}


@router.post("/pool/clear")
async def clear_proxy_pool():
    proxy_pool.clear()
    return {"success": True, "count": 0}


@router.get("/stats")
async def proxy_stats():
    return proxy_balancer.get_stats()


@router.post("/refresh")
async def refresh_keys():
    await proxy_balancer.refresh_keys()
    return {"success": True, "message": "keys refreshed"}


@router.get("/health-check")
async def get_health_check():
    return {
        "results": health_checker.get_results(),
        "interval_seconds": 300,
    }


@router.post("/health-check/run")
async def run_health_check():
    await health_checker.run_check()
    return {"success": True, "results": health_checker.get_results()}
