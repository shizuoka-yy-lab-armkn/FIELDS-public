from fastapi import APIRouter

from . import debug, records, subjects

router = APIRouter(
    prefix="/v1",
)

router.include_router(debug.router)
router.include_router(records.router)
router.include_router(subjects.router)
