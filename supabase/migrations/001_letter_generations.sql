-- Supabase Migration: Letter Generations Tracking
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/pqghxjnngwqwzgollgxm/sql)

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create letter_generations table
CREATE TABLE IF NOT EXISTS public.letter_generations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- MdB (Member of Parliament) information
    mdb_id TEXT NOT NULL,
    mdb_name TEXT NOT NULL,
    mdb_party TEXT,
    
    -- Wahlkreis (electoral district) information
    wahlkreis_id TEXT,
    wahlkreis_name TEXT,
    
    -- Selected demands (array of forderung IDs)
    forderung_ids TEXT[] NOT NULL DEFAULT '{}',
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    -- Optional: anonymized user fingerprint for deduplication analysis
    -- (hashed, not personally identifiable)
    user_hash TEXT
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_letter_generations_mdb_id ON public.letter_generations(mdb_id);
CREATE INDEX IF NOT EXISTS idx_letter_generations_created_at ON public.letter_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_letter_generations_party ON public.letter_generations(mdb_party);

-- Enable Row Level Security (RLS)
ALTER TABLE public.letter_generations ENABLE ROW LEVEL SECURITY;

-- Policy: Allow insert from authenticated service role only
CREATE POLICY "Service role can insert letters" ON public.letter_generations
    FOR INSERT
    TO service_role
    WITH CHECK (true);

-- Policy: Allow select for aggregate statistics (read-only, no personal data exposed)
CREATE POLICY "Anyone can read aggregate data" ON public.letter_generations
    FOR SELECT
    USING (true);

-- Add comment for documentation
COMMENT ON TABLE public.letter_generations IS 
    'Tracks letter generations for impact metrics. No personal content stored - only MdB and Forderung references.';

-- Optional: Create a view for public statistics (safe to expose)
CREATE OR REPLACE VIEW public.letter_stats AS
SELECT 
    COUNT(*) as total_letters,
    COUNT(DISTINCT mdb_id) as unique_mdbs_contacted,
    DATE_TRUNC('day', created_at) as date,
    mdb_party as party
FROM public.letter_generations
GROUP BY DATE_TRUNC('day', created_at), mdb_party;

-- Grant access to the view
GRANT SELECT ON public.letter_stats TO anon, authenticated;
