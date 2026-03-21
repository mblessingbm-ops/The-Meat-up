'use client'
// WeeklyFuelEntryForm.tsx — Full-page 21-vehicle weekly fuel dispensing form
// Created March 2026

import React, { useState, useMemo } from 'react'
import { ArrowLeft, Fuel, AlertTriangle, Save, Send, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_VEHICLES, FUEL_PRICE_HISTORY, TOTAL_WEEKLY_ALLOCATION, type VehicleFuelLineItem, type FuelEntry } from '@/lib/fleet'
import toast from 'react-hot-toast'

interface Props {
  onClose: () => void
  onSave: (entry: Omit<FuelEntry, 'id' | 'createdAt'>, draft: boolean) => void
}

function getWeekRange(offset = 0) {
  const now = new Date()
  const day = now.getDay()
  const monday = new Date(now)
  monday.setDate(now.getDate() - (day === 0 ? 6 : day - 1) + offset * 7)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return { start: fmt(monday), end: fmt(sunday) }
}

type LineState = {
  vehicleId: string
  estRemaining: string
  dispensed: string
  notes: string
  isNil: boolean
}

export default function WeeklyFuelEntryForm({ onClose, onSave }: Props) {
  const currentPrice = FUEL_PRICE_HISTORY[FUEL_PRICE_HISTORY.length - 1]
  const defaultWeek = getWeekRange()

  const [weekStart, setWeekStart] = useState(defaultWeek.start)
  const [weekEnd, setWeekEnd] = useState(defaultWeek.end)

  const [lines, setLines] = useState<LineState[]>(
    MOCK_VEHICLES.filter(v => v.isActive).map(v => ({
      vehicleId: v.id,
      estRemaining: '',
      dispensed: '',
      notes: '',
      isNil: false,
    }))
  )

  function setLine(idx: number, patch: Partial<LineState>) {
    setLines(prev => prev.map((l, i) => i === idx ? { ...l, ...patch } : l))
  }

  function toggleNil(idx: number) {
    const isNil = !lines[idx].isNil
    setLine(idx, {
      isNil,
      dispensed: isNil ? '0' : '',
      notes: isNil ? 'No fuel dispensed this week' : '',
    })
  }

  const activeVehicles = MOCK_VEHICLES.filter(v => v.isActive)

  const builtLines = useMemo((): VehicleFuelLineItem[] => {
    return activeVehicles.map((v, i) => {
      const l = lines[i]
      const dispensed = parseFloat(l.dispensed) || 0
      return {
        vehicleId: v.id,
        registration: v.registration,
        assignedTo: v.assignedTo,
        make: v.make,
        model: v.model,
        maxAllocation: v.weeklyAllocationLitres,
        estRemaining: l.estRemaining ? parseFloat(l.estRemaining) : null,
        dispensed,
        priceAtTime: currentPrice.price,
        amount: parseFloat((dispensed * currentPrice.price).toFixed(2)),
        notes: l.notes,
        isNil: l.isNil,
      }
    })
  }, [lines, activeVehicles, currentPrice])

  const totalDispensed = builtLines.reduce((s, l) => s + l.dispensed, 0)
  const totalCost = parseFloat((totalDispensed * currentPrice.price).toFixed(2))
  const maxPossible = TOTAL_WEEKLY_ALLOCATION
  const maxCost = parseFloat((maxPossible * currentPrice.price).toFixed(2))
  const varianceLitres = maxPossible - totalDispensed
  const varianceCost = parseFloat((varianceLitres * currentPrice.price).toFixed(2))
  const utilisationPct = maxPossible > 0 ? parseFloat(((totalDispensed / maxPossible) * 100).toFixed(1)) : 0

  function handleSave(draft: boolean) {
    const entry = {
      weekStart,
      weekEnd,
      pricePerLitre: currentPrice.price,
      lines: builtLines,
      totalDispensed: parseFloat(totalDispensed.toFixed(2)),
      maxAllocation: maxPossible,
      utilisationPct,
      totalCost,
      postedBy: 'Ashleigh Kurira',
      status: draft ? 'draft' as const : 'posted' as const,
    }
    onSave(entry, draft)
    toast.success(draft ? 'Fuel entry saved as draft.' : 'Fuel entry posted successfully.')
    onClose()
  }

  return (
    <div className="min-h-screen bg-nexus-bg">
      {/* Sticky header */}
      <div className="sticky top-0 z-20 bg-white border-b border-nexus-border px-4 py-3 flex items-center gap-4">
        <button onClick={onClose} className="icon-btn flex-shrink-0"><ArrowLeft className="w-4 h-4" /></button>
        <div className="flex-1">
          <h2 className="font-display font-bold text-nexus-ink">New Weekly Fuel Entry</h2>
          <p className="text-xs text-nexus-muted">Enter actual litres dispensed per vehicle</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary btn-sm" onClick={() => handleSave(true)}>
            <Save className="w-3.5 h-3.5" /> Save Draft
          </button>
          <button className="btn-primary btn-sm" onClick={() => handleSave(false)}>
            <Send className="w-3.5 h-3.5" /> Post Entry
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {/* Header fields */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-nexus-ink mb-4">Entry Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="form-label">Week Start (Monday)</label>
              <input type="date" className="input" value={weekStart} onChange={e => setWeekStart(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Week End (Sunday)</label>
              <input type="date" className="input" value={weekEnd} onChange={e => setWeekEnd(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Fuel Price (USD/litre)</label>
              <div className="input bg-nexus-bg cursor-not-allowed flex items-center gap-2">
                <Fuel className="w-3.5 h-3.5 text-nexus-muted flex-shrink-0" />
                <span className="num font-semibold">${currentPrice.price.toFixed(2)}</span>
                <span className="text-xs text-nexus-muted ml-auto">effective {currentPrice.effective_date}</span>
              </div>
              <p className="text-[10px] text-nexus-muted mt-1">
                <Info className="w-2.5 h-2.5 inline mr-0.5" />
                Price locked at rate effective {currentPrice.effective_date}. Update in Fuel Settings to change.
              </p>
            </div>
          </div>
        </div>

        {/* Vehicle table */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-nexus-border">
            <h3 className="font-display font-semibold text-nexus-ink">{activeVehicles.length} Active Vehicles</h3>
            <p className="text-xs text-nexus-muted mt-0.5">Enter actual litres dispensed. Leave at 0 or use the Nil button for vehicles that received no fuel this week.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="table min-w-[900px]">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>Registration</th>
                  <th>Assigned To</th>
                  <th className="text-right">Max Alloc</th>
                  <th className="text-right">Est. Remaining</th>
                  <th className="text-right">Dispensed (L)</th>
                  <th className="text-right">Amount (USD)</th>
                  <th>Notes</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {activeVehicles.map((v, i) => {
                  const l = lines[i]
                  const dispensed = parseFloat(l.dispensed) || 0
                  const exceedsMax = dispensed > v.weeklyAllocationLitres && dispensed > 0
                  const amount = dispensed * currentPrice.price

                  return (
                    <tr key={v.id} className={cn(exceedsMax && 'bg-red-50/40')}>
                      <td>
                        <p className="text-xs font-medium">{v.make} {v.model}</p>
                        <span className={cn('badge text-[10px] py-0',
                          v.vehicleType === 'Personal' ? 'bg-brand-50 text-brand-700' :
                          v.vehicleType === 'Pool' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        )}>{v.vehicleType}</span>
                      </td>
                      <td className="font-mono text-xs font-semibold">{v.registration}</td>
                      <td className="text-xs">{v.assignedTo}</td>
                      <td className="text-right num text-xs text-nexus-muted">{v.weeklyAllocationLitres}L</td>
                      <td className="text-right">
                        <input
                          type="number" step="0.5" min="0"
                          placeholder="—"
                          disabled={l.isNil}
                          className={cn('input w-20 text-right text-xs py-1.5', l.isNil && 'opacity-40')}
                          value={l.estRemaining}
                          onChange={e => setLine(i, { estRemaining: e.target.value })}
                        />
                        <span className="text-[10px] text-nexus-muted ml-1">L</span>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <div className="relative">
                            <input
                              type="number" step="0.5" min="0"
                              disabled={l.isNil}
                              className={cn('input w-24 text-right text-xs py-1.5', l.isNil && 'opacity-40', exceedsMax && 'border-red-400 bg-red-50')}
                              value={l.dispensed}
                              onChange={e => setLine(i, { dispensed: e.target.value })}
                            />
                          </div>
                          <span className="text-[10px] text-nexus-muted">L</span>
                        </div>
                        {exceedsMax && (
                          <p className="text-[10px] text-red-600 flex items-center gap-0.5 mt-0.5 justify-end">
                            <AlertTriangle className="w-2.5 h-2.5" /> Exceeds max {v.weeklyAllocationLitres}L
                          </p>
                        )}
                      </td>
                      <td className="text-right num text-xs font-semibold">
                        {dispensed > 0 ? `$${amount.toFixed(2)}` : '—'}
                      </td>
                      <td>
                        <input
                          type="text" placeholder="Optional notes…"
                          disabled={l.isNil && l.notes === 'No fuel dispensed this week'}
                          className="input text-xs py-1.5 min-w-[160px]"
                          value={l.notes}
                          onChange={e => setLine(i, { notes: e.target.value })}
                        />
                      </td>
                      <td>
                        <button
                          onClick={() => toggleNil(i)}
                          className={cn('px-2 py-1 rounded-lg text-[10px] font-semibold transition-colors',
                            l.isNil ? 'bg-slate-600 text-white' : 'bg-nexus-bg text-nexus-muted hover:bg-slate-200'
                          )}>
                          Nil
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Running totals — sticky to bottom on mobile, inline on desktop */}
        <div className="sticky bottom-0 card p-4 bg-nexus-ink text-white rounded-t-xl rounded-b-none border-0 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-[11px] text-white/60">Total Dispensed</p>
            <p className="font-display font-bold num text-lg">{totalDispensed.toFixed(1)}L</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60">Total Cost</p>
            <p className="font-display font-bold num text-lg text-emerald-400">${totalCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/60">vs Max Possible ({maxPossible}L · ${maxCost.toFixed(2)})</p>
            <p className={cn('font-display font-bold num text-lg', utilisationPct >= 90 ? 'text-emerald-400' : utilisationPct >= 70 ? 'text-amber-400' : 'text-slate-400')}>
              {utilisationPct}% utilised
            </p>
          </div>
          <div>
            <p className="text-[11px] text-white/60">Variance (Saved)</p>
            <p className="font-display font-bold num text-lg text-amber-400">{varianceLitres.toFixed(1)}L · ${varianceCost.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
