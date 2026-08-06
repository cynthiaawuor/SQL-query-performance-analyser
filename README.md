# SQL Query Performance Analyser

## Run the reproducible demo

The included Docker Compose service creates the `sql_performance_analyzer`
database and seeds it with a 100,000-row `audit_events` table. Start it from a
fresh checkout with:

```bash
docker compose down -v
docker compose up -d
npm install
npm run audit -- src/queries/sample.sql --database-url postgres://postgres:mypassword@localhost:5436/sql_performance_analyzer
```

`docker compose down -v` is included because Postgres runs initialization files
only when it creates a new data directory. It removes only this Compose
project's named database volume; omit it when you want to retain existing demo
data.

Wait for the health check to pass if Docker reports the database is still
starting. The setup SQL is [db/init/001_sample_data.sql](db/init/001_sample_data.sql).

## Included sample queries

The command audits [src/queries/sample.sql](src/queries/sample.sql), which has
these expected results when using the default thresholds:

| Query | Expected result | Why |
| --- | --- | --- |
| `SELECT count(*) FROM audit_events` | `full-table-scan`, `high-cost`, `over-fetch` | An aggregate must read all 100,000 unindexed rows but returns one row. Its plan cost is above 1000. |
| Primary-key lookup for `id = 42` | No issues found | `audit_events_pkey` permits an index lookup that reads and returns one row. |

The `audit_events.event_type` column is intentionally unindexed so reviewers
can also inspect a conventional large-table sequential scan. Do not add an
index to it if you want to preserve the demo's detector results.

The exact cost and timing vary by PostgreSQL version and host, but the seeded
table size is chosen to stay above the shipped default thresholds.
