import csv
import datetime
import re
import typing
from pathlib import Path

import fire

if typing.TYPE_CHECKING:
    from prisma.types import ExemplarVideoSegmentCreateWithoutRelationsInput

from prisma import Prisma


def _parse_timestamp_to_sec(s: str) -> float:
    # parse HH:MM:SS.us
    if ":" in s:
        t = datetime.time.fromisoformat(s)
        return t.hour * 3600 + t.minute * 60 + t.second + (t.microsecond / 1e6)

    # parse seconds
    if "." in s:
        return float(s)

    # parse milliseconds
    return int(s) / 1000


async def main(
    exemplar_video_slug: str,
    subject_slug: str,
    fps: float,
    elan_annotation_file: str | Path,
    *,
    seg_begin_col: int,
    seg_end_col: int,
) -> None:
    """お手本動画の情報をDBに登録or更新する。

    elan_annotation_fileの例:
    default         00:00:24.700    24.7    00:00:25.890    25.89   5
    default         00:00:25.890    25.89   00:00:30.910    30.91   6
    default         00:00:30.910    30.91   00:00:35.260    35.26   7

    (↑ 左列から順に,
        "default"(特に気にする必要はなし),
        開始時刻ISO形式,
        開始時刻秒形式,
        終了時刻ISO形式,
        終了時刻秒形式,
        工程番号)

    本スクリプトはISO形式にも秒形式にも対応している。
    ※ ELANのエクスポート時のオプションで、ISO形式のみや秒形式のみを表示することも可能

    つまり上記の例のような列順の場合、実行時のフラグは
    --seg_begin_col=1 --seg_end_col=3 も
    --seg_begin_col=1 --seg_end_col=4 も
    --seg_begin_col=2 --seg_end_col=3 も
    --seg_begin_col=2 --seg_end_col=4 も全てOK。
    """
    elan_annotation_file = Path(elan_annotation_file)
    assert elan_annotation_file.exists()

    assert 3 <= len(exemplar_video_slug) <= 80
    assert re.match(r"^[A-Za-z0-9_-]+", exemplar_video_slug)

    prisma = Prisma()
    await prisma.connect()

    subj = await prisma.subject.find_unique(
        where={"slug": subject_slug},
        include={"actions": {"order_by": {"ord_serial": "asc"}}},
    )
    assert subj is not None, f"No such subject of {subject_slug=}"
    assert subj.actions is not None
    print(f"{subj.name=}, {subj.id=}, {len(subj.actions)=}")

    displayno_to_action = {a.display_no: a for a in subj.actions}

    async with prisma.tx() as tx:
        ev = await tx.exemplarvideo.upsert(
            where={
                "subject_id_slug": {"subject_id": subj.id, "slug": exemplar_video_slug}
            },
            data={
                "create": {
                    "slug": exemplar_video_slug,
                    "fps": fps,
                    "subject_id": subj.id,
                },
                "update": {"fps": fps},
            },
        )

        await tx.exemplarvideosegment.delete_many(
            where={"exemplar_video_id": ev.id},
        )

        data: list[ExemplarVideoSegmentCreateWithoutRelationsInput] = []

        with open(elan_annotation_file) as file:
            for row in csv.reader(file, delimiter="\t"):
                begin_sec = _parse_timestamp_to_sec(row[seg_begin_col])
                end_sec = _parse_timestamp_to_sec(row[seg_end_col])
                opstep = int(row[-1])
                print(f"{opstep=:2},  {begin_sec=:7.3f},  {end_sec=:7.3f}")

                data.append(
                    {
                        "exemplar_video_id": ev.id,
                        "opstep_id": displayno_to_action[opstep].id,
                        "begin_sec": begin_sec,
                        "end_sec": end_sec,
                    }
                )

            await tx.exemplarvideosegment.create_many(data=data)

    await prisma.disconnect()


if __name__ == "__main__":
    fire.Fire(main)
