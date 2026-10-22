-- Preserve earlier applications without inventing promotion details or a new consent timestamp.
ALTER TABLE affiliates ADD COLUMN promotion_plan TEXT NOT NULL DEFAULT '';
ALTER TABLE affiliates ADD COLUMN terms_accepted_at TEXT;
