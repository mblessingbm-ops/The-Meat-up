'use client'

/**
 * app/(dashboard)/dashboard/stock/page.tsx
 * The Meat Up — Stock / Inventory Management
 * USD-only. Conditional ZWG secondary price shown when zwg_enabled.
 */

import { useState, useMemo } from 'react'
import { Package, Plus, Search, Download, AlertTriangle, ChevronUp, ChevronDown, Pencil, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import type { Product, ProductCategory, UnitOfMeasure, StockMovementType } from '@/types'
import { useSettings } from '@/context/SettingsContext'

// ─── Mock Data ─────────────────────────────────────────────────────────────────
const CATEGORIES: ProductCategory[] = ['Beef', 'Pork', 'Chicken', 'Lamb', 'Processed', 'Other']
const UNITS: UnitOfMeasure[] = ['kg', 'g', 'unit', 'pack']
const MOVEMENT_TYPES: StockMovementType[] = ['Purchase', 'Sale', 'Wastage', 'Write-off', 'Correction']

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Beef Fillet', category: 'Beef', unit: 'kg', stock_qty: 3.2, reorder_level: 5, cost_price: 12.50, sell_price: 18.00, supplier_name: 'Pioneer Livestock', last_restocked: '2026-03-15', notes: '', created_at: '', updated_at: '' },
  { id: '2', name: 'T-Bone Steak', category: 'Beef', unit: 'kg', stock_qty: 12.5, reorder_level: 5, cost_price: 9.80, sell_price: 14.50, supplier_name: 'Pioneer Livestock', last_restocked: '2026-03-18', notes: '', created_at: '', updated_at: '' },
  { id: '3', name: 'Boerewors', category: 'Processed', unit: 'kg', stock_qty: 22, reorder_level: 10, cost_price: 4.20, sell_price: 7.50, supplier_name: 'Braai Masters Ltd', last_restocked: '2026-03-17', notes: '', created_at: '', updated_at: '' },
  { id: '4', name: 'Chicken Portions', category: 'Chicken', unit: 'kg', stock_qty: 8.5, reorder_level: 10, cost_price: 3.10, sell_price: 5.50, supplier_name: 'AFC Poultry', last_restocked: '2026-03-19', notes: '', created_at: '', updated_at: '' },
  { id: '5', name: 'Lamb Chops', category: 'Lamb', unit: 'kg', stock_qty: 2.8, reorder_level: 4, cost_price: 14.00, sell_price: 20.50, supplier_name: 'Pioneer Livestock', last_restocked: '2026-03-14', notes: '', created_at: '', updated_at: '' },
  { id: '6', name: 'Pork Spare Ribs', category: 'Pork', unit: 'kg', stock_qty: 15, reorder_level: 5, cost_price: 5.60, sell_price: 8.80, supplier_name: 'Braai Masters Ltd', last_restocked: '2026-03-16', notes: '', created_at: '', updated_at: '' },
  { id: '7', name: 'Pork Sausages', category: 'Pork', unit: 'pack', stock_qty: 6, reorder_level: 10, cost_price: 3.50, sell_price: 5.80, supplier_name: 'Braai Masters Ltd', last_restocked: '2026-03-17', notes: '', created_at: '', updated_at: '' },
  { id: '8', name: 'Vienna Sausages', category: 'Processed', unit: 'pack', stock_qty: 30, reorder_level: 20, cost_price: 2.10, sell_price: 3.80, supplier_name: 'Braai Masters Ltd', last_restocked: '2026-03-19', notes: '', created_at: '', updated_at: '' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtUSD(n: number) { return `$${n.toFixed(2)}` }

// ─── Modals ───────────────────────────────────────────────────────────────────
const EMPTY_PRODUCT: Omit<Product, 'id' | 'created_at' | 'updated_at'> = {
  name: '', category: 'Beef', unit: 'kg', stock_qty: 0, reorder_level: 0,
  cost_price: 0, sell_price: 0, supplier_name: '', last_restocked: '', notes: '',
}

function ProductModal({ product, onClose, onSave }: {
  product: Partial<Product> | null
  onClose: () => void
  onSave: (p: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void
}) {
  const editing = !!product?.id
  const [form, setForm] = useState({ ...EMPTY_PRODUCT, ...product })
  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) { setForm(f => ({ ...f, [k]: v })) }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '560px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{editing ? 'Edit Product' : 'Add Product'}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.375rem' }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1.25rem 1.5rem' }}>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Product Name</label>
            <input type="text" className="input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Beef Fillet" />
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={e => set('category', e.target.value as ProductCategory)}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Unit of Measure</label>
            <select className="input" value={form.unit} onChange={e => set('unit', e.target.value as UnitOfMeasure)}>
              {UNITS.map(u => <option key={u}>{u}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Current Stock Qty</label>
            <input type="number" min="0" step="any" className="input" value={form.stock_qty} onChange={e => set('stock_qty', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label">Reorder Level</label>
            <input type="number" min="0" step="any" className="input" value={form.reorder_level} onChange={e => set('reorder_level', parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label">Cost Price (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>$</span>
              <input type="number" min="0" step="0.01" className="input" style={{ paddingLeft: '1.75rem' }} value={form.cost_price} onChange={e => set('cost_price', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="label">Selling Price (USD)</label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>$</span>
              <input type="number" min="0" step="0.01" className="input" style={{ paddingLeft: '1.75rem' }} value={form.sell_price} onChange={e => set('sell_price', parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          <div>
            <label className="label">Supplier</label>
            <input type="text" className="input" value={form.supplier_name ?? ''} onChange={e => set('supplier_name', e.target.value)} placeholder="Supplier name" />
          </div>
          <div>
            <label className="label">Last Restocked</label>
            <input type="date" className="input" value={form.last_restocked ?? ''} onChange={e => set('last_restocked', e.target.value)} />
          </div>
          <div style={{ gridColumn: '1/-1' }}>
            <label className="label">Notes / Batch Info</label>
            <textarea rows={2} className="input" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button onClick={() => { onSave(form); onClose() }} className="btn-primary" disabled={!form.name.trim()}>
            {editing ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </div>
    </div>
  )
}

function AdjustModal({ product, onClose, onSave }: {
  product: Product
  onClose: () => void
  onSave: (type: StockMovementType, qty: number, notes: string) => void
}) {
  const [movType, setMovType] = useState<StockMovementType>('Purchase')
  const [qty, setQty] = useState(0)
  const [notes, setNotes] = useState('')
  const isPositive = movType === 'Purchase' || movType === 'Correction'
  const newQty = isPositive ? product.stock_qty + qty : product.stock_qty - qty

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Adjust Stock — {product.name}</h2>
          <button onClick={onClose} className="btn-ghost" style={{ padding: '0.375rem' }}><X className="w-4 h-4" /></button>
        </div>
        <div style={{ padding: '1.25rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', background: 'var(--bg-subtle)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontFamily: 'var(--font-primary)', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Current Stock</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>{product.stock_qty} {product.unit}</span>
          </div>
          <div>
            <label className="label">Movement Type</label>
            <select className="input" value={movType} onChange={e => setMovType(e.target.value as StockMovementType)}>
              {MOVEMENT_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Quantity ({product.unit})</label>
            <input type="number" min="0" step="any" className="input" value={qty} onChange={e => setQty(parseFloat(e.target.value) || 0)} />
          </div>
          <div>
            <label className="label">Notes</label>
            <input type="text" className="input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." />
          </div>
          {qty > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', background: newQty >= 0 ? 'var(--success-subtle)' : 'var(--danger-subtle)', border: `1px solid ${newQty >= 0 ? 'var(--success-border)' : 'var(--danger-border)'}` }}>
              <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>New Stock Level</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: newQty >= 0 ? 'var(--success)' : 'var(--danger)' }}>{newQty.toFixed(1)} {product.unit}</span>
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button className="btn-primary" disabled={qty <= 0} onClick={() => { onSave(movType, qty, notes); onClose() }}>
            Apply Adjustment
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function StockPage() {
  const { zwgActive, settings } = useSettings()
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS)
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<'All' | ProductCategory>('All')
  const [editProduct, setEditProduct] = useState<Product | null | 'new'>(null)
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null)

  const filtered = useMemo(() =>
    products.filter(p => {
      const matchCat = activeCategory === 'All' || p.category === activeCategory
      const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.supplier_name?.toLowerCase().includes(search.toLowerCase())
      return matchCat && matchSearch
    }), [products, search, activeCategory])

  const lowStockCount = products.filter(p => p.stock_qty <= p.reorder_level).length

  function handleSaveProduct(data: Omit<Product, 'id' | 'created_at' | 'updated_at'>) {
    if (editProduct === 'new') {
      setProducts(prev => [...prev, { ...data, id: Date.now().toString(), created_at: '', updated_at: '' }])
      toast.success('Product added')
    } else if (editProduct) {
      setProducts(prev => prev.map(p => p.id === editProduct.id ? { ...p, ...data } : p))
      toast.success('Product updated')
    }
  }

  function handleAdjust(product: Product, type: StockMovementType, qty: number) {
    const isPositive = type === 'Purchase' || type === 'Correction'
    setProducts(prev => prev.map(p => p.id === product.id
      ? { ...p, stock_qty: parseFloat((isPositive ? p.stock_qty + qty : p.stock_qty - qty).toFixed(3)) }
      : p))
    toast.success(`Stock adjusted — ${product.name}`)
  }

  function handleDelete(id: string) {
    setProducts(prev => prev.filter(p => p.id !== id))
    toast.success('Product removed')
  }

  function exportCSV() {
    const header = 'Name,Category,Unit,Stock Qty,Reorder Level,Cost Price (USD),Sell Price (USD),Supplier,Last Restocked'
    const rows = products.map(p => `"${p.name}","${p.category}",${p.unit},${p.stock_qty},${p.reorder_level},${p.cost_price},${p.sell_price},"${p.supplier_name ?? ''}",${p.last_restocked ?? ''}`)
    const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'stock.csv'; a.click()
    URL.revokeObjectURL(url)
    toast.success('CSV exported')
  }

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Stock</h1>
          <p className="page-subtitle">{products.length} products · {lowStockCount > 0 && <span style={{ color: 'var(--danger)' }}>{lowStockCount} below reorder level</span>}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.625rem' }}>
          <button onClick={exportCSV} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Download className="w-4 h-4" /> Export CSV
          </button>
          <button onClick={() => setEditProduct('new')} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '0 0 280px' }}>
          <Search className="w-4 h-4" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input className="input" style={{ paddingLeft: '2.25rem' }} placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        {(['All', ...CATEGORIES] as const).map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat as typeof activeCategory)}
            style={{
              fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', fontWeight: 600,
              padding: '0.375rem 0.875rem', borderRadius: '999px', border: '1.5px solid',
              cursor: 'pointer', transition: 'all 150ms',
              background: activeCategory === cat ? 'var(--primary)' : 'transparent',
              borderColor: activeCategory === cat ? 'var(--primary)' : 'var(--border-default)',
              color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
            }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-subtle)' }}>
              {['Product', 'Category', 'Unit', 'Stock Qty', 'Reorder', 'Cost (USD)', 'Sell (USD)', ...(zwgActive ? ['Sell (ZWG)'] : []), 'Supplier', 'Last Restocked', ''].map(h => (
                <th key={h} style={{ padding: '0.625rem 0.875rem', textAlign: 'left', fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.6875rem', color: 'var(--text-tertiary)', letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(product => {
              const isLow = product.stock_qty <= product.reorder_level
              return (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-subtle)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {product.name}
                      {isLow && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'var(--danger-subtle)', border: '1px solid var(--danger-border)', color: 'var(--danger)', fontFamily: 'var(--font-primary)', fontWeight: 700, fontSize: '0.625rem', letterSpacing: '0.08em', padding: '0.125rem 0.5rem', borderRadius: '999px', textTransform: 'uppercase' }}>
                          <AlertTriangle className="w-2.5 h-2.5" /> LOW
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.category}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.unit}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: isLow ? 'var(--danger)' : 'var(--text-primary)', fontSize: '0.9375rem', fontVariantNumeric: 'tabular-nums' }}>{product.stock_qty}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>{product.reorder_level}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(product.cost_price)}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtUSD(product.sell_price)}</td>
                  {zwgActive && (
                    <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', fontVariantNumeric: 'tabular-nums' }}>
                      ZWG {(product.sell_price * settings.usd_to_zwg_rate).toLocaleString('en-ZW', { minimumFractionDigits: 0 })}
                    </td>
                  )}
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{product.supplier_name ?? '—'}</td>
                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'var(--font-primary)', fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>{product.last_restocked ?? '—'}</td>
                  <td style={{ padding: '0.75rem 0.875rem', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button onClick={() => setAdjustProduct(product)} className="btn-ghost" style={{ padding: '0.375rem' }} title="Adjust stock">
                        <ChevronUp className="w-3.5 h-3.5" style={{ display: 'block' }} />
                        <ChevronDown className="w-3.5 h-3.5" style={{ display: 'block', marginTop: '-4px' }} />
                      </button>
                      <button onClick={() => setEditProduct(product)} className="btn-ghost" style={{ padding: '0.375rem' }}><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(product.id)} className="btn-ghost" style={{ padding: '0.375rem', color: 'var(--danger)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={12} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-tertiary)', fontFamily: 'var(--font-primary)' }}>No products found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {editProduct !== null && (
        <ProductModal
          product={editProduct === 'new' ? null : editProduct}
          onClose={() => setEditProduct(null)}
          onSave={handleSaveProduct}
        />
      )}
      {adjustProduct && (
        <AdjustModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSave={(type, qty, notes) => handleAdjust(adjustProduct, type, qty)}
        />
      )}
    </div>
  )
}
