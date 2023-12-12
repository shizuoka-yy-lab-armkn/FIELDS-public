from fields.base.schema import CamelizedPydanticModel


class User(CamelizedPydanticModel):
    username: str
