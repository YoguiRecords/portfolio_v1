#!/bin/bash
# Rôles applicatifs à moindre privilège (idempotent — rejouable).
#  - app_web   : lecture seule  (utilisé par le site public)
#  - app_admin : lecture/écriture (utilisé par le back office)
# Le rôle propriétaire ($POSTGRES_USER) reste réservé aux migrations.
set -euo pipefail

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  DO \$\$ BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_web') THEN
      CREATE ROLE app_web LOGIN PASSWORD '${WEB_DB_PASSWORD}';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
      CREATE ROLE app_admin LOGIN PASSWORD '${ADMIN_DB_PASSWORD}';
    END IF;
  END \$\$;

  GRANT CONNECT ON DATABASE ${POSTGRES_DB} TO app_web, app_admin;
  GRANT USAGE ON SCHEMA public TO app_web, app_admin;

  -- Tables/séquences déjà présentes
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO app_web;
  GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_admin;
  GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_admin;

  -- Tables/séquences futures (créées par le rôle propriétaire lors des migrations)
  ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public
    GRANT SELECT ON TABLES TO app_web;
  ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_admin;
  ALTER DEFAULT PRIVILEGES FOR ROLE ${POSTGRES_USER} IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO app_admin;
EOSQL
