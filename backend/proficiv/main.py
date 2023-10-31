import json
import sys
from pathlib import Path
from typing import IO

import fire
import uvicorn
from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi

from proficiv.routers import router

api = FastAPI(
    title="Proficiv Backend API",
)
api.include_router(router)


def serve(
    *,
    host: str = "127.0.0.1",
    port: int = 8000,
    reload: bool = False,
    workers: int | None = None,
) -> None:
    """HTTP サーバを起動する"""
    package_root = Path(__file__).parent
    assert package_root.name == "proficiv"

    uvicorn.run(
        "proficiv.main:api",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=[str(package_root)],
        reload_includes=["*.py"],
        workers=workers,
    )


def routes() -> None:
    """API のエンドポイントを列挙する"""
    for r in api.routes:
        print(r)


def _write_oapi_json(dst: IO, *, indent: int | str | None = None) -> None:
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


def gen_openapi(*, out: str | None = None, indent: int | str | None = None) -> None:
    if out is None:
        _write_oapi_json(sys.stdout, indent=indent)
        return

    with open(out, "w") as f:
        _write_oapi_json(f, indent=indent)

    print(f"Wrote to {out}")


if __name__ == "__main__":
    fire.Fire(
        {
            "serve": serve,
            "routes": routes,
            "gen-openapi": gen_openapi,
        }
    )
