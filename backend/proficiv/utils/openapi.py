import json
from typing import IO

import stringcase
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.routing import APIRoute


def configure_operation_id(api: FastAPI) -> None:
    for r in api.routes:
        if isinstance(r, APIRoute):
            r.operation_id = stringcase.camelcase(r.name)


def write_oapi_json(
    api: FastAPI,
    dst: IO,
    *,
    filter_path_prefix: str | None = None,
    indent: int | str | None = None,
) -> None:
    routes = api.routes

    if filter_path_prefix is not None:
        routes = [
            r
            for r in routes
            if isinstance(r, APIRoute) and r.path.startswith(filter_path_prefix)
        ]

    json.dump(
        get_openapi(
            title=api.title,
            version=api.version,
            openapi_version=api.openapi_version,
            description=api.description,
            routes=routes,
        ),
        dst,
        indent=indent,
    )
