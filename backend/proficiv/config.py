import os
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def get_activated_env_path(fallback: str = ".env") -> str:
    """環境変数で設定された env ファイルへのパスを取得する。
    環境変数が設定されていない場合は fallback を返す。
    """
    return os.getenv("PROFICIV_ENV_FILE", fallback)


class Config(BaseSettings):
    """
    env ファイルを読んだ後に環境変数を読み込む。
    つまり env ファイルよりも環境変数の方が優先度が高い。
    env ファイルが存在しなくても環境変数が適切にセットされていればエラーにならない。
    https://docs.pydantic.dev/latest/concepts/pydantic_settings/#dotenv-env-support
    """

    # meta config
    model_config = SettingsConfigDict(
        env_prefix="PROFICIV_",
        env_file=get_activated_env_path(),
    )

    video_dir: Path = Field(description="動画ファイルを保存しているディレクトリへのパス")


cfg = Config()  # type: ignore
