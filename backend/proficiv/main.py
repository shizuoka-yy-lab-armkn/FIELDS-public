from pathlib import Path

import fire
import uvicorn
from fastapi import FastAPI

from proficiv.routers import router

api = FastAPI(
    title="Proficiv API",
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


if __name__ == "__main__":
    fire.Fire(
        {
            "serve": serve,
            "routes": routes,
        }
    )
