-- Supabase Migration: Super Admin System
-- SaaS platform features for managing campaigners
--
-- Adds:
-- 1. super_admin role
-- 2. campaigner_applications table
-- 3. account_status and plan fields to user_profiles
-- 4. activity_logs table
-- 5. platform_settings table

-- ============================================================
-- 1. Add super_admin to user_role enum
-- ============================================================
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'super_admin';

-- ============================================================
-- 2. Create account_status enum
-- ============================================================
DO $$ BEGIN
    CREATE TYPE account_status AS ENUM (
        'pending',      -- Applied, awaiting approval
        'active',       -- Approved and active
        'trial',        -- Trial period
        'suspended',    -- Temporarily suspended
        'deactivated'   -- Permanently deactivated
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 3. Create plan_tier enum
-- ============================================================
DO $$ BEGIN
    CREATE TYPE plan_tier AS ENUM (
        'free',         -- Free tier with limits
        'starter',      -- Paid starter plan
        'professional', -- Professional plan
        'enterprise',   -- Custom enterprise plan
        'unlimited'     -- No limits (internal use)
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 4. Add new columns to user_profiles
-- ============================================================
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS account_status account_status DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS plan_tier plan_tier DEFAULT 'free',
ADD COLUMN IF NOT EXISTS organization_name TEXT,
ADD COLUMN IF NOT EXISTS organization_website TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS monthly_letter_quota INTEGER DEFAULT 1000,
ADD COLUMN IF NOT EXISTS monthly_letters_used INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS max_campaigns INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS quota_reset_at TIMESTAMPTZ DEFAULT now() + interval '30 days',
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS suspended_reason TEXT;

-- Index for account status queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_account_status ON public.user_profiles(account_status);
CREATE INDEX IF NOT EXISTS idx_user_profiles_plan_tier ON public.user_profiles(plan_tier);

-- ============================================================
-- 5. Create campaigner_applications table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.campaigner_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Applicant info (may not have account yet)
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    organization_name TEXT,
    organization_website TEXT,
    organization_description TEXT,
    
    -- Social proof / vetting info
    social_links JSONB DEFAULT '[]'::jsonb,  -- Array of {platform, url}
    referral_source TEXT,                     -- How did you hear about us?
    intended_use TEXT NOT NULL,               -- What campaigns do you plan to run?
    expected_volume TEXT,                     -- Expected letters per month
    
    -- Application status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
    
    -- Review info
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id),
    review_notes TEXT,
    rejection_reason TEXT,
    
    -- If approved, link to user account
    user_id UUID REFERENCES auth.users(id),
    
    -- Terms acceptance
    terms_accepted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    terms_version TEXT DEFAULT '1.0',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_campaigner_applications_status ON public.campaigner_applications(status);
CREATE INDEX IF NOT EXISTS idx_campaigner_applications_email ON public.campaigner_applications(email);
CREATE INDEX IF NOT EXISTS idx_campaigner_applications_created_at ON public.campaigner_applications(created_at DESC);

-- Updated_at trigger
DROP TRIGGER IF EXISTS update_campaigner_applications_updated_at ON public.campaigner_applications;
CREATE TRIGGER update_campaigner_applications_updated_at
    BEFORE UPDATE ON public.campaigner_applications
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. Create activity_logs table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Who performed the action
    actor_id UUID REFERENCES auth.users(id),
    actor_email TEXT,
    actor_role user_role,
    
    -- What happened
    action TEXT NOT NULL,  -- e.g., 'application.approved', 'account.suspended'
    resource_type TEXT,    -- e.g., 'application', 'user', 'campaign'
    resource_id UUID,
    
    -- Details
    details JSONB DEFAULT '{}'::jsonb,
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for querying
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action ON public.activity_logs(action);
CREATE INDEX IF NOT EXISTS idx_activity_logs_resource ON public.activity_logs(resource_type, resource_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- ============================================================
-- 7. Create platform_settings table (key-value store)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.platform_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id)
);

-- Insert default settings
INSERT INTO public.platform_settings (key, value, description) VALUES
    ('default_letter_quota', '1000', 'Default monthly letter quota for new accounts'),
    ('default_max_campaigns', '3', 'Default max campaigns for free tier'),
    ('require_application_approval', 'true', 'Whether new applications need approval'),
    ('trial_days', '14', 'Trial period duration in days'),
    ('allowed_countries', '["de", "uk", "us", "fr", "ca"]', 'Countries available for targeting'),
    ('maintenance_mode', 'false', 'Platform-wide maintenance mode'),
    ('new_registrations_enabled', 'true', 'Whether new registrations are open')
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 8. RLS Policies
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE public.campaigner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_settings ENABLE ROW LEVEL SECURITY;

-- Campaigner Applications RLS
-- Super admins can do everything
CREATE POLICY "Super admins can manage all applications" ON public.campaigner_applications
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Anyone can insert (apply)
CREATE POLICY "Anyone can submit applications" ON public.campaigner_applications
    FOR INSERT
    WITH CHECK (true);

-- Users can view their own application
CREATE POLICY "Users can view own application" ON public.campaigner_applications
    FOR SELECT
    USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Activity Logs RLS
-- Only super admins can view activity logs
CREATE POLICY "Super admins can view all logs" ON public.activity_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Service role can insert logs
CREATE POLICY "Service role can insert logs" ON public.activity_logs
    FOR INSERT
    WITH CHECK (true);

-- Platform Settings RLS
-- Super admins can read and write settings
CREATE POLICY "Super admins can manage settings" ON public.platform_settings
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Everyone can read certain public settings
CREATE POLICY "Public can read public settings" ON public.platform_settings
    FOR SELECT
    USING (key IN ('maintenance_mode', 'new_registrations_enabled', 'allowed_countries'));

