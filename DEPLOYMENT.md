# NEXUS — Deployment Guide

## Prerequisites

- Node.js 18+
- A Supabase account (free tier works)
- A Resend account for email (free tier: 3,000 emails/month)
- Vercel account (recommended) or any Node.js host

---

## 1. Supabase Setup

### Create Project

1. Go to [supabase.com](https://supabase.com) → New Project
2. Name: `nexus-prod` · Region: closest to your team · Generate a strong DB password
3. Wait ~2 minutes for provisioning

### Run Migrations

In the Supabase SQL Editor, run each file in order:

```sql
-- Paste contents of:
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_phase3.sql
supabase/migrations/003_phase4.sql
```

### Enable Realtime

Go to **Database → Replication** and enable realtime for:
- `deals`
- `inventory_items`
- `purchase_orders`
- `leave_requests`
- `invoices`
- `in_app_notifications`

### Configure Auth

1. **Authentication → Providers → Email**: enable email/password
2. **Authentication → URL Configuration**:
   - Site URL: `https://nexus.yourcompany.com`
   - Redirect URLs: `https://nexus.yourcompany.com/auth/callback`
3. **Authentication → Email Templates**: customise invite and password reset emails

### Get API Keys

Settings → API:
- `URL` → `NEXT_PUBLIC_SUPABASE_URL`
- `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

---

## 2. Email Setup (Resend)

1. Create account at [resend.com](https://resend.com)
2. **Domains** → Add your company domain → follow DNS verification steps
3. **API Keys** → Create key → copy to `RESEND_API_KEY`
4. Set `RESEND_FROM_EMAIL` to a verified address on your domain

**Emails NEXUS sends automatically:**
| Trigger | Template | Recipient |
|---------|----------|-----------|
| Stock below reorder point | Low stock alert | SC Manager |
| Leave request submitted | Leave notification | HR Manager |
| Leave approved/rejected | Decision email | Employee |
| Contract expiry at 60/30 days | Expiry warning | HR Manager |
| PO approved/rejected | PO status update | PO creator |
| Sales target milestone (50%/100%) | Milestone email | Sales Rep |
| Invoice overdue | Overdue alert | Accounts |

---

## 3. Local Development

```bash
# Clone / unzip the project
cd nexus

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# → Fill in your Supabase and Resend keys

# Start dev server
npm run dev
# → Open http://localhost:3000
```

---

## 4. Deploy to Vercel

```bash
npm install -g vercel
vercel login
vercel --prod
```

During setup, add all environment variables from `.env.example`.

Or connect via the Vercel dashboard: New Project → Import Git repo → add env vars → Deploy.

**Recommended Vercel settings:**
- Framework: Next.js
- Node version: 18.x
- Build command: `npm run build` (default)
- Output directory: `.next` (default)

---

## 5. First Login & User Setup

1. In Supabase → Authentication → Users → Invite User
2. Enter your email → an invite link is sent
3. After signing up, run this SQL to set your role:

```sql
-- Set the first user as executive/admin
UPDATE users
SET role = 'executive', is_active = TRUE
WHERE email = 'your@email.com';
```

4. For additional users, use NEXUS → Admin → User Management → Invite User

---

## 6. Pastel Import Setup

NEXUS supports importing from Pastel Partner via CSV/Excel.

**Supported import types:**
| Type | Pastel Report | NEXUS Module |
|------|--------------|--------------|
| Stock Inventory | Stock Items | Supply Chain → Inventory |
| Customers | Customer Listing | Sales → Customers |
| Suppliers | Supplier Listing | Supply Chain → Suppliers |
| Trial Balance | Trial Balance | Accounting |

**How to export from Pastel:**
1. Reports menu → select report type
2. Filter: active records only, current period
3. Export → CSV or Excel (.xlsx)
4. Upload in NEXUS → Supply Chain → Import Centre

**Column mapping is pre-configured** for standard Pastel exports.
Contact your NEXUS administrator if your Pastel uses custom column headers.

---

## 7. Scheduled Jobs

Some NEXUS features require scheduled triggers. Set these up in Supabase:

**Database → Cron Jobs** (uses pg_cron extension):

```sql
-- Check overdue invoices daily at 8am UTC
SELECT cron.schedule(
  'check-overdue-invoices',
  '0 8 * * *',
  $$SELECT net.http_post(url := 'https://nexus.yourcompany.com/api/accounting/invoices', body := '{"method":"PUT"}')$$
);

-- Check contract expiries daily at 8am UTC
SELECT cron.schedule(
  'check-contract-expiry',
  '0 8 * * *',
  $$SELECT net.http_post(url := 'https://nexus.yourcompany.com/api/hr/employees', body := '{"method":"PUT"}')$$
);
```

Or use Vercel Cron Jobs in `vercel.json`:

```json
{
  "crons": [
    { "path": "/api/accounting/invoices", "schedule": "0 8 * * *" },
    { "path": "/api/hr/employees",        "schedule": "0 8 * * *" }
  ]
}
```

---

## 8. Post-Deployment Checklist

- [ ] All migrations applied successfully
- [ ] Realtime enabled on key tables
- [ ] Test email delivery via Resend
- [ ] First admin user created and role set
- [ ] Test Pastel import with sample file
- [ ] Vercel environment variables all set
- [ ] Custom domain pointed to Vercel deployment
- [ ] Auth redirect URL updated in Supabase to match domain

---

## Architecture Overview

```
Browser (Next.js 14 App Router)
  │
  ├── /app/(dashboard)/        ← Module pages (Sales, HR, SC, Accounting)
  ├── /app/api/                ← API routes (server-side, uses service role)
  ├── /components/             ← Shared UI components
  ├── /hooks/                  ← Data fetching hooks (useSupplyChain, useHR, etc.)
  ├── /lib/
  │   ├── supabase.ts          ← Browser Supabase client
  │   ├── supabase-server.ts   ← Server Supabase client (service role)
  │   ├── email/notifications.ts ← Resend email templates
  │   └── importPipeline.ts    ← Pastel CSV/Excel parser
  └── /supabase/migrations/    ← SQL schema files

Supabase
  ├── PostgreSQL database       ← All data
  ├── Row Level Security (RLS)  ← Role-based data access
  ├── Supabase Auth             ← User sessions
  └── Realtime                  ← Live subscriptions

Resend
  └── Transactional emails      ← Triggered by API route events
```
