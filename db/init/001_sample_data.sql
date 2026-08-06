-- Demo schema for the SQL Query Performance Analyser.
-- This file is run automatically by the official Postgres image on first
-- database initialisation (see docker-compose.yml).

CREATE TABLE audit_events (
  id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  account_id INTEGER NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  payload TEXT NOT NULL
);

-- Deliberately do not index event_type.  The payload makes the table large
-- enough for its sequential-scan plan to exceed the default cost threshold.
INSERT INTO audit_events (event_type, account_id, occurred_at, payload)
SELECT
  CASE WHEN n = 1 THEN 'rare-event' ELSE 'page-view' END,
  (n % 1000) + 1,
  now() - (n * interval '1 second'),
  repeat('sample event payload ', 12)
FROM generate_series(1, 100000) AS n;

ANALYZE audit_events;
