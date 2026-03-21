import * as XLSX from 'xlsx'

// ─── Import types ─────────────────────────────────────────────────────────────

export type ImportType = 'inventory' | 'customers' | 'trial_balance' | 'suppliers'

export interface ImportColumn {
  sourceHeader: string    // Column name in the uploaded file
  targetField: string     // Field in NEXUS schema
  targetLabel: string     // Human-readable label
  required: boolean
  transform?: (value: string) => unknown
}

export interface ImportMapping {
  type: ImportType
  columns: ImportColumn[]
}

export interface ImportPreviewRow {
  [key: string]: unknown
}

export interface ImportResult {
  preview: ImportPreviewRow[]
  totalRows: number
  headers: string[]
  errors: string[]
  mapping: ImportMapping
}

// ─── Default column mappings per import type ──────────────────────────────────
// These are configured to match Pastel's default export column names.
// If your Pastel reports use different headers, update these mappings.

const MAPPINGS: Record<ImportType, ImportColumn[]> = {
  inventory: [
    { sourceHeader: 'Stock Code',       targetField: 'sku',               targetLabel: 'SKU',               required: true  },
    { sourceHeader: 'Description',      targetField: 'name',              targetLabel: 'Item Name',          required: true  },
    { sourceHeader: 'Category',         targetField: 'category',          targetLabel: 'Category',           required: false },
    { sourceHeader: 'Qty On Hand',      targetField: 'quantity_on_hand',  targetLabel: 'Qty On Hand',        required: true,  transform: v => parseFloat(v) || 0 },
    { sourceHeader: 'Reorder Level',    targetField: 'reorder_point',     targetLabel: 'Reorder Point',      required: false, transform: v => parseFloat(v) || 0 },
    { sourceHeader: 'Cost Price',       targetField: 'unit_cost',         targetLabel: 'Unit Cost',          required: false, transform: v => parseFloat(v.replace(/[^0-9.]/g, '')) || 0 },
    { sourceHeader: 'Supplier',         targetField: 'supplier_name',     targetLabel: 'Supplier Name',      required: false },
  ],
  customers: [
    { sourceHeader: 'Account Code',     targetField: 'id',                targetLabel: 'Account Code',       required: true  },
    { sourceHeader: 'Account Name',     targetField: 'name',              targetLabel: 'Customer Name',      required: true  },
    { sourceHeader: 'Contact',          targetField: 'contact_name',      targetLabel: 'Contact Person',     required: false },
    { sourceHeader: 'Email',            targetField: 'email',             targetLabel: 'Email',              required: false },
    { sourceHeader: 'Telephone',        targetField: 'phone',             targetLabel: 'Phone',              required: false },
    { sourceHeader: 'Category',         targetField: 'industry',          targetLabel: 'Industry',           required: false },
  ],
  trial_balance: [
    { sourceHeader: 'Account Code',     targetField: 'account_code',      targetLabel: 'Account Code',       required: true  },
    { sourceHeader: 'Account Name',     targetField: 'account_name',      targetLabel: 'Account Name',       required: true  },
    { sourceHeader: 'Debit',            targetField: 'debit',             targetLabel: 'Debit',              required: false, transform: v => parseFloat(v.replace(/[^0-9.]/g, '')) || 0 },
    { sourceHeader: 'Credit',           targetField: 'credit',            targetLabel: 'Credit',             required: false, transform: v => parseFloat(v.replace(/[^0-9.]/g, '')) || 0 },
    { sourceHeader: 'Period',           targetField: 'period',            targetLabel: 'Period',             required: false },
  ],
  suppliers: [
    { sourceHeader: 'Supplier Code',    targetField: 'id',                targetLabel: 'Supplier Code',      required: true  },
    { sourceHeader: 'Supplier Name',    targetField: 'name',              targetLabel: 'Supplier Name',      required: true  },
    { sourceHeader: 'Contact',          targetField: 'contact_name',      targetLabel: 'Contact Person',     required: false },
    { sourceHeader: 'Email',            targetField: 'email',             targetLabel: 'Email',              required: false },
    { sourceHeader: 'Telephone',        targetField: 'phone',             targetLabel: 'Phone',              required: false },
    { sourceHeader: 'Payment Terms',    targetField: 'payment_terms',     targetLabel: 'Payment Terms',      required: false },
    { sourceHeader: 'Lead Time (Days)', targetField: 'lead_time_days',    targetLabel: 'Lead Time (Days)',   required: false, transform: v => parseInt(v) || 7 },
  ],
}

// ─── Parse a file buffer (CSV or XLSX) ───────────────────────────────────────

export function parseImportFile(
  buffer: ArrayBuffer,
  fileName: string
): { headers: string[]; rows: Record<string, string>[]; error?: string } {
  try {
    const workbook = XLSX.read(buffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const raw = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, { defval: '' })

    if (raw.length === 0) return { headers: [], rows: [], error: 'File appears to be empty.' }

    const headers = Object.keys(raw[0])
    return { headers, rows: raw }
  } catch {
    return { headers: [], rows: [], error: `Could not parse file "${fileName}". Ensure it is a valid .xlsx or .csv file.` }
  }
}

// ─── Map rows using column definitions ───────────────────────────────────────

export function mapRows(
  rows: Record<string, string>[],
  columns: ImportColumn[],
  customMapping?: Record<string, string> // sourceHeader → targetField overrides
): { mapped: ImportPreviewRow[]; errors: string[] } {
  const errors: string[] = []
  const activeColumns = columns.map(col => ({
    ...col,
    effectiveSource: customMapping?.[col.targetField] ?? col.sourceHeader,
  }))

  const mapped = rows.map((row, idx) => {
    const result: ImportPreviewRow = {}
    for (const col of activeColumns) {
      const rawValue = row[col.effectiveSource] ?? ''
      if (col.required && rawValue === '') {
        errors.push(`Row ${idx + 2}: Missing required field "${col.targetLabel}"`)
      }
      result[col.targetField] = col.transform ? col.transform(rawValue) : rawValue
    }
    return result
  })

  return { mapped, errors: Array.from(new Set(errors)).slice(0, 20) } // dedupe and cap errors
}

// ─── Full import pipeline ─────────────────────────────────────────────────────

export async function processImport(
  buffer: ArrayBuffer,
  fileName: string,
  importType: ImportType,
  customMapping?: Record<string, string>
): Promise<ImportResult> {
  const columns = MAPPINGS[importType]
  const { headers, rows, error } = parseImportFile(buffer, fileName)

  if (error) {
    return { preview: [], totalRows: 0, headers: [], errors: [error], mapping: { type: importType, columns } }
  }

  const { mapped, errors } = mapRows(rows, columns, customMapping)

  // Check required columns are present in file
  const missingRequired = columns
    .filter(c => c.required)
    .filter(c => {
      const source = customMapping?.[c.targetField] ?? c.sourceHeader
      return !headers.includes(source)
    })
    .map(c => `Required column "${c.sourceHeader}" not found in file.`)

  return {
    preview: mapped.slice(0, 10), // first 10 rows for preview
    totalRows: rows.length,
    headers,
    errors: [...missingRequired, ...errors],
    mapping: { type: importType, columns },
  }
}

// ─── Export helpers ───────────────────────────────────────────────────────────

export function exportToExcel(
  data: Record<string, unknown>[],
  sheetName: string,
  fileName: string
): Buffer {
  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer
}

export { MAPPINGS }
