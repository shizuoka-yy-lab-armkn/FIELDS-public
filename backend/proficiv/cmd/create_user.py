import asyncio
import re

import fire

from prisma import Base64, Prisma


async def _main(username: str) -> None:
    async with Prisma() as db:
        user = await db.user.create(
            data={
                "username": username,
                "pw_hash": Base64(b""),
            }
        )

        print(f"[OK] Created user: {user}")
        print(f"  {user.id=}")
        print(f"  {user.username=}")
        print(f"  {user.created_at=}")
        print(f"  {user.updated_at=}")


USERNAME_REGEX = re.compile("^[a-zA-Z0-9_-]+$")


def main(username: str) -> None:
    if USERNAME_REGEX.match(username) is None:
        print("Err: username には半角英数字とハイフンとアンダーバーのみ使用できます")
        exit(1)

    if len(username) > 20:
        print("Err: username が長すぎます")
        exit(1)

    asyncio.run(_main(username))


if __name__ == "__main__":
    fire.Fire(main)
