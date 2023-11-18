from typing import Annotated

from fastapi import Depends, Request

from proficiv.config import Config, get_config
from proficiv.domain.auth.usecase import AuthUser, extract_auth_user_or_401

ConfigDep = Annotated[Config, Depends(get_config)]


# インポートサイクルを回避するためにここで定義している
def _get_auth_user_or_401(req: Request, cfg: ConfigDep) -> AuthUser:
    return extract_auth_user_or_401(req, cfg)


UserDep = Annotated[AuthUser, Depends(_get_auth_user_or_401)]
