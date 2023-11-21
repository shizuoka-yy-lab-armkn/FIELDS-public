import fire

from proficiv.config import get_config
from proficiv.domain.record_eval.mock_worker import RecordEvalMockWorker
from proficiv.domain.record_eval.worker import IRecordEvalWorker, RecordEvalWorker


def main() -> None:
    worker: IRecordEvalWorker
    cfg = get_config()
    if cfg.mock_record_eval_worker:
        worker = RecordEvalMockWorker(cfg)
    else:
        worker = RecordEvalWorker(cfg)

    worker.loop()


if __name__ == "__main__":
    fire.Fire(main)
