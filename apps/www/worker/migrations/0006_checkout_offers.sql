-- One row per Pro checkout started from the site: the random id is in the checkout's cancel address, the offer window starts when the buyer first comes back.
CREATE TABLE IF NOT EXISTS checkout_offers (
  nonce TEXT PRIMARY KEY,
  created_at INTEGER NOT NULL,
  started_at INTEGER,
  expires_at INTEGER,
  code TEXT,
  claimed_at INTEGER
);
CREATE INDEX IF NOT EXISTS checkout_offers_created ON checkout_offers(created_at);
