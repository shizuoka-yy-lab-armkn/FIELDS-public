import functools
import os
from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict


def get_activated_env_path() -> str:
    """環境変数で設定された env ファイルへのパスを取得する。
    環境変数が設定されていない場合はフォールバック値として ".env" を返す。
    """
    return os.getenv("PROFICIV_ENV_FILE", ".env")


class Config(BaseSettings):
    """
    env ファイルを読み込んだ後に環境変数を読み込む。
    env ファイルが存在しなくても環境変数が適切にセットされていればエラーにならない。
    参考: https://docs.pydantic.dev/latest/concepts/pydantic_settings/#dotenv-env-support
    """

    @staticmethod
    def from_envfile(path: str | Path) -> "Config":
        """指定した env file を読み込んだ後で環境変数も読み込む"""
        return Config(_env_file=str(path))  # type: ignore

    # meta config
    model_config = SettingsConfigDict(env_prefix="PROFICIV_")

    debug: bool

    public_static_dir: Path
    private_static_dir: Path
    static_base_url: str

    rtmp_port: int

    # ffmpeg での RTMPストリーム保存をせずに，既存の適当な動画ファイルを保存する
    mock_recording: bool = False
    mock_record_video_path: Path = Path("static/dummy.mp4")

    # 機械学習モデルの行動分節を実行せずに，適当な分節を実施する．
    mock_action_segmentation: bool = False

    redis_host: str
    redis_port: int
    redis_db: int = 0

    # to get a string like this run:
    # openssl rand -hex 32
    jwt_secret_key: str
    jwt_algo: str = "HS256"
    jwt_expire_minutes: int = 60


@functools.cache
def get_config() -> Config:
    return Config.from_envfile(get_activated_env_path())
