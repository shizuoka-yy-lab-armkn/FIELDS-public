from fastapi import FastAPI

from proficiv.routers import router

api = FastAPI(
    title="Proficiv Backend API",
)
api.include_router(router)
