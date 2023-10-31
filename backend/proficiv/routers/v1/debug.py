from datetime import datetime

from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_403_FORBIDDEN

from proficiv.config import Config, cfg
from proficiv.domain.debug.schema import PingResponse

router = APIRouter(
    prefix="/debug",
    tags=["debug"],
)


@router.get(
    "/ping",
    summary="疎通確認API",
)
def ping() -> PingResponse:
    now = datetime.now()
    return PingResponse(
        message="pong",
        server_time=now,
    )


@router.get(
    "/config",
    summary="設定値確認API",
    responses={HTTP_403_FORBIDDEN: {"description": "Not debug mode"}},
    include_in_schema=False,
)
def retrieve_config() -> Config:
    if not cfg.debug:
        raise HTTPException(HTTP_403_FORBIDDEN)

    return cfg