-- ============================================================
-- 9. Update user_profiles RLS for super admin access
-- ============================================================

-- Drop existing policies if they conflict
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Super admins can update all profiles" ON public.user_profiles;

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON public.user_profiles
    FOR SELECT
    USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- Super admins can update all profiles
CREATE POLICY "Super admins can update all profiles" ON public.user_profiles
    FOR UPDATE
    USING (
        auth.uid() = id OR
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND role = 'super_admin'
        )
    );

-- ============================================================
-- 10. Helper function to log activity
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_activity(
    p_action TEXT,
    p_resource_type TEXT DEFAULT NULL,
    p_resource_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID AS $$
DECLARE
    v_log_id UUID;
    v_actor_email TEXT;
    v_actor_role user_role;
BEGIN
    -- Get actor info
    SELECT email INTO v_actor_email FROM auth.users WHERE id = auth.uid();
    SELECT role INTO v_actor_role FROM public.user_profiles WHERE id = auth.uid();
    
    INSERT INTO public.activity_logs (
        actor_id,
        actor_email,
        actor_role,
        action,
        resource_type,
        resource_id,
        details
    ) VALUES (
        auth.uid(),
        v_actor_email,
        v_actor_role,
        p_action,
        p_resource_type,
        p_resource_id,
        p_details
    )
    RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 11. Function to approve application
-- ============================================================
CREATE OR REPLACE FUNCTION public.approve_application(
    p_application_id UUID,
    p_notes TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_app RECORD;
    v_user_id UUID;
BEGIN
    -- Check caller is super admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: super admin required';
    END IF;
    
    -- Get application
    SELECT * INTO v_app FROM public.campaigner_applications WHERE id = p_application_id;
    
    IF v_app IS NULL THEN
        RAISE EXCEPTION 'Application not found';
    END IF;
    
    IF v_app.status != 'pending' THEN
        RAISE EXCEPTION 'Application is not pending';
    END IF;
    
    -- Update application
    UPDATE public.campaigner_applications SET
        status = 'approved',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        review_notes = p_notes,
        updated_at = now()
    WHERE id = p_application_id;
    
    -- If user already exists, update their profile
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_app.email;
    
    IF v_user_id IS NOT NULL THEN
        UPDATE public.user_profiles SET
            role = 'organizer',
            account_status = 'active',
            organization_name = v_app.organization_name,
            organization_website = v_app.organization_website,
            approved_at = now(),
            approved_by = auth.uid()
        WHERE id = v_user_id;
        
        UPDATE public.campaigner_applications SET user_id = v_user_id WHERE id = p_application_id;
    END IF;
    
    -- Log activity
    PERFORM public.log_activity(
        'application.approved',
        'application',
        p_application_id,
        jsonb_build_object('email', v_app.email, 'notes', p_notes)
    );
    
    RETURN jsonb_build_object('success', true, 'user_id', v_user_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 12. Function to reject application
-- ============================================================
CREATE OR REPLACE FUNCTION public.reject_application(
    p_application_id UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
DECLARE
    v_app RECORD;
BEGIN
    -- Check caller is super admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: super admin required';
    END IF;
    
    -- Get application
    SELECT * INTO v_app FROM public.campaigner_applications WHERE id = p_application_id;
    
    IF v_app IS NULL THEN
        RAISE EXCEPTION 'Application not found';
    END IF;
    
    IF v_app.status != 'pending' THEN
        RAISE EXCEPTION 'Application is not pending';
    END IF;
    
    -- Update application
    UPDATE public.campaigner_applications SET
        status = 'rejected',
        reviewed_at = now(),
        reviewed_by = auth.uid(),
        rejection_reason = p_reason,
        updated_at = now()
    WHERE id = p_application_id;
    
    -- Log activity
    PERFORM public.log_activity(
        'application.rejected',
        'application',
        p_application_id,
        jsonb_build_object('email', v_app.email, 'reason', p_reason)
    );
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 13. Function to suspend account
-- ============================================================
CREATE OR REPLACE FUNCTION public.suspend_account(
    p_user_id UUID,
    p_reason TEXT
)
RETURNS JSONB AS $$
BEGIN
    -- Check caller is super admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: super admin required';
    END IF;
    
    -- Update profile
    UPDATE public.user_profiles SET
        account_status = 'suspended',
        suspended_at = now(),
        suspended_reason = p_reason,
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Log activity
    PERFORM public.log_activity(
        'account.suspended',
        'user',
        p_user_id,
        jsonb_build_object('reason', p_reason)
    );
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 14. Function to reactivate account
-- ============================================================
CREATE OR REPLACE FUNCTION public.reactivate_account(
    p_user_id UUID
)
RETURNS JSONB AS $$
BEGIN
    -- Check caller is super admin
    IF NOT EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'super_admin'
    ) THEN
        RAISE EXCEPTION 'Unauthorized: super admin required';
    END IF;
    
    -- Update profile
    UPDATE public.user_profiles SET
        account_status = 'active',
        suspended_at = NULL,
        suspended_reason = NULL,
        updated_at = now()
    WHERE id = p_user_id;
    
    -- Log activity
    PERFORM public.log_activity(
        'account.reactivated',
        'user',
        p_user_id,
        '{}'::jsonb
    );
    
    RETURN jsonb_build_object('success', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 15. View for pending applications count (dashboard widget)
-- ============================================================
CREATE OR REPLACE VIEW public.pending_applications_count AS
SELECT COUNT(*) as count
FROM public.campaigner_applications
WHERE status = 'pending';

-- Grant access to view
GRANT SELECT ON public.pending_applications_count TO authenticated;
