from datetime import datetime

from fields.base.schema import CamelizedPydanticModel


class PingResponse(CamelizedPydanticModel):
    message: str
    server_time: datetime
