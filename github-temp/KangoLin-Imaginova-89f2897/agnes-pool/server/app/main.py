import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import init_db
from app.state import init_proxy_pool
from app.health_checker import checker as health_checker
from app.api.accounts import router as accounts_router
from app.api.keys import router as keys_router
from app.api.proxy_config import router as proxy_config_router
from app.proxy.router import router as proxy_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    init_proxy_pool()
    health_checker.start()
    yield


app = FastAPI(title="Agnes Pool", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts_router)
app.include_router(keys_router)
app.include_router(proxy_config_router)
app.include_router(proxy_router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


web_dist = (
    Path(os.environ.get("STATIC_DIR", ""))
    if os.environ.get("STATIC_DIR")
    else Path(__file__).resolve().parent.parent.parent / "web" / "dist"
)
if not web_dist.exists():
    web_dist = Path(__file__).resolve().parent / "static"
if web_dist.exists():
    app.mount("/", StaticFiles(directory=str(web_dist), html=True), name="web")
