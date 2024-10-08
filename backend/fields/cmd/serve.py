import fire
import uvicorn

from fields.config import get_config
from fields.utils.fs import PKG_ROOT


def serve(
    *,
    host: str = "0.0.0.0",
    port: int = 8000,
    reload: bool = False,
    workers: int | None = None,
) -> None:
    """HTTP サーバを起動する"""
    cfg = get_config()
    if cfg.mock_recording and not cfg.mock_record_video_path.exists():
        print(f"File not found: {cfg.mock_record_video_path=}")
        exit(1)
    if not cfg.mock_record_eval_worker and not cfg.pretrained_mstcn_path.exists():
        print(f"File not found: {cfg.pretrained_mstcn_path=}")
        exit(1)
    if (
        cfg.mock_video_feature_extraction
        and not cfg.mock_video_feature_npy_path.exists()
    ):
        print(f"File not found: {cfg.mock_video_feature_npy_path=}")
        exit(1)

    uvicorn.run(
        "fields.server:api",
        host=host,
        port=port,
        reload=reload,
        reload_dirs=[str(PKG_ROOT)],
        reload_includes=["*.py"],
        workers=workers,
    )


if __name__ == "__main__":
    fire.Fire(serve)
