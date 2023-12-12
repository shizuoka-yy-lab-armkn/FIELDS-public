import csv
from pprint import pprint

import fire

from fields.utils.fs import PYPROJECT_ROOT
from prisma import Prisma, models

SUBJCT_SLUG = "bike_frame_2023"
SUBJECT_NAME = "バイク外装取り付け2023"


async def _upsert_subject(db: Prisma) -> models.Subject:
    return await db.subject.upsert(
        data={
            "create": {
                "slug": SUBJCT_SLUG,
                "name": SUBJECT_NAME,
            },
            "update": {
                "name": SUBJECT_NAME,
            },
        },
        where={"slug": SUBJCT_SLUG},
    )


async def _upsert_actions(db: Prisma, subject_id: str) -> None:
    master_durs_csv = PYPROJECT_ROOT / "db_seed" / "action" / "master_durs.csv"
    name_tsv = PYPROJECT_ROOT / "db_seed" / "action" / "names.tsv"

    with open(master_durs_csv) as f_durs_csv, open(name_tsv) as f_names_tsv:
        f_durs_csv.readline()  # discard header
        f_names_tsv.readline()  # discard header

        for durs_line, names_line in zip(
            csv.reader(f_durs_csv), csv.reader(f_names_tsv, delimiter="\t")
        ):
            aid1, count, mean, std, dur_min, p25, p50, p75, dur_max = durs_line
            aid2, short_name, long_name = names_line
            del count, p25, p75
            assert aid1 == aid2, f"Differ: {aid1=}, {aid2=}"

            seq = int(aid1)
            mean, std, dur_min, median, dur_max = map(
                float, (mean, std, dur_min, p50, dur_max)
            )
            short_name = short_name.strip()
            long_name = long_name.strip()

            await db.action.upsert(
                where={"subject_id_seq": {"subject_id": subject_id, "seq": seq}},
                data={
                    "create": {
                        "subject_id": subject_id,
                        "seq": seq,
                        "short_name": short_name,
                        "long_name": long_name,
                        "master_dur_std": std,
                        "master_dur_mean": mean,
                        "master_dur_min": dur_min,
                        "master_dur_max": dur_max,
                        "master_dur_median": median,
                    },
                    "update": {
                        "short_name": short_name,
                        "long_name": long_name,
                        "master_dur_std": std,
                        "master_dur_mean": mean,
                        "master_dur_min": dur_min,
                        "master_dur_max": dur_max,
                        "master_dur_median": median,
                    },
                },
            )

    pass


async def _print_actions_briefly(db: Prisma, subject_id: str) -> list[models.Action]:
    actions = await db.action.find_many(
        where={"subject_id": subject_id}, order={"seq": "asc"}
    )
    pprint(
        [
            {
                "id": a.id,
                "seq": a.seq,
                "short_name": a.short_name,
                "long_name": a.long_name,
            }
            for a in actions
        ],
        compact=True,
    )
    return actions


async def main() -> None:
    async with Prisma() as db:
        print(f"{SUBJCT_SLUG=}")
        print(f"{SUBJECT_NAME=}")

        print("Currently stored subjects:")
        pprint(await db.subject.find_many())

        subj = await _upsert_subject(db)

        print("Upserted subject:")
        all_subjects = await db.subject.find_many()
        pprint(all_subjects)

        print("Currently stored actions related to the subject:")
        await _print_actions_briefly(db, subj.id)

        await _upsert_actions(db, subj.id)

        print("Upserted actions:")
        await _print_actions_briefly(db, subj.id)

        print(f"{len(all_subjects)=}")


if __name__ == "__main__":
    fire.Fire(main)
