-- ══════════════════════════════════════════════════════════════════════════════
-- NEXUS Business Management Platform — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ══════════════════════════════════════════════════════════════════════════════

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ── Enum types ────────────────────────────────────────────────────────────────

create type user_role as enum (
  'executive', 'admin',
  'sales_manager', 'sales_rep',
  'hr_manager',
  'accountant',
  'supply_chain_manager', 'supply_chain_staff'
);

create type deal_stage as enum (
  'lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'
);

create type po_status as enum (
  'draft', 'submitted', 'approved', 'rejected', 'received', 'cancelled'
);

create type contract_type as enum (
  'permanent', 'fixed_term', 'contract', 'probation'
);

create type leave_type as enum (
  'annual', 'sick', 'maternity', 'paternity', 'unpaid', 'compassionate'
);

create type leave_status as enum (
  'pending', 'approved', 'rejected', 'cancelled'
);

create type payment_status as enum (
  'paid', 'pending', 'overdue', 'partial'
);

create type audit_action as enum (
  'CREATE', 'UPDATE', 'DELETE', 'IMPORT', 'EXPORT', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT'
);

-- ── USERS ────────────────────────────────────────────────────────────────────

create table users (
  id            uuid primary key default uuid_generate_v4(),
  auth_id       uuid unique references auth.users(id) on delete cascade,
  name          text not null,
  email         text not null unique,
  role          user_role not null default 'sales_rep',
  department    text not null default '',
  team_id       uuid,
  avatar_url    text,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ── AUDIT LOG ─────────────────────────────────────────────────────────────────

create table audit_logs (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references users(id),
  user_name     text not null,
  user_role     user_role,
  module        text not null,
  action        audit_action not null,
  record_type   text not null,
  record_id     text not null,
  record_label  text not null default '',
  before_data   jsonb,
  after_data    jsonb,
  ip_address    inet,
  timestamp     timestamptz not null default now()
);

-- Audit log is insert-only — no updates or deletes
create policy "audit_insert_only" on audit_logs
  for insert to authenticated with check (true);
create policy "audit_select_exec" on audit_logs
  for select using (
    exists (select 1 from users where auth_id = auth.uid() and role in ('executive', 'admin'))
  );
alter table audit_logs enable row level security;

-- ── SALES: CUSTOMERS ─────────────────────────────────────────────────────────

create table customers (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  contact_name    text not null default '',
  email           text,
  phone           text,
  industry        text,
  assigned_rep_id uuid references users(id),
  status          text not null default 'prospect', -- prospect | active | inactive
  created_by      uuid references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  is_deleted      boolean not null default false
);

alter table customers enable row level security;

create policy "customers_access" on customers
  for all using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and (
        u.role in ('executive', 'admin', 'sales_manager')
        or (u.role = 'sales_rep' and (
          u.id = assigned_rep_id
          or u.team_id in (select team_id from users where id = assigned_rep_id)
        ))
      )
    )
  );

-- ── SALES: DEALS ─────────────────────────────────────────────────────────────

create table deals (
  id                    uuid primary key default uuid_generate_v4(),
  customer_id           uuid not null references customers(id),
  rep_id                uuid not null references users(id),
  title                 text not null,
  product               text,
  value                 numeric(14, 2) not null default 0,
  stage                 deal_stage not null default 'lead',
  expected_close_date   date,
  actual_close_date     date,
  notes                 text,
  created_by            uuid references users(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  is_deleted            boolean not null default false
);

alter table deals enable row level security;

create policy "deals_access" on deals
  for all using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and (
        u.role in ('executive', 'admin', 'sales_manager')
        or (u.role = 'sales_rep' and (
          u.id = rep_id
          or u.team_id in (select team_id from users where id = rep_id)
        ))
      )
    )
  );

-- ── SALES: TARGETS ───────────────────────────────────────────────────────────

create table sales_targets (
  id              uuid primary key default uuid_generate_v4(),
  rep_id          uuid not null references users(id),
  month           smallint not null check (month between 1 and 12),
  year            smallint not null,
  target_value    numeric(14, 2) not null default 0,
  achieved_value  numeric(14, 2) not null default 0,
  created_at      timestamptz not null default now(),
  unique (rep_id, month, year)
);

alter table sales_targets enable row level security;

-- ── SALES: ACTIVITIES ────────────────────────────────────────────────────────

create table activities (
  id            uuid primary key default uuid_generate_v4(),
  customer_id   uuid not null references customers(id),
  deal_id       uuid references deals(id),
  rep_id        uuid not null references users(id),
  type          text not null default 'call', -- call|meeting|email|demo|follow_up
  notes         text,
  scheduled_at  timestamptz,
  completed     boolean not null default false,
  created_at    timestamptz not null default now(),
  is_deleted    boolean not null default false
);

alter table activities enable row level security;

-- ── SUPPLY CHAIN: SUPPLIERS ───────────────────────────────────────────────────

create table suppliers (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  contact_name    text,
  email           text,
  phone           text,
  payment_terms   text,
  lead_time_days  integer not null default 7,
  rating          numeric(3,1) check (rating between 0 and 5),
  is_active       boolean not null default true,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  is_deleted      boolean not null default false
);

alter table suppliers enable row level security;

