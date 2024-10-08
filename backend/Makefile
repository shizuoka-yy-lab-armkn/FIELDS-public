.DEFAULT_GOAL := help
SHELL         := /usr/bin/env bash -Eeuo pipefail
OS            := $(shell uname -s)
FIELDS_CMD  := poetry run python3 -m fields.cmd

.PHONY:	$(.DEFAULT_GOAL) $(MAKECMDGOALS)

help:
	bat Makefile || cat Makefile

install:
	ln -sf poetry.$(OS).lock poetry.lock
	poetry install --no-root
	make gen/prisma

run/server/dev:
	$(FIELDS_CMD).serve --reload

run/worker:
	$(FIELDS_CMD).worker

gen/prisma:
	poetry run prisma generate

gen/oapi/stdout:
	$(FIELDS_CMD).gen_oapi --indent=2

gen/oapi:
	$(FIELDS_CMD).gen_oapi --only-version v1 --out ../docs/backend.v1.openapi.json

migrate/status:
	poetry run prisma migrate status

migrate/dev:
	poetry run prisma migrate dev

migrate/deploy:
	poetry run prisma migrate deploy

chk: chk/lint chk/type chk/fmt

chk/lint:
	poetry run prisma validate
	poetry run ruff check .

chk/type:
	poetry run pyright .

chk/fmt:
	poetry run black --check .
	poetry run isort --check-only .

fmt:
	poetry run prisma format
	poetry run black .
	poetry run isort .

fix/lint:
	poetry run ruff check --fix-only --show-fixes .
