import fire

from proficiv.domain.record_eval.worker import RecordEvalJobConsumer


def main() -> None:
    worker = RecordEvalJobConsumer()
    worker.loop()


if __name__ == "__main__":
    fire.Fire(main)
