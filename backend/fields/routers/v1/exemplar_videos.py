from fastapi import APIRouter, HTTPException

from fields.db import prisma_client
from fields.domain.subjects.schema import ExemplarVideo

router = APIRouter(
    prefix="/exemplar-videos",
    tags=["exemplar-videos"],
)


@router.get("")
async def get_exemplar_video_list() -> list[ExemplarVideo]:
    videos = await prisma_client.exemplarvideo.find_many(include={"subject": True})

    return [ExemplarVideo.from_prisma_model(v) for v in videos if v.subject is not None]


@router.get("/{exemlar_video_id}")
async def get_exemplar_video(exemlar_video_id: str) -> ExemplarVideo:
    v = await prisma_client.exemplarvideo.find_unique(
        where={"id": exemlar_video_id},
        include={
            "subject": True,
            "segments": {"order_by": {"begin_sec": "asc"}},
        },
    )
    if v is None:
        raise HTTPException(404)

    return ExemplarVideo.from_prisma_model(v)