create policy "suppliers_access" on suppliers
  for all using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and u.role in ('executive','admin','supply_chain_manager','supply_chain_staff','accountant'))
  );

-- ── SUPPLY CHAIN: INVENTORY ───────────────────────────────────────────────────

create table inventory_items (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  sku               text unique,
  category          text,
  quantity_on_hand  numeric(14, 3) not null default 0,
  reorder_point     numeric(14, 3) not null default 0,
  unit_cost         numeric(14, 2) not null default 0,
  supplier_id       uuid references suppliers(id),
  last_restocked    timestamptz,
  created_by        uuid references users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  is_deleted        boolean not null default false
);

alter table inventory_items enable row level security;

create policy "inventory_access" on inventory_items
  for all using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and u.role in ('executive','admin','supply_chain_manager','supply_chain_staff','accountant','sales_manager'))
  );

-- ── SUPPLY CHAIN: PURCHASE ORDERS ────────────────────────────────────────────

create table purchase_orders (
  id                  uuid primary key default uuid_generate_v4(),
  po_number           text unique not null,
  supplier_id         uuid not null references suppliers(id),
  items               jsonb not null default '[]',
  total_value         numeric(14, 2) not null default 0,
  status              po_status not null default 'draft',
  created_by          uuid not null references users(id),
  approved_by         uuid references users(id),
  approval_date       timestamptz,
  expected_delivery   date,
  notes               text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  is_deleted          boolean not null default false
);

alter table purchase_orders enable row level security;

create policy "po_view" on purchase_orders
  for select using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and u.role in ('executive','admin','supply_chain_manager','supply_chain_staff','accountant'))
  );

create policy "po_insert" on purchase_orders
  for insert with check (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and u.role in ('executive','admin','supply_chain_manager'))
  );

-- ── HR: EMPLOYEES ─────────────────────────────────────────────────────────────

create table employees (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  email             text unique,
  department        text not null default '',
  role_title        text not null default '',
  contract_type     contract_type not null default 'permanent',
  start_date        date not null,
  contract_expiry   date,
  salary_band       text,
  manager_id        uuid references employees(id),
  is_active         boolean not null default true,
  avatar_url        text,
  created_by        uuid references users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  is_deleted        boolean not null default false
);

alter table employees enable row level security;

create policy "employees_hr_only" on employees
  for all using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and u.role in ('executive', 'admin', 'hr_manager'))
  );

-- ── HR: LEAVE REQUESTS ────────────────────────────────────────────────────────

create table leave_requests (
  id              uuid primary key default uuid_generate_v4(),
  employee_id     uuid not null references employees(id),
  leave_type      leave_type not null,
  start_date      date not null,
  end_date        date not null,
  days            integer not null,
  reason          text,
  status          leave_status not null default 'pending',
  approved_by     uuid references users(id),
  approval_note   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

alter table leave_requests enable row level security;

create policy "leave_hr_only" on leave_requests
  for all using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and u.role in ('executive', 'admin', 'hr_manager'))
  );

-- ── ACCOUNTING: INCOME ────────────────────────────────────────────────────────

create table income_entries (
  id                uuid primary key default uuid_generate_v4(),
  customer_id       uuid references customers(id),
  category          text not null,
  amount            numeric(14, 2) not null,
  date              date not null,
  payment_status    payment_status not null default 'pending',
  invoice_ref       text,
  notes             text,
  created_by        uuid not null references users(id),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  is_deleted        boolean not null default false
);

alter table income_entries enable row level security;

create policy "income_accounting_only" on income_entries
  for all using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and u.role in ('executive', 'admin', 'accountant'))
  );

-- ── ACCOUNTING: EXPENSES ──────────────────────────────────────────────────────

create table expense_entries (
  id                  uuid primary key default uuid_generate_v4(),
  supplier_id         uuid references suppliers(id),
  category            text not null,
  amount              numeric(14, 2) not null,
  date                date not null,
  approval_status     text not null default 'pending',
  approved_by         uuid references users(id),
  notes               text,
  created_by          uuid not null references users(id),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  is_deleted          boolean not null default false
);

alter table expense_entries enable row level security;

create policy "expenses_accounting_only" on expense_entries
  for all using (
    exists (select 1 from users u where u.auth_id = auth.uid()
      and u.role in ('executive', 'admin', 'accountant'))
  );

-- ── ACCOUNTING: BUDGETS ───────────────────────────────────────────────────────

create table budgets (
  id              uuid primary key default uuid_generate_v4(),
  department      text not null,
  year            smallint not null,
  month           smallint not null check (month between 1 and 12),
  budget_amount   numeric(14, 2) not null default 0,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (department, year, month)
);

alter table budgets enable row level security;

-- ── HELPERS: updated_at trigger ───────────────────────────────────────────────

create or replace function set_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

do $$
declare t text;
begin
  foreach t in array array['users','customers','deals','suppliers','inventory_items',
    'purchase_orders','employees','leave_requests','income_entries','expense_entries','budgets']
  loop
    execute format('create trigger set_updated_at before update on %I for each row execute function set_updated_at()', t);
  end loop;
end $$;

-- ── SEED: Admin user (update auth_id after creating in Supabase Auth) ─────────

insert into users (name, email, role, department) values
  ('Platform Admin', 'admin@nexus.com', 'executive', 'Management')
on conflict (email) do nothing;
