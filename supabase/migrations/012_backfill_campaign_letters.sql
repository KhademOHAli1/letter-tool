-- Supabase Migration: Backfill existing letters with default campaign
-- Phase 7: Backend Analytics & Tracking
-- 
-- This migration assigns all existing letters (created before campaign system)
-- to the default "iran-2026" campaign.
--
-- NOTE: This migration assumes:
-- 1. A campaign with slug 'iran-2026' exists
-- 2. The campaign_id column already exists (from 008_add_campaign_to_letters.sql)

-- First, get the campaign ID for iran-2026
DO $$
DECLARE
    v_campaign_id UUID;
    v_updated_count INT;
BEGIN
    -- Find the iran-2026 campaign
    SELECT id INTO v_campaign_id
    FROM public.campaigns
    WHERE slug = 'iran-2026'
    LIMIT 1;
    
    -- If campaign exists, backfill letters
    IF v_campaign_id IS NOT NULL THEN
        -- Update all letters that don't have a campaign_id
        UPDATE public.letter_generations
        SET campaign_id = v_campaign_id
        WHERE campaign_id IS NULL;
        
        GET DIAGNOSTICS v_updated_count = ROW_COUNT;
        
        RAISE NOTICE 'Backfilled % letters to campaign iran-2026 (ID: %)', v_updated_count, v_campaign_id;
    ELSE
        RAISE NOTICE 'Campaign iran-2026 not found. Skipping backfill. Create the campaign first and re-run this migration.';
    END IF;
END $$;

-- Add a comment to track this migration
COMMENT ON TABLE public.letter_generations IS 
    'Stores all generated letters. Letters from before campaign system were backfilled to iran-2026 campaign.';
