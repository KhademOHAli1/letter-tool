-- Migration: Fix Security and Performance Advisories
-- Fixes issues flagged by Supabase Advisor

-- ============================================================================
-- 1. FIX FUNCTION SEARCH PATH (Security)
-- Add SET search_path = '' to all functions to prevent search path injection
-- ============================================================================

-- Fix update_updated_at_column
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

-- Fix is_organizer
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

-- Fix approve_application (first version - with user creation)
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
    v_result json;
BEGIN
    -- Get application
    SELECT * INTO v_application
    FROM public.campaigner_applications
    WHERE id = p_application_id;
    
    IF NOT FOUND THEN
        RETURN json_build_object('success', false, 'error', 'Application not found');
    END IF;
    
    IF v_application.status != 'pending' THEN
        RETURN json_build_object('success', false, 'error', 'Application is not pending');
    END IF;
    
    -- Check if user already exists
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = v_application.email;
    
    -- Update application status
    UPDATE public.campaigner_applications
    SET 
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        reviewer_notes = p_reviewer_notes
    WHERE id = p_application_id;
    
    -- If user exists, upgrade their role
    IF v_user_id IS NOT NULL THEN
        UPDATE public.user_profiles
        SET 
            role = 'organizer',
            account_status = 'active',
            approved_at = now(),
            approved_by = auth.uid()
        WHERE id = v_user_id;
        
        -- Link application to user
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

-- Fix log_activity
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
        actor_id,
        action,
        resource_type,
        resource_id,
        details,
        ip_address
    ) VALUES (
        auth.uid(),
        p_action,
        p_resource_type,
        p_resource_id,
        p_details,
        NULL
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Fix reject_application
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

-- Fix suspend_account
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
    
    -- Log activity
    PERFORM public.log_activity(
        'suspend_account',
        'user',
        p_user_id,
        jsonb_build_object('reason', p_reason)
    );
    
    RETURN json_build_object('success', true);
END;
$$;

-- Fix reactivate_account
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
    
    -- Log activity
    PERFORM public.log_activity(
        'reactivate_account',
        'user',
        p_user_id,
        NULL
    );
    
    RETURN json_build_object('success', true);
END;
$$;

-- ============================================================================
-- 2. FIX RLS POLICIES - Use (select auth.uid()) for performance
-- This prevents re-evaluation per row
-- ============================================================================

-- Drop and recreate policies with optimized auth.uid() calls

-- user_profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Service role has full access" ON public.user_profiles;

CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (id = (SELECT auth.uid()));

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (id = (SELECT auth.uid()));

-- Note: Service role policy removed - service role bypasses RLS anyway

-- campaigns policies
DROP POLICY IF EXISTS "Owners can read own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Organizers can create campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Owners can update own campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Owners can delete own campaigns" ON public.campaigns;

CREATE POLICY "Owners can read own campaigns" ON public.campaigns
    FOR SELECT USING (created_by = (SELECT auth.uid()));

CREATE POLICY "Organizers can create campaigns" ON public.campaigns
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = (SELECT auth.uid())
            AND role IN ('organizer', 'admin', 'super_admin')
            AND account_status = 'active'
        )
    );

CREATE POLICY "Owners can update own campaigns" ON public.campaigns
    FOR UPDATE USING (created_by = (SELECT auth.uid()));

CREATE POLICY "Owners can delete own campaigns" ON public.campaigns
    FOR DELETE USING (created_by = (SELECT auth.uid()));

-- campaign_demands policies
DROP POLICY IF EXISTS "Campaign owners can manage demands" ON public.campaign_demands;

CREATE POLICY "Campaign owners can manage demands" ON public.campaign_demands
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND c.created_by = (SELECT auth.uid())
        )
    );

-- campaign_prompts policies
DROP POLICY IF EXISTS "Campaign owners can manage prompts" ON public.campaign_prompts;

CREATE POLICY "Campaign owners can manage prompts" ON public.campaign_prompts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.campaigns c
            WHERE c.id = campaign_id
            AND c.created_by = (SELECT auth.uid())
        )
    );

-- campaigner_applications policies
DROP POLICY IF EXISTS "Super admins can manage all applications" ON public.campaigner_applications;
DROP POLICY IF EXISTS "Users can view own applications" ON public.campaigner_applications;
DROP POLICY IF EXISTS "Users can view own application" ON public.campaigner_applications;
DROP POLICY IF EXISTS "Users can create own application" ON public.campaigner_applications;

-- Keep only one SELECT policy for users
CREATE POLICY "Users can view own application" ON public.campaigner_applications
    FOR SELECT USING (
        user_id = (SELECT auth.uid()) 
        OR email = (SELECT email FROM auth.users WHERE id = (SELECT auth.uid()))
    );

-- Super admin policy with optimized check
CREATE POLICY "Super admins can manage all applications" ON public.campaigner_applications
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = (SELECT auth.uid())
            AND role = 'super_admin'
        )
    );

-- activity_logs policies
DROP POLICY IF EXISTS "Super admins can view all activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Super admins can view activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Service role can insert activity logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Super admins can insert activity logs" ON public.activity_logs;

-- Single SELECT policy for super admins
CREATE POLICY "Super admins can view activity logs" ON public.activity_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = (SELECT auth.uid())
            AND role = 'super_admin'
        )
    );

-- Single INSERT policy (allow service role and super admins)
CREATE POLICY "Super admins can insert activity logs" ON public.activity_logs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = (SELECT auth.uid())
            AND role = 'super_admin'
        )
    );

-- platform_settings policies
DROP POLICY IF EXISTS "Super admins can manage platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Super admins can insert platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Super admins can update platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Anyone can read platform settings" ON public.platform_settings;
DROP POLICY IF EXISTS "Anyone can read public settings" ON public.platform_settings;

-- Single read policy
CREATE POLICY "Anyone can read public settings" ON public.platform_settings
    FOR SELECT USING (is_public = true);

-- Single super admin policy for all operations
CREATE POLICY "Super admins can manage platform settings" ON public.platform_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = (SELECT auth.uid())
            AND role = 'super_admin'
        )
    );

-- ============================================================================
-- 3. ADD MISSING FOREIGN KEY INDEXES (Performance)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_campaigner_applications_reviewed_by 
    ON public.campaigner_applications(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_campaigner_applications_user_id 
    ON public.campaigner_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_platform_settings_updated_by 
    ON public.platform_settings(updated_by);

CREATE INDEX IF NOT EXISTS idx_user_profiles_approved_by 
    ON public.user_profiles(approved_by);

-- ============================================================================
-- 4. REMOVE DUPLICATE/REDUNDANT POLICIES
-- These were already handled above, but let's make sure
-- ============================================================================

-- Clean up any remaining duplicate super admin policies
DROP POLICY IF EXISTS "Super admins can view all applications" ON public.campaigner_applications;
DROP POLICY IF EXISTS "Super admins can update applications" ON public.campaigner_applications;

-- ============================================================================
-- 5. GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Ensure authenticated users can call the functions
GRANT EXECUTE ON FUNCTION public.is_organizer() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_activity(text, text, uuid, jsonb) TO authenticated;
