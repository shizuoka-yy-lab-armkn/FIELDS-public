from contextlib import asynccontextmanager
from typing import Any, AsyncGenerator

from fastapi import FastAPI

from proficiv.db import prisma_client
from proficiv.routers import router
from proficiv.utils.openapi import configure_operation_id


@asynccontextmanager
async def _lifespan(_: FastAPI) -> AsyncGenerator[None, Any]:
    await prisma_client.connect()
    yield
    await prisma_client.disconnect()


api = FastAPI(
    title="Proficiv Backend API",
    lifespan=_lifespan,
    swagger_ui_parameters={
        "displayRequestDuration": True,
        "displayOperationId": True,
        "filter": True,
    },
)
api.include_router(router)
configure_operation_id(api)
