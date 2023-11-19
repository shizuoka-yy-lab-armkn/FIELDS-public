from typing import Annotated

from fastapi import Depends, Request, Security
from redis import Redis

from proficiv.config import Config, get_config
from proficiv.domain.auth.usecase import AuthUser, extract_auth_user_or_401
from proficiv.kvs import get_redis_client

ConfigDep = Annotated[Config, Depends(get_config)]


# インポートサイクルを回避するためにここで定義している
def _get_auth_user_or_401(req: Request, cfg: ConfigDep) -> AuthUser:
    return extract_auth_user_or_401(req, cfg)


UserDep = Annotated[AuthUser, Security(_get_auth_user_or_401)]


def _get_redis(cfg: ConfigDep) -> Redis:
    return get_redis_client(cfg.redis_host, cfg.redis_port, cfg.redis_db)


RedisDep = Annotated[Redis, Depends(_get_redis)]
