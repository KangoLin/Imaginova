from fastapi import APIRouter, HTTPException

from app.schemas import ApiKeyImport, ApiKeyOut
from app.token_manager import TokenManager

router = APIRouter(prefix="/api/keys", tags=["keys"])


@router.get("/", response_model=list[ApiKeyOut])
async def list_keys():
    keys = await TokenManager.list_api_keys()
    return [
        ApiKeyOut(
            id=k.id,
            account_id=k.account_id,
            name=k.name,
            key_preview=k.key_preview,
            key_profile=k.key_profile,
            is_active=k.is_active,
            last_used_at=k.last_used_at,
            created_at=k.created_at,
        )
        for k in keys
    ]


@router.post("/import", response_model=ApiKeyOut)
async def import_key(req: ApiKeyImport):
    api_key = await TokenManager.save_api_key(
        account_id=req.account_id,
        platform_key_id=req.platform_key_id or 0,
        name=req.name,
        key_value=req.key_value,
    )
    return ApiKeyOut(
        id=api_key.id,
        account_id=api_key.account_id,
        name=api_key.name,
        key_preview=api_key.key_preview,
        key_profile=api_key.key_profile,
        is_active=api_key.is_active,
        last_used_at=api_key.last_used_at,
        created_at=api_key.created_at,
    )


@router.patch("/{key_id}/toggle")
async def toggle_key(key_id: int, active: bool):
    ok = await TokenManager.toggle_key(key_id, active)
    if not ok:
        raise HTTPException(status_code=404, detail="key not found")
    return {"success": True, "message": f"key {'enabled' if active else 'disabled'}"}


@router.delete("/{key_id}")
async def delete_key(key_id: int):
    ok = await TokenManager.delete_key(key_id)
    if not ok:
        raise HTTPException(status_code=404, detail="key not found")
    return {"success": True, "message": "key deleted"}
