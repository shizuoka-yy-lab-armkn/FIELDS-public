from fastapi import APIRouter

from fields.db import prisma_client
from fields.depes import UserDep
from fields.domain.users.schema import User

router = APIRouter(
    prefix="/users",
    tags=["users"],
)


@router.get("")
async def get_user_list() -> list[User]:
    users = await prisma_client.user.find_many()
    return [User(username=u.username) for u in users]


@router.get("/me")
async def get_me(user: UserDep) -> User:
    u = await prisma_client.user.find_unique_or_raise({"id": user.user_id})
    return User(username=u.username)
