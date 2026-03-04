-- Migration: Fix Critical Security Advisories
-- Addresses all issues flagged by Supabase Advisor:
--   1. RLS Disabled on public.account, session, user, verification (CRITICAL)
--   2. Sensitive Columns Exposed on public.account, session (CRITICAL)
--   3. Function Search Path Mutable on update_updated_at_column
--   4. Multiple Permissive Policies on campaign_demands
--   5. Drop unused Better Auth + Iran Opposition Map tables

-- ============================================================================
-- 1. DROP UNUSED TABLES (Better Auth + Iran Opposition Map)
-- These tables are from removed/separate projects, all empty or test data only.
-- Order matters due to FK dependencies.
-- ============================================================================

-- Drop tables that reference public.user first
DROP TABLE IF EXISTS public.revision_comments CASCADE;
DROP TABLE IF EXISTS public.revisions CASCADE;
DROP TABLE IF EXISTS public.networks CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop Better Auth tables (account/session reference user)
DROP TABLE IF EXISTS public.account CASCADE;
DROP TABLE IF EXISTS public.session CASCADE;
DROP TABLE IF EXISTS public.verification CASCADE;
DROP TABLE IF EXISTS public."user" CASCADE;

-- ============================================================================
-- 2. FIX FUNCTION SEARCH PATH (Security)
-- Prevents search path injection attacks.
-- ============================================================================

-- Drop stale function overloads from older migrations
DROP FUNCTION IF EXISTS public.approve_application(uuid, uuid);
DROP FUNCTION IF EXISTS public.reject_application(uuid, uuid, text);
DROP FUNCTION IF EXISTS public.log_activity(text, text, uuid, jsonb);
DROP FUNCTION IF EXISTS public.suspend_account(uuid, text);
DROP FUNCTION IF EXISTS public.reactivate_account(uuid);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Also fix other functions that may be missing search_path
CREATE OR REPLACE FUNCTION public.is_organizer()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid()
        AND role IN ('organizer', 'admin', 'super_admin')
        AND account_status = 'active'
    );
$$;

CREATE OR REPLACE FUNCTION public.approve_application(
    p_application_id uuid,
    p_reviewer_notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_application record;
    v_user_id uuid;
BEGIN
    SELECT * INTO v_application
    FROM public.campaigner_applications
    WHERE id = p_application_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Application not found');
    END IF;

    IF v_application.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Application is not pending');
    END IF;

    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_application.email;

    UPDATE public.campaigner_applications
    SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        reviewer_notes = p_reviewer_notes
    WHERE id = p_application_id;

    IF v_user_id IS NOT NULL THEN
        UPDATE public.user_profiles
        SET
            role = 'organizer',
            account_status = 'active',
            approved_at = now(),
            approved_by = auth.uid()
        WHERE id = v_user_id;

        UPDATE public.campaigner_applications
        SET user_id = v_user_id
        WHERE id = p_application_id;
    END IF;

    RETURN json_build_object(
        'success', true,
        'user_exists', v_user_id IS NOT NULL,
        'user_id', v_user_id
    );
END;
$$;

DROP FUNCTION IF EXISTS public.log_activity(text, text, uuid, jsonb);
CREATE OR REPLACE FUNCTION public.log_activity(
    p_action text,
    p_resource_type text,
    p_resource_id uuid DEFAULT NULL,
    p_details jsonb DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_log_id uuid;
BEGIN
    INSERT INTO public.activity_logs (
        actor_id, action, resource_type, resource_id, details, ip_address
    ) VALUES (
        auth.uid(), p_action, p_resource_type, p_resource_id, p_details, NULL
    )
    RETURNING id INTO v_log_id;

    RETURN v_log_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_application(
    p_application_id uuid,
    p_reviewer_notes text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_application record;
BEGIN
    SELECT * INTO v_application
    FROM public.campaigner_applications
    WHERE id = p_application_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Application not found');
    END IF;

    IF v_application.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Application is not pending');
    END IF;

    UPDATE public.campaigner_applications
    SET
        status = 'rejected',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        reviewer_notes = p_reviewer_notes
    WHERE id = p_application_id;

    RETURN json_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.suspend_account(
    p_user_id uuid,
    p_reason text DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.user_profiles
    SET
        account_status = 'suspended',
        updated_at = now()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    PERFORM public.log_activity(
        'suspend_account', 'user', p_user_id,
        jsonb_build_object('reason', p_reason)
    );

    RETURN json_build_object('success', true);
END;
$$;

CREATE OR REPLACE FUNCTION public.reactivate_account(
    p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.user_profiles
    SET
        account_status = 'active',
        updated_at = now()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'User not found');
    END IF;

    PERFORM public.log_activity(
        'reactivate_account', 'user', p_user_id, NULL
    );

    RETURN json_build_object('success', true);
END;
$$;

-- ============================================================================
-- 3. FIX MULTIPLE PERMISSIVE POLICIES ON campaign_demands
-- Consolidate overlapping SELECT policies to avoid the "Multiple Permissive
-- Policies" warning. The service_role policy is unnecessary (bypasses RLS).
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Anyone can read demands from active campaigns" ON public.campaign_demands;
DROP POLICY IF EXISTS "Service role has full access to demands" ON public.campaign_demands;
DROP POLICY IF EXISTS "Campaign owners can manage demands" ON public.campaign_demands;

-- Recreate with clean, non-overlapping policies:

-- Public read: anyone can read demands from active campaigns
CREATE POLICY "Public can read active campaign demands" ON public.campaign_demands
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_demands.campaign_id
            AND c.status = 'active'
        )
    );

-- Owners can INSERT demands for their own campaigns
CREATE POLICY "Owners can insert demands" ON public.campaign_demands
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND c.created_by = (SELECT auth.uid())
        )
    );

-- Owners can UPDATE demands for their own campaigns
CREATE POLICY "Owners can update demands" ON public.campaign_demands
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND c.created_by = (SELECT auth.uid())
        )
    );

-- Owners can DELETE demands for their own campaigns
CREATE POLICY "Owners can delete demands" ON public.campaign_demands
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND c.created_by = (SELECT auth.uid())
        )
    );

-- ============================================================================
-- 4. ALSO FIX: Optimize auth.uid() calls in other policies (performance)
-- Wrap auth.uid() in (SELECT ...) to prevent per-row re-evaluation
-- ============================================================================

-- Fix campaign_prompts if it has the same pattern
DROP POLICY IF EXISTS "Campaign owners can manage prompts" ON public.campaign_prompts;
DROP POLICY IF EXISTS "Anyone can read active campaign prompts" ON public.campaign_prompts;
DROP POLICY IF EXISTS "Service role has full access to prompts" ON public.campaign_prompts;

CREATE POLICY "Public can read active campaign prompts" ON public.campaign_prompts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_prompts.campaign_id
            AND c.status = 'active'
        )
    );

CREATE POLICY "Owners can insert prompts" ON public.campaign_prompts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND c.created_by = (SELECT auth.uid())
        )
    );

CREATE POLICY "Owners can update prompts" ON public.campaign_prompts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND c.created_by = (SELECT auth.uid())
        )
    );

CREATE POLICY "Owners can delete prompts" ON public.campaign_prompts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND c.created_by = (SELECT auth.uid())
        )
    );

-- ============================================================================
-- 5. ADD MISSING FK INDEXES (Performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_campaigner_applications_reviewed_by
    ON public.campaigner_applications(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_campaigner_applications_user_id
    ON public.campaigner_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by
    ON public.platform_settings(updated_by);

CREATE INDEX IF NOT EXISTS idx_user_profiles_approved_by
    ON public.user_profiles(approved_by);
