import stringcase
from pydantic import BaseModel


class CamelizedPydanticModel(BaseModel):
    class Config:
        populate_by_name = True
        alias_generator = stringcase.camelcase
