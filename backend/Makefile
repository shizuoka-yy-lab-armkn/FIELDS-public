SHELL := /usr/bin/env bash -Eeuo pipefail

.PHONY:	serve/dev
serve/dev:
	PROFICIV_ENV_FILE=./env/dev.env \
		poetry run python3 -m proficiv.main serve --reload


.PHONY:	fmt
fmt:
	poetry run black .
	poetry run isort .


.PHONY:	lint
lint:
	poetry run ruff check .


.PHONY: typecheck
typecheck:
	poetry run pyright .
