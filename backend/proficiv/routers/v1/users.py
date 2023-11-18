from fastapi import APIRouter

from proficiv.db import prisma_client
from proficiv.domain.users.schema import User
from proficiv.entity import UserID

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("/")
async def get_user_list() -> list[User]:
    users = await prisma_client.user.find_many()
    return [User(id=UserID(u.id), username=u.username) for u in users]
