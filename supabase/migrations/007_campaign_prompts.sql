-- Supabase Migration: Campaign Prompts table
-- Phase 1, Epic 1.1, Task 1.1.3

-- Create campaign_prompts table
CREATE TABLE IF NOT EXISTS public.campaign_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to campaigns
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    
    -- Country and language targeting
    country_code TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'en',
    
    -- The system prompt for LLM letter generation
    system_prompt TEXT NOT NULL,
    
    -- Versioning for prompt management
    version INTEGER NOT NULL DEFAULT 1,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Optional metadata
    description TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create unique constraint for active prompt per campaign/country/language
-- Only one prompt can be active for each campaign/country/language combination
CREATE UNIQUE INDEX IF NOT EXISTS idx_campaign_prompts_active_unique 
ON public.campaign_prompts(campaign_id, country_code, language) 
WHERE is_active = true;

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_campaign_prompts_campaign_id ON public.campaign_prompts(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_prompts_lookup 
ON public.campaign_prompts(campaign_id, country_code, language, is_active);
CREATE INDEX IF NOT EXISTS idx_campaign_prompts_version 
ON public.campaign_prompts(campaign_id, country_code, language, version DESC);

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS campaign_prompts_updated_at ON public.campaign_prompts;
CREATE TRIGGER campaign_prompts_updated_at
    BEFORE UPDATE ON public.campaign_prompts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.campaign_prompts ENABLE ROW LEVEL SECURITY;

-- Policy: Service role has full access (needed for letter generation API)
CREATE POLICY "Service role has full access to prompts" ON public.campaign_prompts
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Campaign owners can read and manage their prompts
CREATE POLICY "Campaign owners can manage prompts" ON public.campaign_prompts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_prompts.campaign_id 
            AND campaigns.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_prompts.campaign_id 
            AND campaigns.created_by = auth.uid()
        )
    );

-- Note: Prompts are not publicly readable - they contain sensitive LLM instructions
-- Only accessed via service role in API routes

-- Add comments for documentation
COMMENT ON TABLE public.campaign_prompts IS 'LLM system prompts for each campaign, versioned by country and language';
COMMENT ON COLUMN public.campaign_prompts.campaign_id IS 'FK to the parent campaign';
COMMENT ON COLUMN public.campaign_prompts.country_code IS 'Country code this prompt is for (de, ca, uk, us, fr)';
COMMENT ON COLUMN public.campaign_prompts.language IS 'Language code for the prompt (en, de, fr, es)';
COMMENT ON COLUMN public.campaign_prompts.system_prompt IS 'The full system prompt sent to the LLM for letter generation';
COMMENT ON COLUMN public.campaign_prompts.version IS 'Version number for tracking prompt iterations';
COMMENT ON COLUMN public.campaign_prompts.is_active IS 'Whether this is the active version for this campaign/country/language';
COMMENT ON COLUMN public.campaign_prompts.description IS 'Optional description of changes in this version';
