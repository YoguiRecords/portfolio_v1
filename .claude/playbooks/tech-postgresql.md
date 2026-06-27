## Conventions
- PostgreSQL 18 (latest stable). snake_case for table and column names.
- Table names: plural (users, project_tasks). PK: id (uuid or bigserial).
- FK naming: {table_singular}_id. Timestamps: created_at, updated_at.
- Booleans: is_* or has_* prefix. Unique constraints: uq_ prefix. Indexes: ix_ prefix.

## Data Access Architecture
- READ queries: MANDATORY to go through views — never query tables directly from application code.
- WRITE queries (INSERT/UPDATE/DELETE): target tables directly (ORM entities map to tables, not views).
- Views are the stable contract between application read-path and the DB schema.
- Renaming/restructuring a table only requires updating its view, not every read query.
- One view per entity minimum; create specialized views for complex joins or aggregates.
- If using EF Core: DbSet maps to tables for writes; use raw SQL / FromSqlRaw against views for reads.
- FORBIDDEN: EF Core migrations — schema.sql is the source of truth, patches applied manually via psql.

## Forbidden
- FORBIDDEN: read queries targeting tables directly — always use views for reads.
- FORBIDDEN: SELECT * in production queries — always list explicit columns.
- FORBIDDEN: raw string concatenation for queries — always use parameterized queries.
- FORBIDDEN: storing passwords in plain text — use bcrypt/argon2 hashing.
- FORBIDDEN: migrations without a tested rollback script.
- FORBIDDEN: deleting columns without a deprecation cycle.

## Recommended Patterns
- Indexes on all FK columns and frequently queried columns.
- EXPLAIN ANALYZE for any query touching > 1000 rows.
- Connection pooling: PgBouncer or built-in pooler.
- Transactions for multi-table writes.
- Partial indexes for filtered queries.

## Security
- Principle of least privilege: application user has only required permissions.
- Never connect as superuser from application code.
- SSL/TLS for all connections in production.
- Row-level security for multi-tenant data isolation.

## Common Pitfalls
- N+1 queries: use JOINs or batched IN() instead of per-row queries.
- Missing index on FK: causes sequential scan on joins.
- JSONB vs JSON: prefer JSONB (indexed, binary storage).
- Deadlocks: always acquire locks in consistent order across transactions.
