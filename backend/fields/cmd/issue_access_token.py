from datetime import timedelta

import fire

from fields.config import get_config
from fields.domain.auth.usecase import issue_access_token
from fields.utils.logging import get_colored_logger
from prisma import Prisma

_log = get_colored_logger(__name__)


async def main(*, username: str, exp_minutes: int = 180) -> None:
    cfg = get_config()

    _log.info(f"{exp_minutes=}, {cfg.jwt_algo=}")

    async with Prisma() as db:
        user = await db.user.find_unique_or_raise({"username": username})

    access_token = issue_access_token(
        user,
        exp_delta=timedelta(minutes=exp_minutes),
        secret_key=cfg.jwt_secret_key,
        jwt_algo=cfg.jwt_algo,
    )

    print(access_token)


if __name__ == "__main__":
    fire.Fire(main)
