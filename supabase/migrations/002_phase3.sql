-- ============================================================
-- NEXUS Phase 3 Migration
-- Adds: approval workflow fields, approval_note, notification_log
-- ============================================================

-- Purchase order approval fields
ALTER TABLE purchase_orders
  ADD COLUMN IF NOT EXISTS approval_date  TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approval_note  TEXT;

-- Leave request approval note
ALTER TABLE leave_requests
  ADD COLUMN IF NOT EXISTS approval_note  TEXT;

-- Employee fields for Phase 3
ALTER TABLE employees
  ADD COLUMN IF NOT EXISTS national_id      TEXT,
  ADD COLUMN IF NOT EXISTS phone            TEXT,
  ADD COLUMN IF NOT EXISTS probation_months INT DEFAULT 3,
  ADD COLUMN IF NOT EXISTS working_hours    INT DEFAULT 40,
  ADD COLUMN IF NOT EXISTS onboarding_notes TEXT;

-- Notification log — track every email sent
CREATE TABLE IF NOT EXISTS notification_log (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type          TEXT NOT NULL,          -- 'stock_alert', 'leave_request', etc.
  recipient     TEXT NOT NULL,          -- email address
  subject       TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'sent',  -- 'sent', 'failed'
  related_id    TEXT,                   -- optional FK to the related record
  related_type  TEXT,                   -- 'LeaveRequest', 'PurchaseOrder', etc.
  sent_at       TIMESTAMPTZ DEFAULT NOW(),
  error_message TEXT
);

-- RLS for notification_log — admins and executives only
ALTER TABLE notification_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_log_admin_read" ON notification_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE auth_id = auth.uid()
      AND role IN ('admin', 'executive')
    )
  );

CREATE POLICY "notification_log_system_insert" ON notification_log
  FOR INSERT WITH CHECK (true);  -- system inserts via service role

-- Import history table — tracks all Pastel imports
CREATE TABLE IF NOT EXISTS import_history (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  import_type   TEXT NOT NULL,     -- 'inventory', 'customers', etc.
  file_name     TEXT NOT NULL,
  rows_imported INT  NOT NULL DEFAULT 0,
  rows_errored  INT  NOT NULL DEFAULT 0,
  imported_by   UUID REFERENCES users(id),
  imported_at   TIMESTAMPTZ DEFAULT NOW(),
  notes         TEXT
);

ALTER TABLE import_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "import_history_read" ON import_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users WHERE auth_id = auth.uid()
      AND role IN ('admin', 'executive', 'supply_chain_manager', 'accountant')
    )
  );

CREATE POLICY "import_history_insert" ON import_history
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM users WHERE auth_id = auth.uid()
      AND role IN ('admin', 'supply_chain_manager', 'accountant')
    )
  );

-- Index for fast notification log queries
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(type);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent_at ON notification_log(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_import_history_type ON import_history(import_type);
