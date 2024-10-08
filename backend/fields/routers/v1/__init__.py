from fastapi import APIRouter

from . import auth, debug, exemplar_videos, recording, records, subjects, users

router = APIRouter(
    prefix="/v1",
)

router.include_router(auth.router)
router.include_router(debug.router)
router.include_router(exemplar_videos.router)
router.include_router(recording.router)
router.include_router(records.router)
router.include_router(subjects.router)
router.include_router(users.router)
