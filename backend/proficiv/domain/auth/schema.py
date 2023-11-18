from proficiv.base.schema import CamelizedPydanticModel


class LoginReq(CamelizedPydanticModel):
    username: str


class Token(CamelizedPydanticModel):
    access_token: str
