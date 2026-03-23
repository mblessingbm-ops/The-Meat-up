'use client'

/**
 * app/(dashboard)/dashboard/settings/page.tsx
 * The Meat Up — Settings (with ZWG currency toggle)
 */

import { useState } from 'react'
import Image from 'next/image'
import { Settings, Save, Upload, ToggleLeft, ToggleRight } from 'lucide-react'
import toast from 'react-hot-toast'
import { useSettings } from '@/context/SettingsContext'
import { ThemeToggle } from '@/components/ThemeToggle'
import { useTheme } from '@/components/ThemeProvider'

export default function SettingsPage() {
  const { settings, updateSettings } = useSettings()
  const { theme } = useTheme()
  const [form, setForm] = useState({ ...settings })
  const [saving, setSaving] = useState(false)

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    // TODO: upsert to Supabase settings table (single row)
    await new Promise(r => setTimeout(r, 600))
    updateSettings(form)
    setSaving(false)
    toast.success('Settings saved')
  }

  return (
    <div style={{ maxWidth: '680px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Business profile and system configuration</p>
        </div>
        <Settings className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Business Profile */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
            Business Profile
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1/-1' }}>
              <label className="label">Business Name</label>
              <input type="text" className="input" value={form.business_name} onChange={e => set('business_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Admin Name</label>
              <input type="text" className="input" value={form.admin_name} onChange={e => set('admin_name', e.target.value)} />
            </div>
            <div>
              <label className="label">Phone / WhatsApp</label>
              <input type="text" className="input" value={form.phone ?? ''} onChange={e => set('phone', e.target.value)} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email ?? ''} onChange={e => set('email', e.target.value)} />
            </div>
            <div style={{ gridColumn: '1/-1' }}>
              <label className="label">Business Address</label>
              <textarea rows={2} className="input" value={form.address ?? ''} onChange={e => set('address', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Invoice Configuration */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
            Invoice Configuration
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label className="label">Invoice Prefix</label>
              <input type="text" className="input" placeholder="TMU" maxLength={6} value={form.invoice_prefix} onChange={e => set('invoice_prefix', e.target.value.toUpperCase())} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>e.g. TMU → TMU-0001</p>
            </div>
            <div>
              <label className="label">Next Invoice #</label>
              <input type="number" min="1" className="input" value={form.invoice_start_number} onChange={e => set('invoice_start_number', parseInt(e.target.value) || 1)} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                Will generate {form.invoice_prefix}-{String(form.invoice_start_number).padStart(4, '0')}
              </p>
            </div>
            <div>
              <label className="label">Tax Rate (%)</label>
              <input type="number" min="0" max="100" step="0.5" className="input" value={form.tax_rate} onChange={e => set('tax_rate', parseFloat(e.target.value) || 0)} />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>0% = no tax applied</p>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem', letterSpacing: '-0.01em' }}>
            Currency
          </h2>
          <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginBottom: '1.25rem' }}>
            The system operates in <strong style={{ color: 'var(--text-secondary)' }}>USD by default</strong>. Enable ZWG to show a secondary Zimbabwe Gold currency option across invoices, expenses, and reports.
          </p>

          {/* ZWG Toggle */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '1rem', borderRadius: 'var(--radius-md)',
            background: form.zwg_enabled ? 'var(--accent-subtle)' : 'var(--bg-subtle)',
            border: `1px solid ${form.zwg_enabled ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
            transition: 'all 200ms',
          }}>
            <div>
              <div style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Enable ZWG Currency
              </div>
              <div style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                {form.zwg_enabled ? 'ZWG is active — secondary currency option is shown' : 'OFF — system is USD-only'}
              </div>
            </div>
            <button
              type="button"
              onClick={() => set('zwg_enabled', !form.zwg_enabled)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: form.zwg_enabled ? 'var(--accent)' : 'var(--text-tertiary)', transition: 'color 200ms' }}
              aria-label={form.zwg_enabled ? 'Disable ZWG' : 'Enable ZWG'}
            >
              {form.zwg_enabled
                ? <ToggleRight className="w-10 h-10" />
                : <ToggleLeft className="w-10 h-10" />
              }
            </button>
          </div>

          {/* ZWG Rate — only shown when enabled */}
          {form.zwg_enabled && (
            <div style={{ marginTop: '1rem', maxWidth: '320px' }}>
              <label className="label">USD to ZWG Exchange Rate</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="number"
                  min="0"
                  step="any"
                  className="input"
                  value={form.usd_to_zwg_rate}
                  onChange={e => set('usd_to_zwg_rate', parseFloat(e.target.value) || 0)}
                  placeholder="e.g. 360"
                />
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>
                  1 USD = {form.usd_to_zwg_rate > 0 ? `ZWG ${form.usd_to_zwg_rate.toLocaleString()}` : '—'}
                </div>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.375rem' }}>
                Set manually. ZWG amounts across the system will be calculated using this rate.
              </p>
            </div>
          )}
        </div>

        {/* Logo */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
            Business Logo
          </h2>
          {/* Current logo preview */}
          <div style={{ marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.5rem' }}>
            <Image
              src="/images/the_meat_up_logo.png"
              alt="The Meat Up Logo"
              width={160}
              height={0}
              style={{ width: '160px', height: 'auto' }}
            />
            <span style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', letterSpacing: '0.04em' }}>Current Logo</span>
          </div>
          {/* Upload zone for replacement */}
          <div style={{
            border: '2px dashed var(--border-default)', borderRadius: 'var(--radius-lg)',
            padding: '1.25rem', textAlign: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            cursor: 'pointer', transition: 'border-color 150ms',
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--accent)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-default)')}
          >
            <Upload className="w-6 h-6" style={{ color: 'var(--text-tertiary)' }} />
            <div>
              <p style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Upload replacement logo</p>
              <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '0.125rem' }}>
                PNG or SVG recommended. Appears on printed invoices.
              </p>
            </div>
            <input type="file" accept="image/*" style={{ display: 'none' }} />
          </div>
        </div>

        {/* Appearance */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>
            Appearance
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'var(--font-primary)', fontWeight: 600, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                Theme
              </p>
              <p style={{ fontFamily: 'var(--font-primary)', fontSize: '0.8125rem', color: 'var(--text-tertiary)', marginTop: '0.25rem' }}>
                {theme === 'dark' ? 'Dark mode is active' : 'Light mode is active'}
              </p>
            </div>
            <ThemeToggle />
          </div>
        </div>

        {/* Save */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
