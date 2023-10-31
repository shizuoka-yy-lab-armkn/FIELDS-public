import json
from typing import IO

from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi


def write_oapi_json(api: FastAPI, dst: IO, *, indent: int | str | None = None) -> None:
    json.dump(
        get_openapi(
            title=api.title,
            version=api.version,
            openapi_version=api.openapi_version,
            description=api.description,
            routes=api.routes,
        ),
        dst,
        indent=indent,
    )
