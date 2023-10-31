SHELL := /usr/bin/env bash -Eeuo pipefail

PROFICIV_CMD := poetry run python3 -m proficiv.cmd
SET_DEV_ENV  := PROFICIV_ENV_FILE=./env/dev.env

.PHONY:	serve/dev
serve/dev:
	$(SET_DEV_ENV) \
		$(PROFICIV_CMD).serve --reload


.PHONY:	gen/oapi/stdout
gen/oapi/stdout:
	$(SET_DEV_ENV) \
		$(PROFICIV_CMD).gen_oapi --indent=2


.PHONY:	gen/oapi
gen/oapi:
	$(SET_DEV_ENV) \
		$(PROFICIV_CMD).gen_oapi --out ../docs/backend.openapi.json


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
