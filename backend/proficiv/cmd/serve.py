import fire
import uvicorn

from proficiv.config import get_config
from proficiv.utils.fs import PKG_ROOT


def serve(
    *,
    host: str = "0.0.0.0",
    port: int = 8000,
    reload: bool = False,
    workers: int | None = None,
) -> None:
    """HTTP サーバを起動する"""
    cfg = get_config()
    if cfg.mock_recording and not cfg.mock_record_video_path.is_file():
        print(f"File not found: {cfg.mock_record_video_path=}")
        exit(1)

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
