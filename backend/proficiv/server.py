from fastapi import FastAPI

from proficiv.routers import router
from proficiv.utils.openapi import configure_operation_id

api = FastAPI(
    title="Proficiv Backend API",
    swagger_ui_parameters={
        "displayRequestDuration": True,
        "displayOperationId": True,
        "filter": True,
    },
)
api.include_router(router)
configure_operation_id(api)
