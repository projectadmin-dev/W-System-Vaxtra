# W System v2 — Setup Guide

**Fresh Supabase project untuk W System v2**
Created: 2026-05-04

---

## 📋 Prerequisites

1. **Supabase Account:** https://supabase.com/dashboard
2. **Node.js:** v20+ (already installed: v24.14.1)
3. **Supabase CLI:** v2.90.0+ (already installed)
4. **pnpm:** `npm install -g pnpm`

---

## 🚀 Step 1: Create Supabase Project

### Manual Setup (via Dashboard)

1. **Go to:** https://supabase.com/dashboard
2. **Click:** "New Project"
3. **Fill in:**
   - **Organization:** Ganjar AI Company (or create new)
   - **Project Name:** `wsystem-v2`
   - **Database Password:** [Generate strong password - save it!]
   - **Region:** `Singapore (ap-southeast-1)` ← closest to Asia/Shanghai
   - **Pricing Plan:** Free (cukup untuk development)
4. **Click:** "Create new project"
5. **Wait:** 2-5 minutes for provisioning

### Get Credentials

After project ready:

1. **Navigate to:** `Settings` → `API` (sidebar)
2. **Copy:**
   ```
   Project URL: https://[PROJECT_REF].supabase.co
   anon/public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (⚠️ SECRET!)
   Project Ref: [PROJECT_REF] (e.g., kcbtehpcdltvdijgsrsb)
   ```

3. **Save credentials** — kasih tahu Claw untuk update `TOOLS.md`

---

## 🛠️ Step 2: Initialize Supabase CLI

```bash
cd /home/ubuntu/apps/wsystem-v2

# Login to Supabase
supabase login

# Initialize local project
supabase init

# Link to remote project (replace with your PROJECT_REF)
supabase link --project-ref [YOUR_PROJECT_REF]
```

---

## 📝 Step 3: Apply Initial Schema

### Option A: Via Dashboard (Easy)

1. **Go to:** SQL Editor (di Supabase Dashboard)
2. **Copy:** Content dari `supabase/migrations/20260504000001_init_schema.sql`
3. **Paste & Run** di SQL Editor
4. **Verify:** Tables created (tenants, users, projects, tasks, comments)

### Option B: Via CLI (Recommended)

```bash
cd /home/ubuntu/apps/wsystem-v2

# Push migrations to remote
supabase db push
```

---

## 🔑 Step 4: Generate TypeScript Types

```bash
cd /home/ubuntu/apps/wsystem-v2

# Generate types from schema
supabase gen types typescript --linked > lib/supabase-types.ts

# Or from specific project
supabase gen types typescript --project-ref [YOUR_PROJECT_REF] > lib/supabase-types.ts
```

**Output:** `/home/ubuntu/apps/wsystem-v2/lib/supabase-types.ts`

---

## 📁 Step 5: Setup Environment Variables

Create `.env.local` di root project:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY] # ⚠️ Never expose to client!
SUPABASE_PAT=[YOUR_PAT] # For Management API access

# App
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_NAME=W System v2
```

**⚠️ Security:**
- Add `.env.local` ke `.gitignore`
- Never commit `.env.local` ke git
- Use `.env.example` untuk template

---

## 🏗️ Schema Overview

### Tables Created

| Table | Purpose | RLS Policy |
|-------|---------|------------|
| `tenants` | Companies/organizations | User can only see their tenant |
| `users` | User profiles (linked to auth) | Same tenant isolation |
| `projects` | Projects within tenant | Read: all auth users, Write: admin/manager |
| `tasks` | Kanban cards | Read: all, Write: assignee + admin/manager |
| `comments` | Task comments | Read: all, Write: author only |

### RLS (Row Level Security)

**Key Improvement dari wsystem-1:**
- ✅ Uses `auth.uid()` instead of `current_setting()` (no empty string issue!)
- ✅ Explicit tenant association in `users` table
- ✅ Helper function `get_user_tenant_id()` for consistent policy
- ✅ Role-based access (admin, manager, member)

### User Roles

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all resources in tenant |
| **manager** | Manage projects + tasks, read-only users |
| **member** | Read projects, manage own tasks, add comments |

---

## 🧪 Step 6: Test Setup

### Create First Tenant

```sql
-- Run in Supabase SQL Editor
INSERT INTO tenants (id, name, slug)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Ganjar AI Company',
  'ganjar-ai'
);
```

### Create First User (via Signup)

```typescript
// In your app (or test script)
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const { data, error } = await supabase.auth.signUp({
  email: 'ganjar@example.com',
  password: 'securepassword123',
  options: {
    data: {
      full_name: 'Ganjar Rizkiawan'
    }
  }
})

// User should be auto-created in users table via trigger
```

### Verify RLS

```sql
-- Test: Try to access another tenant's data
-- Should return 0 rows (RLS blocking)
SELECT * FROM projects 
WHERE tenant_id != '00000000-0000-0000-0000-000000000001';
```

---

## 📊 Database Diagram

```
┌─────────────┐
│   tenants   │
│─────────────│
│ id (UUID)   │
│ name (TEXT) │
│ slug (TEXT) │
└──────┬──────┘
       │
       │ 1:N
       ▼
┌─────────────┐         ┌──────────────┐
│    users    │         │   projects   │
│─────────────│         │──────────────│
│ id (UUID)   │         │ id (UUID)    │
│ tenant_id   │         │ tenant_id    │
│ email       │         │ name         │
│ role        │         │ status       │
└──────┬──────┘         └──────┬───────┘
       │                       │
       │ 1:N                   │ 1:N
       │                       ▼
       │                ┌──────────────┐
       │                │    tasks     │
       │                │──────────────│
       │                │ id (UUID)    │
       │                │ project_id   │
       │                │ assignee_id ─┼───┐
       │                │ status       │   │
       │                └──────┬───────┘   │
       │                       │           │
       │                       │ 1:N       │
       │                       ▼           │
       │                ┌──────────────┐   │
       └───────────────▶│   comments   │   │
                        │──────────────│   │
                        │ task_id      │   │
                        │ author_id ───┼───┘
                        └──────────────┘
```

---

## 🎯 Next Steps

1. ✅ **Create Supabase project** (manual via dashboard)
2. ✅ **Apply initial schema** (SQL Editor or `supabase db push`)
3. ✅ **Generate TypeScript types** (`supabase gen types`)
4. ✅ **Setup `.env.local`** (credentials)
5. ⏳ **Create Next.js 16 project scaffold** (Claw akan handle ini)
6. ⏳ **Implement auth flow** (login, signup, middleware)
7. ⏳ **Build Kanban board** (drag-and-drop, Server Actions)

---

## 🐛 Troubleshooting

### Issue: `supabase link` fails
**Solution:** Make sure you're logged in: `supabase login`

### Issue: RLS policies blocking all access
**Solution:** Check if user has proper tenant_id in `users` table

### Issue: `auth.uid()` returns NULL
**Solution:** User not authenticated, check auth session

### Issue: Types not generating
**Solution:** Make sure project is linked: `supabase link --project-ref [REF]`

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **RLS Guide:** https://supabase.com/docs/guides/auth/row-level-security
- **Next.js Integration:** https://supabase.com/docs/guides/getting-started/quickstarts/nextjs
- **TypeScript Types:** https://supabase.com/docs/guides/api/rest/generating-types

---

**Status:** Ready for Next.js project scaffold
**Last Updated:** 2026-05-04
**Maintained By:** Claw (OpenClaw)
