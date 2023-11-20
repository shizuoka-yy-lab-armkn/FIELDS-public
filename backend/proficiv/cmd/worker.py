import fire

from proficiv.domain.record_eval.worker import RecordEvalWorker


def main() -> None:
    worker = RecordEvalWorker()
    worker.loop()


if __name__ == "__main__":
    fire.Fire(main)
