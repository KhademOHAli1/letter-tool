-- Supabase Migration: Normalize Party Names
-- Run this in your Supabase SQL Editor to fix inconsistent party name casing
-- Issue: "Grüne" and "GRÜNE" were stored as separate values

-- Normalize "Grüne" to "GRÜNE"
UPDATE public.letter_generations
SET mdb_party = 'GRÜNE'
WHERE mdb_party = 'Grüne';

-- Optional: Check for any other case variations (run as SELECT first to verify)
-- UPDATE public.letter_generations
-- SET mdb_party = 'GRÜNE'
-- WHERE UPPER(mdb_party) = 'GRÜNE' AND mdb_party != 'GRÜNE';

-- Verify the fix
SELECT mdb_party, COUNT(*) as count
FROM public.letter_generations
WHERE mdb_party ILIKE '%grün%'
GROUP BY mdb_party
ORDER BY count DESC;
