CREATE TABLE IF NOT EXISTS devices (
 id TEXT PRIMARY KEY, token_hash TEXT NOT NULL, subscription TEXT NOT NULL,
 settings TEXT NOT NULL, activity TEXT NOT NULL DEFAULT '{}', enabled INTEGER NOT NULL DEFAULT 1,
 updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS deliveries (
 device_id TEXT NOT NULL, event_key TEXT NOT NULL, sent_at INTEGER NOT NULL,
 PRIMARY KEY(device_id,event_key)
);
CREATE INDEX IF NOT EXISTS delivery_age ON deliveries(sent_at);

CREATE TABLE IF NOT EXISTS weekly_snapshots (
 device_id TEXT NOT NULL,
 source_week_start TEXT NOT NULL,
 source_fingerprint TEXT NOT NULL,
 ready INTEGER NOT NULL DEFAULT 0,
 snapshot TEXT NOT NULL,
 updated_at INTEGER NOT NULL,
 PRIMARY KEY(device_id, source_week_start)
);
CREATE INDEX IF NOT EXISTS weekly_snapshot_age ON weekly_snapshots(updated_at);

CREATE TABLE IF NOT EXISTS review_drafts (
 next_week_start TEXT PRIMARY KEY,
 source_week_start TEXT NOT NULL,
 source_fingerprint TEXT NOT NULL,
 draft TEXT NOT NULL,
 status TEXT NOT NULL DEFAULT 'draft',
 created_at INTEGER NOT NULL,
 updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS review_draft_source ON review_drafts(source_week_start);
