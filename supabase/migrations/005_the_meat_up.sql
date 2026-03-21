-- ============================================================
-- The Meat Up — Supabase Schema Migration
-- Migration 005: Full schema for meat retail platform
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Settings ─────────────────────────────────────────────────────────────────
create table if not exists settings (
  id                   uuid primary key default uuid_generate_v4(),
  business_name        text not null default 'The Meat Up',
  owner_name           text not null default 'Owner',
  phone                text,
  email                text,
  address              text,
  default_currency     text not null default 'ZWG' check (default_currency in ('ZWG', 'USD')),
  invoice_prefix       text not null default 'TMU',
  invoice_start_number integer not null default 1,
  tax_rate             numeric(5,2) not null default 0,
  logo_url             text,
  updated_at           timestamptz default now()
);

-- Seed default settings row
insert into settings (business_name, owner_name, default_currency, invoice_prefix, invoice_start_number, tax_rate)
values ('The Meat Up', 'Owner', 'ZWG', 'TMU', 1, 0)
on conflict do nothing;

-- ─── Suppliers ────────────────────────────────────────────────────────────────
create table if not exists suppliers (
  id                      uuid primary key default uuid_generate_v4(),
  name                    text not null,
  contact_person          text,
  phone                   text,
  email                   text,
  categories              text[] default '{}',
  payment_terms           text default 'COD',
  outstanding_balance_zwg numeric(12,2) default 0,
  outstanding_balance_usd numeric(12,2) default 0,
  notes                   text,
  created_at              timestamptz default now()
);

-- ─── Products ─────────────────────────────────────────────────────────────────
create table if not exists products (
  id              uuid primary key default uuid_generate_v4(),
  name            text not null,
  category        text not null check (category in ('Beef','Pork','Chicken','Lamb','Processed','Other')),
  unit            text not null check (unit in ('kg','g','unit','pack')),
  stock_qty       numeric(12,3) not null default 0,
  reorder_level   numeric(12,3) not null default 0,
  cost_price_zwg  numeric(12,2) not null default 0,
  cost_price_usd  numeric(12,2) not null default 0,
  sell_price_zwg  numeric(12,2) not null default 0,
  sell_price_usd  numeric(12,2) not null default 0,
  supplier_id     uuid references suppliers(id) on delete set null,
  last_restocked  date,
  notes           text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- ─── Stock Movements ─────────────────────────────────────────────────────────
create table if not exists stock_movements (
  id              uuid primary key default uuid_generate_v4(),
  product_id      uuid not null references products(id) on delete cascade,
  movement_type   text not null check (movement_type in ('Purchase','Sale','Wastage','Write-off','Correction')),
  qty_change      numeric(12,3) not null,
  reason          text,
  date            date not null default current_date,
  notes           text,
  created_at      timestamptz default now()
);

-- ─── Clients ─────────────────────────────────────────────────────────────────
create table if not exists clients (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  phone      text,
  email      text,
  address    text,
  notes      text,
  created_at timestamptz default now()
);

-- ─── Invoices (Outgoing / Receivables) ───────────────────────────────────────
create table if not exists invoices (
  id             uuid primary key default uuid_generate_v4(),
  invoice_number text not null unique,
  client_id      uuid references clients(id) on delete set null,
  client_name    text not null,
  date_issued    date not null default current_date,
  due_date       date not null,
  currency       text not null default 'ZWG' check (currency in ('ZWG', 'USD')),
  subtotal       numeric(12,2) not null default 0,
  tax            numeric(12,2) not null default 0,
  total          numeric(12,2) not null default 0,
  amount_paid    numeric(12,2) not null default 0,
  status         text not null default 'Draft'
                 check (status in ('Draft','Sent','Partially Paid','Paid','Overdue')),
  notes          text,
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);

-- ─── Invoice Line Items ───────────────────────────────────────────────────────
create table if not exists invoice_items (
  id           uuid primary key default uuid_generate_v4(),
  invoice_id   uuid not null references invoices(id) on delete cascade,
  product_name text not null,
  qty          numeric(12,3) not null,
  unit         text not null,
  unit_price   numeric(12,2) not null,
  line_total   numeric(12,2) not null
);

-- ─── Payments Received ────────────────────────────────────────────────────────
create table if not exists payments_received (
  id         uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references invoices(id) on delete cascade,
  amount     numeric(12,2) not null,
  date       date not null default current_date,
  notes      text,
  created_at timestamptz default now()
);

-- ─── Expenses & Payables ─────────────────────────────────────────────────────
create table if not exists expenses (
  id          uuid primary key default uuid_generate_v4(),
  date        date not null default current_date,
  description text not null,
  category    text not null
              check (category in ('Rent','Utilities','Wages','Stock Purchase','Transport','Packaging','Other')),
  amount_zwg  numeric(12,2) not null default 0,
  amount_usd  numeric(12,2) not null default 0,
  supplier_id uuid references suppliers(id) on delete set null,
  status      text not null default 'Unpaid' check (status in ('Paid', 'Unpaid')),
  due_date    date,
  notes       text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────
create index if not exists idx_products_category on products(category);
create index if not exists idx_products_supplier on products(supplier_id);
create index if not exists idx_stock_movements_product on stock_movements(product_id);
create index if not exists idx_invoices_status on invoices(status);
create index if not exists idx_invoices_client on invoices(client_id);
create index if not exists idx_invoices_due_date on invoices(due_date);
create index if not exists idx_expenses_category on expenses(category);
create index if not exists idx_expenses_status on expenses(status);
create index if not exists idx_expenses_date on expenses(date);

-- ─── Overdue invoice auto-update ─────────────────────────────────────────────
-- A simple function that can be called or scheduled to mark invoices overdue
create or replace function mark_overdue_invoices()
returns void as $$
  update invoices
  set status = 'Overdue', updated_at = now()
  where due_date < current_date
    and status not in ('Paid', 'Overdue', 'Draft');
$$ language sql;
