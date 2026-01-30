-- Supabase Migration: Campaign ownership and updated RLS policies
-- Phase 4, Epic 4.2, Task 4.2.2
--
-- Adds FK constraint for created_by and updates RLS for owner-based access

-- Add FK constraint to campaigns.created_by (column already exists from 005)
DO $$ BEGIN
    ALTER TABLE public.campaigns
    ADD CONSTRAINT fk_campaigns_created_by
    FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create index for created_by lookups
CREATE INDEX IF NOT EXISTS idx_campaigns_created_by ON public.campaigns(created_by);

-- Drop existing RLS policies on campaigns to recreate with proper owner checks
DROP POLICY IF EXISTS "Anyone can read active campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Authenticated users can create campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Campaign owners can update their campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Campaign owners can delete their campaigns" ON public.campaigns;

-- Updated RLS Policies for campaigns table

-- Anyone can read active/completed campaigns (public facing)
CREATE POLICY "Anyone can read active campaigns"
    ON public.campaigns
    FOR SELECT
    USING (status IN ('active', 'completed'));

-- Campaign owners can always read their own campaigns (including drafts)
CREATE POLICY "Owners can read own campaigns"
    ON public.campaigns
    FOR SELECT
    USING (auth.uid() = created_by);

-- Authenticated organizers/admins can create campaigns
CREATE POLICY "Organizers can create campaigns"
    ON public.campaigns
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
        AND auth.uid() = created_by
        AND EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role IN ('organizer', 'admin')
        )
    );

-- Campaign owners can update their campaigns
CREATE POLICY "Owners can update own campaigns"
    ON public.campaigns
    FOR UPDATE
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Campaign owners can delete their campaigns
CREATE POLICY "Owners can delete own campaigns"
    ON public.campaigns
    FOR DELETE
    USING (auth.uid() = created_by);

-- Admins have full access to all campaigns
CREATE POLICY "Admins have full campaign access"
    ON public.campaigns
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Service role has full access (for server-side operations)
CREATE POLICY "Service role has full campaign access"
    ON public.campaigns
    FOR ALL
    USING (auth.role() = 'service_role');

-- Update campaign_demands RLS to follow parent campaign ownership
DROP POLICY IF EXISTS "Anyone can read demands" ON public.campaign_demands;
DROP POLICY IF EXISTS "Campaign owners can manage demands" ON public.campaign_demands;

-- Anyone can read demands for active campaigns
CREATE POLICY "Anyone can read demands for active campaigns"
    ON public.campaign_demands
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND status IN ('active', 'completed')
        )
    );

-- Campaign owners can read their own campaign demands
CREATE POLICY "Owners can read own campaign demands"
    ON public.campaign_demands
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND created_by = auth.uid()
        )
    );

-- Campaign owners can insert demands
CREATE POLICY "Owners can insert demands"
    ON public.campaign_demands
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND created_by = auth.uid()
        )
    );

-- Campaign owners can update demands
CREATE POLICY "Owners can update demands"
    ON public.campaign_demands
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND created_by = auth.uid()
        )
    );

-- Campaign owners can delete demands
CREATE POLICY "Owners can delete demands"
    ON public.campaign_demands
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND created_by = auth.uid()
        )
    );

-- Service role has full access to demands
CREATE POLICY "Service role has full demand access"
    ON public.campaign_demands
    FOR ALL
    USING (auth.role() = 'service_role');

-- Update campaign_prompts RLS to follow parent campaign ownership
DROP POLICY IF EXISTS "Campaign owners can read prompts" ON public.campaign_prompts;
DROP POLICY IF EXISTS "Campaign owners can manage prompts" ON public.campaign_prompts;

-- Campaign owners can read their prompts
CREATE POLICY "Owners can read prompts"
    ON public.campaign_prompts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND created_by = auth.uid()
        )
    );

-- Campaign owners can insert prompts
CREATE POLICY "Owners can insert prompts"
    ON public.campaign_prompts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND created_by = auth.uid()
        )
    );

-- Campaign owners can update prompts
CREATE POLICY "Owners can update prompts"
    ON public.campaign_prompts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND created_by = auth.uid()
        )
    );

-- Campaign owners can delete prompts
CREATE POLICY "Owners can delete prompts"
    ON public.campaign_prompts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns
            WHERE id = campaign_id AND created_by = auth.uid()
        )
    );

-- Service role has full access to prompts
CREATE POLICY "Service role has full prompt access"
    ON public.campaign_prompts
    FOR ALL
    USING (auth.role() = 'service_role');

COMMENT ON COLUMN public.campaigns.created_by IS 'User ID of the campaign creator/owner';
