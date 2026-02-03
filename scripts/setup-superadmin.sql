-- Run this in Supabase SQL Editor to set up super admin
-- After running the migration 017_superadmin_system.sql

-- First, make sure the user exists in auth.users and user_profiles
-- Then update their role to super_admin

-- Update the user profile to super_admin role
UPDATE public.user_profiles
SET 
    role = 'super_admin',
    account_status = 'active',
    plan_tier = 'unlimited',
    monthly_letter_quota = 999999,
    max_campaigns = 999,
    updated_at = now()
WHERE email = 'khademohali@gmail.com';

-- If the user doesn't exist yet, you'll need to:
-- 1. Sign up via the app first
-- 2. Then run this UPDATE query

-- To verify:
SELECT id, email, display_name, role, account_status, plan_tier 
FROM public.user_profiles 
WHERE email = 'khademohali@gmail.com';
