-- W System v2 - Initial Schema
-- Created: 2026-05-04
-- Purpose: Multi-tenant project management with proper RLS isolation

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ═══════════════════════════════════════════════════════
-- 1. TENANTS TABLE (Companies/Organizations)
-- ═══════════════════════════════════════════════════════

CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL, -- for URL-friendly tenant identification
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX idx_tenants_slug ON tenants(slug);

-- ═══════════════════════════════════════════════════════
-- 2. USERS TABLE (linked to Supabase Auth + Tenants)
-- ═══════════════════════════════════════════════════════

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('admin', 'manager', 'member')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_tenant_id ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);

-- ═══════════════════════════════════════════════════════
-- 3. PROJECTS TABLE
-- ═══════════════════════════════════════════════════════

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'done', 'archived')),
  owner_id UUID REFERENCES users(id),
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_projects_tenant_id ON projects(tenant_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);

-- ═══════════════════════════════════════════════════════
-- 4. TASKS TABLE (Kanban cards)
-- ═══════════════════════════════════════════════════════

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assignee_id UUID REFERENCES users(id),
  reporter_id UUID REFERENCES users(id),
  position INTEGER DEFAULT 0, -- for drag-and-drop ordering
  due_date DATE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_tenant_id ON tasks(tenant_id);
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_assignee_id ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);

-- ═══════════════════════════════════════════════════════
-- 5. COMMENTS TABLE
-- ═══════════════════════════════════════════════════════

CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_comments_tenant_id ON comments(tenant_id);
CREATE INDEX idx_comments_task_id ON comments(task_id);
CREATE INDEX idx_comments_author_id ON comments(author_id);

-- ═══════════════════════════════════════════════════════
-- 6. ENABLE ROW LEVEL SECURITY (RLS)
-- ═══════════════════════════════════════════════════════

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════
-- 7. RLS POLICIES - TENANT ISOLATION
-- ═══════════════════════════════════════════════════════

-- Helper function to get user's tenant_id
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT tenant_id 
    FROM users 
    WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TENANTS: Users can only see their own tenant
CREATE POLICY "tenant_isolation" ON tenants
  FOR ALL
  USING (id = get_user_tenant_id());

-- USERS: Users can see other users in same tenant
CREATE POLICY "tenant_isolation_users" ON users
  FOR ALL
  USING (tenant_id = get_user_tenant_id());

-- PROJECTS: Users can only see projects in their tenant
CREATE POLICY "tenant_isolation_projects" ON projects
  FOR ALL
  USING (tenant_id = get_user_tenant_id());

-- TASKS: Users can only see tasks in their tenant
CREATE POLICY "tenant_isolation_tasks" ON tasks
  FOR ALL
  USING (tenant_id = get_user_tenant_id());

-- COMMENTS: Users can only see comments in their tenant
CREATE POLICY "tenant_isolation_comments" ON comments
  FOR ALL
  USING (tenant_id = get_user_tenant_id());

-- ═══════════════════════════════════════════════════════
-- 8. RLS POLICIES - ROLE-BASED ACCESS
-- ═══════════════════════════════════════════════════════

-- USERS: Admin can manage all users in tenant
CREATE POLICY "admin_manage_users" ON users
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- PROJECTS: All authenticated users can read, admin/manager can write
CREATE POLICY "users_read_projects" ON projects
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "admin_manager_write_projects" ON projects
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
    )
  );

-- TASKS: All authenticated users can read, assignee + admin/manager can write
CREATE POLICY "users_read_tasks" ON tasks
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "assignee_write_tasks" ON tasks
  FOR ALL
  USING (
    assignee_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'manager')
    )
  );

-- COMMENTS: All authenticated users can read/write in their tenant
CREATE POLICY "users_read_comments" ON comments
  FOR SELECT
  TO authenticated
  USING (tenant_id = get_user_tenant_id());

CREATE POLICY "users_write_comments" ON comments
  FOR ALL
  USING (
    tenant_id = get_user_tenant_id() AND
    author_id = auth.uid()
  );

-- ═══════════════════════════════════════════════════════
-- 9. TRIGGERS - AUTO UPDATE TIMESTAMPS
-- ═══════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════
-- 10. TRIGGERS - AUTO CREATE USER ON SIGNUP
-- ═══════════════════════════════════════════════════════

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert user record with default tenant (first tenant created)
  -- Note: In production, you'll want to handle tenant assignment differently
  INSERT INTO users (id, email, tenant_id, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    (SELECT id FROM tenants ORDER BY created_at LIMIT 1), -- Default to first tenant
    'member', -- Default role
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ═══════════════════════════════════════════════════════
-- 11. SEED DATA (FOR DEVELOPMENT)
-- ═══════════════════════════════════════════════════════

-- Create default tenant
INSERT INTO tenants (id, name, slug) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Default Tenant', 'default');

-- Note: Users will be created automatically via auth.signup()

-- ═══════════════════════════════════════════════════════
-- 12. COMMENTS & DOCUMENTATION
-- ═══════════════════════════════════════════════════════

COMMENT ON TABLE tenants IS 'Companies/organizations for multi-tenancy';
COMMENT ON TABLE users IS 'User profiles linked to Supabase Auth';
COMMENT ON TABLE projects IS 'Projects within a tenant';
COMMENT ON TABLE tasks IS 'Kanban tasks within projects';
COMMENT ON TABLE comments IS 'Comments on tasks';

COMMENT ON COLUMN users.role IS 'admin: full access, manager: manage projects/tasks, member: read + own tasks';
COMMENT ON COLUMN projects.status IS 'planning, active, on_hold, done, archived';
COMMENT ON COLUMN tasks.status IS 'todo, in_progress, review, done';
COMMENT ON COLUMN tasks.priority IS 'low, medium, high, urgent';
COMMENT ON COLUMN tasks.position IS 'For drag-and-drop ordering within project';
