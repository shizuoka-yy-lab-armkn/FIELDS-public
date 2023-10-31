import csv
import tomllib

from proficiv.config import Config
from proficiv.entity import ActionID, SubjectID

from .schema import IActionMeta, IExemplarAction, ISubjectDetail

# TODO: split to repository layer


def get_subject_or_none(cfg: Config, id: SubjectID) -> ISubjectDetail | None:
    dir = cfg.fake_db_dir / "subjects" / str(id)

    if not dir.is_dir():
        return None

    with open(dir / "subject.toml", "rb") as f:
        meta = tomllib.load(f)

    subject_name = meta["name"]
    actions: dict[ActionID, IActionMeta] = {}

    with open(dir / "name_mappings.tsv") as f:
        for row in csv.reader(f, delimiter="\t"):
            aid, short_name, long_name = row
            aid = ActionID(int(aid))
            actions[aid] = IActionMeta(short_name=short_name, long_name=long_name)

    exemplar: list[IExemplarAction] = []

    with open(dir / "master_durs.csv") as f:
        f.readline()  # skip header line
        for row in csv.reader(f):
            aid, _count, mean, std, minv, _25, median, _75, maxv = row
            del _count, _25, _75  # unused variable
            item = IExemplarAction(
                action_id=ActionID(int(aid)),
                dur_mean=float(mean),
                dur_std=float(std),
                dur_min=float(minv),
                dur_max=float(maxv),
                dur_median=float(median),
            )
            exemplar.append(item)

    return ISubjectDetail(
        id=id,
        name=subject_name,
        actions=actions,
        exemplar=exemplar,
    )


def get_exemplar_action_sequence(cfg: Config, id: SubjectID) -> list[ActionID] | None:
    dir = cfg.fake_db_dir / "subjects" / str(id)

    if not dir.is_dir():
        return None

    res: list[ActionID] = []

    with open(dir / "master_durs.csv") as f:
        f.readline()  # skip header line
        for row in csv.reader(f):
            aid = int(row[0])
            res.append(ActionID(aid))

    return res
