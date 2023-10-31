from pathlib import Path

PKG_ROOT = Path(__file__).parent.parent
"""パッケージのトップディレクトリ (proficiv/) への絶対パス"""


PYPROJECT_ROOT = PKG_ROOT.parent
"""pyproject.toml があるディレクトリへの絶対パス"""


assert (PYPROJECT_ROOT / "pyproject.toml").is_file()
