-- ============================================================
-- NEXUS Migration 004 — Fiscal Invoice Support
-- Adds: ZIMRA fiscal columns to invoices,
--       VAT exemption fields to customers,
--       currency + payment_method to invoices
-- ============================================================

-- ─── Extend: customers — VAT & TIN fields ────────────────────────────────────
ALTER TABLE customers
  ADD COLUMN IF NOT EXISTS tin               TEXT,          -- Taxpayer Identification No
  ADD COLUMN IF NOT EXISTS vat_number        TEXT,          -- VAT registration number
  ADD COLUMN IF NOT EXISTS is_vat_exempt     BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS vat_exemption_reason TEXT,       -- e.g. "Government entity", "Donor-funded project"
  ADD COLUMN IF NOT EXISTS account_type      TEXT NOT NULL DEFAULT 'standard',  -- standard | government | ngo | diplomatic
  ADD COLUMN IF NOT EXISTS credit_limit      NUMERIC(14,2),
  ADD COLUMN IF NOT EXISTS payment_terms     INTEGER NOT NULL DEFAULT 30;       -- days

-- ─── Extend: invoices — fiscal columns ───────────────────────────────────────
ALTER TABLE invoices
  -- Core fiscal identity
  ADD COLUMN IF NOT EXISTS invoice_type      TEXT NOT NULL DEFAULT 'fiscal',    -- fiscal | non_fiscal
  ADD COLUMN IF NOT EXISTS currency          TEXT NOT NULL DEFAULT 'USD',       -- USD | ZWG
  ADD COLUMN IF NOT EXISTS payment_method    TEXT NOT NULL DEFAULT 'BankTransfer', -- ZimraMoneyType

  -- ZIMRA submission result
  ADD COLUMN IF NOT EXISTS fiscal_status     TEXT NOT NULL DEFAULT 'pending',   -- pending | fiscalised | fiscalisation_failed | not_required
  ADD COLUMN IF NOT EXISTS zimra_receipt_id  BIGINT,
  ADD COLUMN IF NOT EXISTS zimra_fiscal_day_no    INTEGER,
  ADD COLUMN IF NOT EXISTS zimra_receipt_global_no INTEGER,
  ADD COLUMN IF NOT EXISTS zimra_receipt_counter   INTEGER,
  ADD COLUMN IF NOT EXISTS zimra_verification_code TEXT,
  ADD COLUMN IF NOT EXISTS zimra_qr_code_url       TEXT,
  ADD COLUMN IF NOT EXISTS zimra_device_signature  TEXT,    -- base64 hash from device signing
  ADD COLUMN IF NOT EXISTS zimra_server_signature  TEXT,    -- base64 hash from ZIMRA server
  ADD COLUMN IF NOT EXISTS zimra_submission_date   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zimra_server_date       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS zimra_error_code        TEXT,
  ADD COLUMN IF NOT EXISTS zimra_error_message     TEXT,

  -- Non-fiscal exemption tracking
  ADD COLUMN IF NOT EXISTS exemption_reason  TEXT,          -- populated for non_fiscal invoices

  -- Buyer info stored on invoice (snapshot at time of issue)
  ADD COLUMN IF NOT EXISTS buyer_name        TEXT,
  ADD COLUMN IF NOT EXISTS buyer_tin         TEXT,
  ADD COLUMN IF NOT EXISTS buyer_vat_number  TEXT;

-- Set existing invoices to not_required or pending based on invoice_type
UPDATE invoices SET fiscal_status = 'pending' WHERE fiscal_status = 'pending' AND invoice_type = 'fiscal';

-- ─── Index: fiscal lookups ────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_invoices_fiscal_status  ON invoices(fiscal_status);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_type   ON invoices(invoice_type);
CREATE INDEX IF NOT EXISTS idx_invoices_currency       ON invoices(currency);
CREATE INDEX IF NOT EXISTS idx_invoices_zimra_receipt  ON invoices(zimra_receipt_id) WHERE zimra_receipt_id IS NOT NULL;

-- ─── Index: customer TIN / VAT lookups ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_customers_tin           ON customers(tin) WHERE tin IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_customers_vat_exempt    ON customers(is_vat_exempt) WHERE is_vat_exempt = TRUE;

-- ─── Comment ─────────────────────────────────────────────────────────────────
COMMENT ON COLUMN invoices.invoice_type      IS 'fiscal = submitted to ZIMRA; non_fiscal = VAT-exempt customer';
COMMENT ON COLUMN invoices.fiscal_status     IS 'pending | fiscalised | fiscalisation_failed | not_required';
COMMENT ON COLUMN invoices.zimra_receipt_id  IS 'Receipt ID returned by ZIMRA FDMS after successful submission';
COMMENT ON COLUMN customers.is_vat_exempt    IS 'TRUE for government entities, NGOs, diplomatic missions, or other exempted buyers';
