from typing import TYPE_CHECKING

import fire

from fields.config import get_config

if TYPE_CHECKING:
    from fields.domain.record_eval.worker_base import RecordEvalWorkerBase


def main() -> None:
    cfg = get_config()

    worker: RecordEvalWorkerBase

    if cfg.mock_record_eval_worker:
        from fields.domain.record_eval.worker_mock import RecordEvalMockWorker

        worker = RecordEvalMockWorker(cfg)
    else:
        from fields.domain.record_eval.worker_impl import RecordEvalWorker

        worker = RecordEvalWorker(cfg)

    worker.loop()


if __name__ == "__main__":
    fire.Fire(main)
