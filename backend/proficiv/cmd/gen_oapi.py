import sys

import fire

from proficiv.server import api
from proficiv.utils.openapi import write_oapi_json


def gen_oapi(*, out: str | None = None, indent: int | str | None = None) -> None:
    if out is None:
        write_oapi_json(api, sys.stdout, indent=indent)
        return

    with open(out, "w") as f:
        write_oapi_json(api, f, indent=indent)

    print(f"[OK] Wrote to '{out}'")


if __name__ == "__main__":
    fire.Fire(gen_oapi)
