PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS affiliates (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','active','paused')),
  discount_code TEXT,
  token_hash TEXT UNIQUE,
  terms_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS affiliate_sales (
  payment_id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL REFERENCES affiliates(id),
  net_cents INTEGER NOT NULL CHECK(net_cents >= 0),
  commission_cents INTEGER NOT NULL CHECK(commission_cents >= 0),
  state TEXT NOT NULL CHECK(state IN ('earned','reversed')),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS affiliate_sales_owner ON affiliate_sales(affiliate_id, created_at);
CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id TEXT PRIMARY KEY,
  affiliate_id TEXT NOT NULL REFERENCES affiliates(id),
  amount_cents INTEGER NOT NULL CHECK(amount_cents > 0),
  reference TEXT NOT NULL UNIQUE,
  paid_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
CREATE TABLE IF NOT EXISTS affiliate_events (id TEXT PRIMARY KEY, processed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP);
