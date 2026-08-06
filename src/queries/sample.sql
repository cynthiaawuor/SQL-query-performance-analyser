-- Query 1: deliberately reads the complete 100,000-row table before
-- returning one aggregate row. It demonstrates full-table-scan, high-cost,
-- and over-fetch findings with the default thresholds.
SELECT count(*) FROM audit_events;

-- Query 2: a primary-key lookup uses audit_events_pkey and is clean.
SELECT id, event_type, occurred_at
FROM audit_events
WHERE id = 42;
