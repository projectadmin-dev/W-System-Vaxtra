-- ═══════════════════════════════════════════════════════
-- 10. TRIGGERS - AUTO CREATE USER ON SIGNUP (FIXED)
-- ═══════════════════════════════════════════════════════

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_tenant_id UUID;
BEGIN
  -- Get first tenant (for development)
  SELECT id INTO default_tenant_id FROM tenants ORDER BY created_at LIMIT 1;
  
  -- If no tenant exists, create one (bypass RLS)
  IF default_tenant_id IS NULL THEN
    INSERT INTO tenants (name, slug) VALUES ('Default Tenant', 'default')
    RETURNING id INTO default_tenant_id;
  END IF;
  
  -- Insert user record (bypass RLS using SECURITY DEFINER)
  INSERT INTO users (id, email, tenant_id, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    default_tenant_id,
    'member',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger on auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
