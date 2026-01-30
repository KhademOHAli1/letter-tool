-- Supabase Migration: Campaign Demands table
-- Phase 1, Epic 1.1, Task 1.1.2

-- Create campaign_demands table
CREATE TABLE IF NOT EXISTS public.campaign_demands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Foreign key to campaigns
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    
    -- Multi-language title stored as JSONB
    -- Format: {"en": "Release all political prisoners", "de": "Alle politischen Gefangenen freilassen"}
    title JSONB NOT NULL DEFAULT '{}',
    
    -- Multi-language full description stored as JSONB
    description JSONB NOT NULL DEFAULT '{}',
    
    -- Multi-language brief text for use in letters stored as JSONB
    brief_text JSONB NOT NULL DEFAULT '{}',
    
    -- Sort order for displaying demands
    sort_order INTEGER NOT NULL DEFAULT 0,
    
    -- Completion tracking (for demands that have been met)
    completed BOOLEAN NOT NULL DEFAULT false,
    completed_date DATE,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_campaign_demands_campaign_id ON public.campaign_demands(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_demands_sort_order ON public.campaign_demands(campaign_id, sort_order);
CREATE INDEX IF NOT EXISTS idx_campaign_demands_completed ON public.campaign_demands(campaign_id, completed);

-- Create trigger to auto-update updated_at
DROP TRIGGER IF EXISTS campaign_demands_updated_at ON public.campaign_demands;
CREATE TRIGGER campaign_demands_updated_at
    BEFORE UPDATE ON public.campaign_demands
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (RLS)
ALTER TABLE public.campaign_demands ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read demands from active campaigns
CREATE POLICY "Anyone can read demands from active campaigns" ON public.campaign_demands
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_demands.campaign_id 
            AND campaigns.status = 'active'
        )
    );

-- Policy: Service role has full access
CREATE POLICY "Service role has full access to demands" ON public.campaign_demands
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Policy: Campaign owners can manage demands
CREATE POLICY "Campaign owners can manage demands" ON public.campaign_demands
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_demands.campaign_id 
            AND campaigns.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns 
            WHERE campaigns.id = campaign_demands.campaign_id 
            AND campaigns.created_by = auth.uid()
        )
    );

-- Add comments for documentation
COMMENT ON TABLE public.campaign_demands IS 'Political demands/asks for each campaign that users can select when writing letters';
COMMENT ON COLUMN public.campaign_demands.campaign_id IS 'FK to the parent campaign';
COMMENT ON COLUMN public.campaign_demands.title IS 'Multi-language demand title as JSONB: {"en": "Title", "de": "Titel"}';
COMMENT ON COLUMN public.campaign_demands.description IS 'Multi-language full description of the demand';
COMMENT ON COLUMN public.campaign_demands.brief_text IS 'Multi-language short text for use within generated letters';
COMMENT ON COLUMN public.campaign_demands.sort_order IS 'Display order of demands within a campaign';
COMMENT ON COLUMN public.campaign_demands.completed IS 'Whether this demand has been met/achieved';
COMMENT ON COLUMN public.campaign_demands.completed_date IS 'Date when the demand was marked as completed';
