from typing import Annotated

from fastapi import Depends

from proficiv.config import Config, get_config

ConfigDep = Annotated[Config, Depends(get_config)]
