#!/bin/bash
# Crée la base + le rôle Umami au premier démarrage du volume Postgres.
# Umami est ainsi isolé (moindre privilège) : son rôle ne voit que sa propre base.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE USER ${UMAMI_DB_USER} WITH PASSWORD '${UMAMI_DB_PASSWORD}';
  CREATE DATABASE umami OWNER ${UMAMI_DB_USER};
EOSQL
