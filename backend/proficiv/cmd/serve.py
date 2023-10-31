import fire
import uvicorn

from proficiv.utils.fs import PKG_ROOT


def serve(
    *,
    host: str = "127.0.0.1",
    port: int = 8000,
    reload: bool = False,
    workers: int | None = None,
) -> None:
    """HTTP サーバを起動する"""

    uvicorn.run(
        "proficiv.server:api",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=[str(PKG_ROOT)],
        reload_includes=["*.py"],
        workers=workers,
    )


if __name__ == "__main__":
    fire.Fire(serve)
