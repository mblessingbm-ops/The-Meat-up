-- ============================================================
-- 006_usd_only_currency_model.sql
-- The Meat Up — migrations from dual ZWG/USD to single-currency
-- ============================================================

-- Settings: add ZWG toggle + rate ----------------------------
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS zwg_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS usd_to_zwg_rate NUMERIC(12,4) NOT NULL DEFAULT 1;

-- Ensure phone, email, address columns exist on settings
ALTER TABLE settings
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT;

-- Products: collapse dual prices to single USD fields --------
DO $$
BEGIN
  -- Add single USD price columns if not present
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price') THEN
    ALTER TABLE products ADD COLUMN cost_price NUMERIC(12,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sell_price') THEN
    ALTER TABLE products ADD COLUMN sell_price NUMERIC(12,2) NOT NULL DEFAULT 0;
  END IF;

  -- Migrate from dual columns if they existed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='cost_price_usd') THEN
    UPDATE products SET cost_price = cost_price_usd WHERE cost_price = 0;
    ALTER TABLE products DROP COLUMN IF EXISTS cost_price_usd;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='products' AND column_name='sell_price_usd') THEN
    UPDATE products SET sell_price = sell_price_usd WHERE sell_price = 0;
    ALTER TABLE products DROP COLUMN IF EXISTS sell_price_usd;
  END IF;
  ALTER TABLE products DROP COLUMN IF EXISTS cost_price_zwg;
  ALTER TABLE products DROP COLUMN IF EXISTS sell_price_zwg;
END;
$$;

-- Expenses: collapse dual amount columns to single + currency -
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='amount') THEN
    ALTER TABLE expenses ADD COLUMN amount NUMERIC(12,2) NOT NULL DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='currency') THEN
    ALTER TABLE expenses ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
  END IF;

  -- Migrate from dual column if existed
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='expenses' AND column_name='amount_usd') THEN
    UPDATE expenses SET amount = amount_usd, currency = 'USD' WHERE amount = 0;
    ALTER TABLE expenses DROP COLUMN IF EXISTS amount_usd;
    ALTER TABLE expenses DROP COLUMN IF EXISTS amount_zwg;
  END IF;
END;
$$;

-- Suppliers: outstanding_balance is single USD field ---------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='suppliers' AND column_name='outstanding_balance') THEN
    ALTER TABLE suppliers ADD COLUMN outstanding_balance NUMERIC(12,2) NOT NULL DEFAULT 0;
  END IF;
  ALTER TABLE suppliers DROP COLUMN IF EXISTS outstanding_balance_usd;
  ALTER TABLE suppliers DROP COLUMN IF EXISTS outstanding_balance_zwg;
END;
$$;

-- Invoices: single currency field (defaults USD) -------------
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='invoices' AND column_name='currency') THEN
    ALTER TABLE invoices ADD COLUMN currency TEXT NOT NULL DEFAULT 'USD';
  END IF;
END;
$$;

-- Insert default settings row if missing ---------------------
INSERT INTO settings (
  business_name, owner_name, invoice_prefix, invoice_start_number,
  tax_rate, zwg_enabled, usd_to_zwg_rate
)
SELECT 'The Meat Up', 'Owner', 'TMU', 1, 0, FALSE, 1
WHERE NOT EXISTS (SELECT 1 FROM settings LIMIT 1);
