'use client'
import { useState } from 'react'
import { Save, ChevronDown, ChevronUp } from 'lucide-react'
import { DEFAULT_SETTINGS, SETTINGS_HISTORY, type PayrollSettings } from '@/lib/payroll'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'

function SettingRow({
  label, value, suffix, onChange, canEdit, historyKey
}: {
  label: string; value: number; suffix: string; onChange: (v: number) => void; canEdit: boolean; historyKey?: string
}) {
  const [showHistory, setShowHistory] = useState(false)
  const history = historyKey ? SETTINGS_HISTORY[historyKey] : undefined
  return (
    <div className="flex items-center gap-4 py-3 border-b border-nexus-border last:border-0">
      <div className="flex-1">
        <p className="text-sm font-medium text-nexus-ink">{label}</p>
        {history && (
          <button className="text-xs text-brand-600 flex items-center gap-1 mt-0.5" onClick={() => setShowHistory(v => !v)}>
            Rate History {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
        {showHistory && history && (
          <div className="mt-2 space-y-1">
            {history.map((h, i) => (
              <p key={i} className="text-xs text-nexus-muted">{h.date} · {h.by}: {h.from} → {h.to}</p>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {canEdit ? (
          <input
            type="number" step="0.001"
            className="input w-24 text-right text-sm"
            value={value}
            onChange={e => onChange(parseFloat(e.target.value) || 0)}
          />
        ) : (
          <span className="text-sm font-medium text-nexus-ink num w-24 text-right">{value}</span>
        )}
        <span className="text-xs text-nexus-muted w-12">{suffix}</span>
      </div>
    </div>
  )
}

export default function PayrollSettingsView({ canEdit }: { canEdit: boolean }) {
  const [settings, setSettings] = useState<PayrollSettings>(DEFAULT_SETTINGS)
  const set = (k: keyof PayrollSettings, v: unknown) => setSettings(p => ({ ...p, [k]: v }))

  const handleSave = () => {
    toast.success('Payroll settings updated.')
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* PAYE Bands */}
      <div className="card p-5">
        <h4 className="font-display font-semibold text-nexus-ink mb-4">PAYE Tax Bands (USD monthly)</h4>
        <div className="table-wrapper rounded-xl overflow-hidden">
          <table className="table text-sm">
            <thead>
              <tr><th>Min (USD)</th><th>Max (USD)</th><th>Base Tax (USD)</th><th>Rate on Excess</th></tr>
            </thead>
            <tbody>
              {settings.payeBands.map((band, i) => (
                <tr key={i}>
                  <td className="num">{band.min}</td>
                  <td className="num">{band.max ?? '—'}</td>
                  <td className="num">{band.base}</td>
                  <td className="num">{(band.rate * 100).toFixed(0)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-nexus-muted mt-2">For weekly runs, bands are prorated by ÷ 4.33</p>
      </div>

      {/* Statutory Rates */}
      <div className="card p-5">
        <h4 className="font-display font-semibold text-nexus-ink mb-1">Statutory Rates</h4>
        <p className="text-xs text-nexus-muted mb-4">Last updated {settings.updatedAt} by {settings.updatedBy}</p>
        <SettingRow label="AIDS Levy Rate" value={parseFloat((settings.aidsLevyRate * 100).toFixed(4))} suffix="% of PAYE" onChange={v => set('aidsLevyRate', v / 100)} canEdit={canEdit} />
        <SettingRow label="NSSA Employee Rate" value={parseFloat((settings.nssaEmployeeRate * 100).toFixed(4))} suffix="% of basic" historyKey="NSSA Rate" onChange={v => set('nssaEmployeeRate', v / 100)} canEdit={canEdit} />
        <SettingRow label="NSSA Employee Monthly Cap" value={settings.nssaEmployeeMonthlyCap} suffix="USD" historyKey="NSSA Cap" onChange={v => set('nssaEmployeeMonthlyCap', v)} canEdit={canEdit} />
        <SettingRow label="NSSA Employer Rate" value={parseFloat((settings.nssaEmployerRate * 100).toFixed(4))} suffix="% of basic" onChange={v => set('nssaEmployerRate', v / 100)} canEdit={canEdit} />
        <SettingRow label="NSSA Employer Monthly Cap" value={settings.nssaEmployerMonthlyCap} suffix="USD" onChange={v => set('nssaEmployerMonthlyCap', v)} canEdit={canEdit} />
        <SettingRow label="ZIMDEF Rate (Employer)" value={parseFloat((settings.zimdefRate * 100).toFixed(4))} suffix="% of gross" onChange={v => set('zimdefRate', v / 100)} canEdit={canEdit} />
        <SettingRow label="NEC Employee Rate (Clothing)" value={parseFloat((settings.necEmployeeRate * 100).toFixed(4))} suffix="% of basic" onChange={v => set('necEmployeeRate', v / 100)} canEdit={canEdit} />
        <SettingRow label="NEC Employer Rate (Clothing)" value={parseFloat((settings.necEmployerRate * 100).toFixed(4))} suffix="% of basic" onChange={v => set('necEmployerRate', v / 100)} canEdit={canEdit} />
        <SettingRow label="Standard Hours Per Week" value={settings.standardHoursPerWeek} suffix="hrs" onChange={v => set('standardHoursPerWeek', v)} canEdit={canEdit} />
        <SettingRow label="Overtime Multiplier" value={settings.overtimeMultiplier} suffix="×" onChange={v => set('overtimeMultiplier', v)} canEdit={canEdit} />
      </div>

      {canEdit && (
        <button className="btn-primary" onClick={handleSave}>
          <Save className="w-4 h-4" /> Save Settings
        </button>
      )}
    </div>
  )
}
