from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_403_FORBIDDEN

from fields.config import Config
from fields.depes import ConfigDep
from fields.domain.debug.schema import PingResponse
from fields.utils.datetime import jst_now

router = APIRouter(
    prefix="/debug",
    tags=["debug"],
)


@router.get(
    "/ping",
    summary="疎通確認API",
)
def ping() -> PingResponse:
    now = jst_now()
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
def retrieve_config(cfg: ConfigDep) -> Config:
    if not cfg.debug:
        raise HTTPException(HTTP_403_FORBIDDEN)

    return cfg
