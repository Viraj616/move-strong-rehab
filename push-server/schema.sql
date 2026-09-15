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
