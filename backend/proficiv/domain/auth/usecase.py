from datetime import timedelta

import jose.jwt
from fastapi import HTTPException, Request
from pydantic import BaseModel
from starlette.status import HTTP_401_UNAUTHORIZED

from prisma import models
from proficiv.config import Config
from proficiv.entity import UserID
from proficiv.utils.datetime import jst_now
from proficiv.utils.logging import get_colored_logger

_log = get_colored_logger(__name__)


class AuthUser(BaseModel):
    user_id: UserID
    username: str


def extract_auth_user_or_none(req: Request, cfg: Config) -> AuthUser | None:
    a = req.headers.get("Authorization")
    if a is None or not a.startswith("Bearer "):
        return None

    token = a.removeprefix("Bearer ")
    try:
        payload = jose.jwt.decode(
            token, key=cfg.jwt_secret_key, algorithms=[cfg.jwt_algo]
        )
    except jose.JWTError as e:
        _log.warn(e)
        return None

    _log.info(f"Parsed jwt payload: {payload}")

    if "user_id" not in payload or "username" not in payload:
        _log.warn("Missing field in jwt payload")
        return None

    return AuthUser(user_id=UserID(payload["user_id"]), username=payload["username"])


def extract_auth_user_or_401(req: Request, cfg: Config) -> AuthUser:
    user = extract_auth_user_or_none(req, cfg)
    if user is None:
        raise HTTPException(
            HTTP_401_UNAUTHORIZED, detail="Could not validate Authorization JWT token"
        )

    return user


def issue_access_token(
    user: models.User, exp_delta: timedelta, *, secret_key: str, jwt_algo: str
) -> str:
    now = jst_now()
    payload = {
        "user_id": user.id,
        "username": user.username,
        "iat": now,
        "exp": now + exp_delta,
    }
    return jose.jwt.encode(payload, key=secret_key, algorithm=jwt_algo)
