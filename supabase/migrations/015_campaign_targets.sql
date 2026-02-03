-- Supabase Migration: Campaign custom targets
-- Enables campaign-specific target lists for custom outreach

-- Add custom targeting flag to campaigns
ALTER TABLE public.campaigns
    ADD COLUMN IF NOT EXISTS use_custom_targets BOOLEAN NOT NULL DEFAULT false;

-- Create campaign_targets table
CREATE TABLE IF NOT EXISTS public.campaign_targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    city TEXT,
    region TEXT,
    country_code TEXT,
    category TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaign_targets_campaign_id
    ON public.campaign_targets(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_targets_postal_code
    ON public.campaign_targets(postal_code);

-- updated_at trigger
DROP TRIGGER IF EXISTS campaign_targets_updated_at ON public.campaign_targets;
CREATE TRIGGER campaign_targets_updated_at
    BEFORE UPDATE ON public.campaign_targets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.campaign_targets ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role has full access" ON public.campaign_targets
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Owners can manage their campaign targets
CREATE POLICY "Owners can manage targets" ON public.campaign_targets
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE public.campaigns.id = campaign_targets.campaign_id
              AND public.campaigns.created_by = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE public.campaigns.id = campaign_targets.campaign_id
              AND public.campaigns.created_by = auth.uid()
        )
    );

-- Add comments
COMMENT ON TABLE public.campaign_targets IS 'Custom target lists for campaigns (e.g., universities, institutions)';
COMMENT ON COLUMN public.campaign_targets.postal_code IS 'Postal code used to locate nearest targets';
