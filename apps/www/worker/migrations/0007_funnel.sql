-- Where buyers come from: one row per Buy click on the site (kind 'click') and one per successful payment (kind 'paid', id = the Dodo payment id).
-- No personal data: the page path, the plan, campaign tags, the referring host and the country only. Read with `pnpm funnel`.
CREATE TABLE IF NOT EXISTS funnel_events (
  id TEXT PRIMARY KEY,
  at INTEGER NOT NULL,
  kind TEXT NOT NULL,
  plan TEXT,
  page TEXT,
  utm TEXT,
  from_host TEXT,
  country TEXT,
  product_id TEXT,
  amount INTEGER,
  currency TEXT
);
CREATE INDEX IF NOT EXISTS funnel_events_at ON funnel_events(at);
