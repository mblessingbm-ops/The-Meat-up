-- ============================================================
-- NEXUS Phase 4 Migration
-- Adds: in_app_notifications, sales_targets, expenses,
--       invoices, customers (extended), low_stock RPC
-- ============================================================

-- ─── In-App Notifications ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS in_app_notifications (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE,
  action_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE in_app_notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own notifications
CREATE POLICY "notifications_own_read" ON in_app_notifications
  FOR SELECT USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "notifications_own_update" ON in_app_notifications
  FOR UPDATE USING (
    user_id = (SELECT id FROM users WHERE auth_id = auth.uid())
  );

-- System can insert notifications for any user (via service role)
CREATE POLICY "notifications_system_insert" ON in_app_notifications
  FOR INSERT WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON in_app_notifications(user_id, is_read) WHERE is_read = FALSE;

-- ─── Sales Targets ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sales_targets (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  rep_id          UUID REFERENCES users(id),
  team_id         UUID,
  period_type     TEXT NOT NULL DEFAULT 'monthly',  -- 'monthly', 'quarterly', 'annual'
  period_year     INT NOT NULL,
  period_month    INT,          -- NULL for annual/quarterly
  period_quarter  INT,          -- NULL for monthly/annual
  target_amount   NUMERIC(14,2) NOT NULL,
  achieved_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(rep_id, period_year, period_month)
);

ALTER TABLE sales_targets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "targets_exec_all"    ON sales_targets FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('executive','admin'))
);
CREATE POLICY "targets_manager_all" ON sales_targets FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'sales_manager')
);
CREATE POLICY "targets_rep_own"     ON sales_targets FOR SELECT USING (
  rep_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

-- ─── Expenses ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  description      TEXT NOT NULL,
  amount           NUMERIC(12,2) NOT NULL,
  category         TEXT NOT NULL,
  expense_date     DATE NOT NULL,
  reference        TEXT,
  receipt_url      TEXT,
  notes            TEXT,
  status           TEXT NOT NULL DEFAULT 'pending',  -- pending, approved, rejected
  submitted_by_id  UUID NOT NULL REFERENCES users(id),
  approved_by_id   UUID REFERENCES users(id),
  approved_at      TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_exec_all"       ON expenses FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('executive','admin','accountant'))
);
CREATE POLICY "expenses_own_read"       ON expenses FOR SELECT USING (
  submitted_by_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);
CREATE POLICY "expenses_own_insert"     ON expenses FOR INSERT WITH CHECK (
  submitted_by_id = (SELECT id FROM users WHERE auth_id = auth.uid())
);

CREATE INDEX IF NOT EXISTS idx_expenses_date     ON expenses(expense_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_status   ON expenses(status);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

-- ─── Invoices ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number      TEXT NOT NULL UNIQUE,
  customer_id         UUID NOT NULL REFERENCES customers(id),
  amount              NUMERIC(14,2) NOT NULL,
  tax_amount          NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_amount        NUMERIC(14,2) NOT NULL,
  status              TEXT NOT NULL DEFAULT 'draft',  -- draft, sent, paid, overdue, cancelled
  issue_date          DATE NOT NULL,
  due_date            DATE NOT NULL,
  paid_date           DATE,
  payment_reference   TEXT,
  line_items          JSONB,
  notes               TEXT,
  deal_id             UUID REFERENCES deals(id),
  created_by_id       UUID REFERENCES users(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invoices_accounting_all" ON invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('executive','admin','accountant'))
);
CREATE POLICY "invoices_sales_read"     ON invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role IN ('sales_manager','sales_rep'))
);

CREATE INDEX IF NOT EXISTS idx_invoices_customer ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status   ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_number   ON invoices(invoice_number);

-- ─── RPC: count_low_stock ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION count_low_stock()
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INT
  FROM inventory_items
  WHERE quantity_on_hand <= reorder_point
    AND is_active = TRUE;
$$;

-- ─── Realtime: enable on key tables ──────────────────────────────────────────
-- Run in Supabase dashboard: Database > Replication
-- Or via SQL:
ALTER PUBLICATION supabase_realtime ADD TABLE deals;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory_items;
ALTER PUBLICATION supabase_realtime ADD TABLE purchase_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE leave_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE invoices;
ALTER PUBLICATION supabase_realtime ADD TABLE in_app_notifications;

-- ─── Seed: initial notification for existing overdue invoices ─────────────────
-- (Run after seeding invoices with overdue status)
-- INSERT INTO in_app_notifications (user_id, type, title, message, action_url)
-- SELECT u.id, 'invoice_overdue', 'Overdue Invoice Alert',
--   'Invoice ' || i.invoice_number || ' — ' || i.total_amount || ' USD is overdue.',
--   '/dashboard/accounting'
-- FROM invoices i
-- JOIN users u ON u.role IN ('accountant','executive')
-- WHERE i.status = 'overdue';
