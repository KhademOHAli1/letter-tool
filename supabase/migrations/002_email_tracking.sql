-- Migration: Add email tracking table
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS email_opens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    letter_id TEXT UNIQUE NOT NULL,
    first_opened_at TIMESTAMPTZ DEFAULT NOW(),
    last_opened_at TIMESTAMPTZ DEFAULT NOW(),
    open_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_email_opens_letter_id ON email_opens(letter_id);

-- Function to increment open count (called from API)
CREATE OR REPLACE FUNCTION increment_email_opens(p_letter_id TEXT)
RETURNS void AS $$
BEGIN
    UPDATE email_opens 
    SET open_count = open_count + 1,
        last_opened_at = NOW()
    WHERE letter_id = p_letter_id;
END;
$$ LANGUAGE plpgsql;

-- Add email_opened column to letter_generations if it doesn't exist
ALTER TABLE letter_generations 
ADD COLUMN IF NOT EXISTS email_opened BOOLEAN DEFAULT FALSE;

ALTER TABLE letter_generations 
ADD COLUMN IF NOT EXISTS email_opened_at TIMESTAMPTZ;

-- View for stats with email open rates
CREATE OR REPLACE VIEW letter_stats_with_opens AS
SELECT 
    COUNT(*) as total_letters,
    COUNT(DISTINCT mdb_id) as unique_mdbs,
    COUNT(CASE WHEN email_opened = TRUE THEN 1 END) as opened_letters,
    ROUND(
        COUNT(CASE WHEN email_opened = TRUE THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(*), 0)::NUMERIC * 100, 
        1
    ) as open_rate_percent
FROM letter_generations;
