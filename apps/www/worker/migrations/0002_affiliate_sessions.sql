CREATE TABLE IF NOT EXISTS affiliate_challenges (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  affiliate_id TEXT NOT NULL REFERENCES affiliates(id),
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  requested_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS affiliate_sessions (
  token_hash TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL REFERENCES affiliates(id),
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS affiliate_sessions_expiry ON affiliate_sessions(expires_at);
