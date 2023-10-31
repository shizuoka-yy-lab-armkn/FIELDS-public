from datetime import datetime

from proficiv.base.schema import CamelizedPydanticModel


class PingResponse(CamelizedPydanticModel):
    message: str
    server_time: datetime
