import sys
from typing import Literal

import fire

from proficiv.server import api
from proficiv.utils.openapi import write_oapi_json

AVAILABLE_VERSIONS = ["v1"]


def gen_oapi(
    *,
    only_version: Literal["v1"] | None = None,
    out: str | None = None,
    indent: int | str | None = None,
) -> None:
    path_prefix: str | None = None

    if only_version is not None:
        assert only_version in AVAILABLE_VERSIONS
        path_prefix = f"/api/{only_version}"

    if out is None:
        write_oapi_json(api, sys.stdout, filter_path_prefix=path_prefix, indent=indent)
        return

    with open(out, "w") as f:
        write_oapi_json(api, f, filter_path_prefix=path_prefix, indent=indent)

    print(f"[OK] Wrote to '{out}'")


if __name__ == "__main__":
    fire.Fire(gen_oapi)
