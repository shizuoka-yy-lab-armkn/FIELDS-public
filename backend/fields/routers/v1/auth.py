from datetime import timedelta

from fastapi import APIRouter, HTTPException
from starlette.status import HTTP_401_UNAUTHORIZED

from fields.db import prisma_client
from fields.depes import ConfigDep
from fields.domain.auth.schema import LoginReq, Token
from fields.domain.auth.usecase import issue_access_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post("/token")
async def login(payload: LoginReq, cfg: ConfigDep) -> Token:
    user = await prisma_client.user.find_unique(
        where={"username": payload.username},
    )
    if user is None:
        raise HTTPException(
            HTTP_401_UNAUTHORIZED, detail=f"No such username: {payload.username}"
        )

    expiration = timedelta(minutes=cfg.jwt_expire_minutes)
    access_token = issue_access_token(
        user, expiration, secret_key=cfg.jwt_secret_key, jwt_algo=cfg.jwt_algo
    )

    return Token(access_token=access_token)
