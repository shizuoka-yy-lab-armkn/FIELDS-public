import fire

from proficiv.server import api


def routes() -> None:
    """API のエンドポイントを列挙する"""
    for r in api.routes:
        print(r)


if __name__ == "__main__":
    fire.Fire(routes)
