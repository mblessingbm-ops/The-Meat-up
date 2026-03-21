# NEXUS — Business Management Platform

A cloud-based business management platform for manufacturing companies, covering Sales, Supply Chain, HR, and Accounting with a real-time executive dashboard.

---

## Tech Stack

| Layer        | Technology                     |
|--------------|--------------------------------|
| Frontend     | Next.js 14, React, TypeScript  |
| Styling      | Tailwind CSS                   |
| Animation    | Framer Motion                  |
| Database     | Supabase (PostgreSQL)          |
| Auth         | Supabase Auth + NextAuth       |
| Hosting      | Vercel                         |
| Charts       | Recharts                       |
| Email        | Resend                         |
| Exports      | SheetJS + jsPDF                |

---

## Quick Start (Local Development)

### 1. Clone & install
```bash
git clone <your-repo-url> nexus
cd nexus
npm install
```

### 2. Set up Supabase
1. Go to [supabase.com](https://supabase.com) and create a new project
   - **Region**: Select `af-south-1` (AWS Cape Town) for lowest latency from Zimbabwe/South Africa
2. In the Supabase dashboard → **SQL Editor**, paste and run the contents of:
   `supabase/migrations/001_initial_schema.sql`
3. Go to **Project Settings → API** and copy your keys

### 3. Configure environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` with your actual values:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
NEXTAUTH_SECRET=run: openssl rand -base64 32
RESEND_API_KEY=your_resend_key
```

### 4. Create your first admin user
1. In Supabase dashboard → **Authentication → Users** → **Invite user**
2. Enter `admin@nexus.com` (or your chosen admin email)
3. After the user is created, copy their UUID
4. In **SQL Editor**, run:
   ```sql
   update users set auth_id = 'paste-uuid-here' where email = 'admin@nexus.com';
   ```

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000)

---

## Deployment to Vercel

### One-click deploy
1. Push your repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Add all environment variables from `.env.example` in the Vercel dashboard
4. Deploy — Vercel auto-detects Next.js and configures everything

### Custom domain
1. In Vercel → **Project Settings → Domains** → add your domain
2. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` to your production URL
3. Redeploy

---

## User Roles & Access

| Role                   | Dashboard | Sales      | Supply Chain | HR         | Accounting |
|------------------------|-----------|------------|--------------|------------|------------|
| Executive / Admin      | Full      | Full       | Full         | Full       | Full       |
| Sales Manager          | Sales     | Full       | View         | —          | —          |
| Sales Rep              | Own KPIs  | Own + Team | —            | —          | —          |
| HR Manager             | HR        | —          | —            | Full       | —          |
| Accountant             | Finance   | —          | View         | —          | Full       |
| Supply Chain Manager   | Inventory | —          | Full         | —          | —          |
| Supply Chain Staff     | Inventory | —          | View         | —          | —          |

---

## Project Structure

```
nexus/
├── app/
│   ├── auth/login/          # Login page
│   ├── (dashboard)/         # Protected dashboard layout
│   │   ├── page.tsx          # Executive dashboard
│   │   ├── sales/            # Sales module
│   │   ├── supply-chain/     # Supply chain module
│   │   ├── hr/               # HR module
│   │   ├── accounting/       # Accounting module
│   │   ├── audit-trail/      # Audit log viewer
│   │   └── admin/users/      # User management
│   ├── layout.tsx            # Root layout (fonts, toast)
│   └── globals.css           # Design system CSS
├── components/
│   ├── layout/               # Sidebar, TopBar
│   ├── dashboard/            # Dashboard widgets
│   └── shared/               # Reusable UI components
├── lib/
│   ├── supabase.ts           # Supabase client
│   └── utils.ts              # Formatters, helpers
├── types/
│   └── index.ts              # All TypeScript types
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Full DB schema
```

---

## Pastel ERP Integration

The system integrates with Pastel via a CSV/Excel import pipeline:

1. Export from Pastel (inventory report, trial balance, customer list)
2. Upload the file in NEXUS → **Import Centre** (coming in Phase 3)
3. NEXUS maps columns, previews data, and commits on confirmation
4. All imports are logged in the Audit Trail

**Required Pastel exports:**
- Inventory → `Stock Items Report` (CSV)
- Accounting → `Trial Balance` (CSV/Excel)
- Customers → `Customer Listing` (CSV)

---

## Build Phases

| Phase | Scope                              | Status          |
|-------|------------------------------------|-----------------|
| 1     | Foundation, auth, nav, dashboard   | ✅ Complete      |
| 2     | Sales module (full)                | ✅ Complete      |
| 3     | Supply Chain + HR (full)           | 🔄 In progress  |
| 4     | Accounting + Pastel import + Polish| ⏳ Upcoming     |

---

## Email Notifications (Resend)

Configure in `.env.local`:
```
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=notifications@yourdomain.com
```

Notification triggers implemented in Phase 2+:
- Deal closed won/lost → Sales Manager
- Rep target milestones (50%, 100%) → Rep + Manager
- Stock below reorder point → Supply Chain Manager
- Leave requests → HR Manager
- Contract expiry (60d, 30d) → HR Manager
- Overdue invoices (7d, 14d) → Accountant + Executive

---

## Support

For setup assistance or questions, contact your development team.
