import json
import datetime

import httpx
from fastapi import APIRouter, Request, Response

from app.config import settings
from app.proxy.balancer import KeyBalancer
from app.token_manager import TokenManager

router = APIRouter()
balancer = KeyBalancer(strategy=settings.key_rotation_strategy)

PROXY_TARGET = settings.generation_api_base.rstrip("/v1")
VIDEO_QUERY_TARGET = settings.video_query_base

RATE_LIMIT_COOLDOWN = 60
MAX_RETRIES = 10


async def forward_request(
    path: str,
    method: str,
    headers: dict,
    body: bytes | None,
    target_base: str,
) -> Response:
    for _ in range(MAX_RETRIES):
        key = await balancer.get_key()
        if not key:
            available = await balancer.get_all_available()
            if available:
                return Response(
                    content=json.dumps({"error": "no available api keys", "code": 503}),
                    status_code=503,
                    media_type="application/json",
                )
            return Response(
                content=json.dumps({"error": "all keys are rate limited, try later", "code": 429}),
                status_code=429,
                media_type="application/json",
            )

        proxy_headers = {
            "Authorization": f"Bearer {key.key_value}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient(timeout=settings.proxy_timeout_seconds) as client:
            try:
                resp = await client.request(
                    method=method,
                    url=f"{target_base}{path}",
                    headers=proxy_headers,
                    content=body,
                )
            except httpx.TimeoutException:
                await balancer.mark_rate_limited(key.id, 30)
                await balancer.mark_failed(key.id)
                continue
            except httpx.ConnectError:
                await balancer.mark_rate_limited(key.id, 120)
                await balancer.mark_failed(key.id)
                continue

        if resp.status_code == 429:
            await balancer.mark_rate_limited(key.id, RATE_LIMIT_COOLDOWN)
            await balancer.mark_failed(key.id)
            continue

        if 200 <= resp.status_code < 300:
            await balancer.mark_success(key.id)
            await TokenManager.update_key_used(key.id)
        else:
            await balancer.mark_failed(key.id)

        return Response(
            content=resp.content,
            status_code=resp.status_code,
            media_type=resp.headers.get("content-type", "application/json"),
        )

    return Response(
        content=json.dumps({"error": "all keys exhausted", "code": 429}),
        status_code=429,
        media_type="application/json",
    )


@router.api_route("/v1/images/generations", methods=["POST"])
async def proxy_image_generation(request: Request):
    body = await request.body()
    return await forward_request(
        path="/v1/images/generations",
        method="POST",
        headers=dict(request.headers),
        body=body,
        target_base=PROXY_TARGET,
    )


@router.api_route("/v1/videos", methods=["POST"])
async def proxy_video_create(request: Request):
    body = await request.body()
    return await forward_request(
        path="/v1/videos",
        method="POST",
        headers=dict(request.headers),
        body=body,
        target_base=PROXY_TARGET,
    )


@router.api_route("/v1/videos/{task_id}", methods=["GET"])
async def proxy_video_status(request: Request):
    return await forward_request(
        path=request.url.path,
        method="GET",
        headers=dict(request.headers),
        body=None,
        target_base=PROXY_TARGET,
    )


@router.api_route("/agnesapi", methods=["GET"])
async def proxy_video_query(request: Request):
    return await forward_request(
        path=f"/agnesapi?{request.url.query}",
        method="GET",
        headers=dict(request.headers),
        body=None,
        target_base=VIDEO_QUERY_TARGET,
    )
