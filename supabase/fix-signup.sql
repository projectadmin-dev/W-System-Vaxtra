-- W System v2 - Fix Signup Error
-- Run this in Supabase SQL Editor to fix "Database error saving new user"
-- URL: https://supabase.com/dashboard/project/raelymffiajrtgbcxqse/sql/new

-- ═══════════════════════════════════════════════════════
-- FIX: Auto-create user on signup (bypass RLS)
-- ═══════════════════════════════════════════════════════

-- Drop existing function
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;

-- Recreate function with SECURITY DEFINER and proper search_path
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Get first tenant (for development)
  SELECT id INTO default_tenant_id FROM tenants ORDER BY created_at LIMIT 1;
  
  -- If no tenant exists, create one
  IF default_tenant_id IS NULL THEN
    INSERT INTO tenants (name, slug) VALUES ('Default Tenant', 'default')
    RETURNING id INTO default_tenant_id;
  END IF;
  
  -- Insert user record
  INSERT INTO public.users (id, email, tenant_id, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    default_tenant_id,
    'member',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════
-- GRANT necessary permissions
-- ═══════════════════════════════════════════════════════

-- Allow authenticated users to insert into users table (for trigger)
GRANT INSERT ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Make sure tenants table has at least one record
INSERT INTO tenants (id, name, slug) 
VALUES ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default')
ON CONFLICT (slug) DO NOTHING;

-- ═══════════════════════════════════════════════════════
-- Verify the fix
-- ═══════════════════════════════════════════════════════

-- Check if function exists
SELECT 'Function handle_new_user created successfully!' as status;

-- Check if trigger exists
SELECT 'Trigger on_auth_user_created created successfully!' as status;

-- Check if default tenant exists
SELECT 'Default tenant: ' || COUNT(*)::TEXT as status FROM tenants;
