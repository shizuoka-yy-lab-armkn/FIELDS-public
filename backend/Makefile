SHELL := /usr/bin/env bash -Eeuo pipefail
OS := $(shell uname -s)

PROFICIV_CMD := poetry run python3 -m proficiv.cmd


.PHONY:	dev/setup
dev/setup:
	ln -sf poetry.$(OS).lock poetry.lock


.PHONY:	install
install:
	poetry lock --no-update
	poetry install


.PHONY:	serve/dev
serve/dev:
	$(PROFICIV_CMD).serve --reload


.PHONY: run/worker
run/worker:
	$(PROFICIV_CMD).worker


.PHONY:	gen/oapi/stdout
gen/oapi/stdout:
	$(PROFICIV_CMD).gen_oapi --indent=2


.PHONY:	gen/oapi
gen/oapi:
	$(PROFICIV_CMD).gen_oapi --only-version v1 --out ../docs/backend.v1.openapi.json


.PHONY:	fmt
fmt:
	poetry run black .
	poetry run isort .


.PHONY:	lint
lint:
	poetry run ruff check .


.PHONY:	lint/fix
lint/fix:
	poetry run ruff check --fix-only --show-fixes .


.PHONY: typecheck
typecheck:
	poetry run pyright .
