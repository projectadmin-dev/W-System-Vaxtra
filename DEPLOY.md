# W System v2 - Deployment Guide

## 🚀 Deploy to Vercel

### Prerequisites

- GitHub account with access to `projectadmin-dev/W-System-Vaxtra` repo
- Vercel account (free tier works)
- Supabase project credentials

### Step 1: Connect Vercel to GitHub

1. Go to [vercel.com](https://vercel.com) and login
2. Click **"Add New Project"**
3. Select **"Import Git Repository"**
4. Choose `projectadmin-dev/W-System-Vaxtra`
5. Click **"Import"**

### Step 2: Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `pnpm build`
- **Output Directory:** `.next`
- **Install Command:** `pnpm install`

### Step 3: Add Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```
NEXT_PUBLIC_SUPABASE_URL=https://raelymffiajrtgbcxqse.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Get your anon key from:**
- Supabase Dashboard → Project Settings → API
- Copy **"anon public"** key (NOT service role key!)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build (~2-3 minutes)
3. Vercel will provide production URL (e.g., `https://wsystem-v2.vercel.app`)

### Step 5: Configure Supabase Auth

In Supabase Dashboard → Authentication → URL Configuration:

**Add these URLs:**
- **Site URL:** `https://your-vercel-url.vercel.app`
- **Redirect URLs:** 
  - `https://your-vercel-url.vercel.app/auth/callback`
  - `https://your-vercel-url.vercel.app/dashboard`
  - `http://localhost:3030/auth/callback` (for local dev)

### Step 6: Test Production

1. Visit your Vercel URL
2. Try signing up with a test email
3. Check email for confirmation link
4. Login and verify dashboard works
5. Create a project and test Kanban board

---

## 🛠️ Local Development

### Setup

```bash
cd /home/ubuntu/apps/wsystem-v2

# Install dependencies
pnpm install

# Copy env file
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local

# Run dev server (port 3030)
pnpm dev
```

### Access

- **Local:** http://localhost:3030
- **Network:** http://10.3.9.134:3030

---

## 📦 Production Checklist

Before deploying to production:

- [ ] Environment variables set in Vercel
- [ ] Supabase redirect URLs configured
- [ ] Email confirmation enabled in Supabase
- [ ] RLS policies tested
- [ ] All features tested locally
- [ ] GitHub repo is up-to-date
- [ ] `.env.local` NOT committed (in .gitignore)

---

## 🔧 Troubleshooting

### Build Fails

**Error: Module not found**
```bash
pnpm install
git add pnpm-lock.yaml
git commit -m "Update lock file"
git push
```

### Auth Not Working

1. Check Supabase redirect URLs match your Vercel URL
2. Verify anon key is correct (not service role key)
3. Check browser console for errors

### Database Errors

1. Verify RLS policies are enabled
2. Check user has correct tenant_id
3. Review Supabase logs for detailed errors

---

## 📊 Monitoring

### Vercel Analytics

- Dashboard → Analytics → Enable Web Analytics
- Track page views and performance

### Supabase Logs

- Dashboard → Logs → Real-time logs
- Filter by table or function

---

## 🎯 Post-Deploy Tasks

1. **Custom Domain** (optional)
   - Vercel Settings → Domains → Add your domain
   - Update DNS records

2. **Environment-Specific Config**
   - Use Vercel preview deployments for testing
   - Separate staging/production environments

3. **Backup Strategy**
   - Enable Supabase daily backups
   - Export database schema regularly

---

**Last Updated:** 2026-05-04
**Version:** 1.0.0
