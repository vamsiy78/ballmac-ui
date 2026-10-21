ALTER TABLE affiliates ADD COLUMN review_state TEXT CHECK(review_state IS NULL OR review_state='rejected');
ALTER TABLE affiliates ADD COLUMN review_note TEXT NOT NULL DEFAULT '';
ALTER TABLE affiliates ADD COLUMN reviewed_at TEXT;
ALTER TABLE affiliates ADD COLUMN revision INTEGER NOT NULL DEFAULT 0;
ALTER TABLE affiliate_payouts ADD COLUMN method TEXT NOT NULL DEFAULT 'manual' CHECK(method IN ('manual','paypal','wise','other'));
CREATE TABLE IF NOT EXISTS affiliate_owner_challenges (
  email TEXT PRIMARY KEY COLLATE NOCASE,
  code_hash TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  requested_at INTEGER NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS affiliate_owner_sessions (
  token_hash TEXT PRIMARY KEY,
  email TEXT NOT NULL COLLATE NOCASE,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS affiliate_owner_sessions_expiry ON affiliate_owner_sessions(expires_at);
CREATE TABLE IF NOT EXISTS affiliate_audit (
  id TEXT PRIMARY KEY,
  actor TEXT NOT NULL,
  action TEXT NOT NULL,
  target TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  detail TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE INDEX IF NOT EXISTS affiliate_audit_target ON affiliate_audit(target,created_at);
