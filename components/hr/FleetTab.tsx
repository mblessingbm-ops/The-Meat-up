'use client'
// FleetTab.tsx — Vehicle register for HR module Fleet tab
// Visible to: executives, accountants, hr_officers
// Created March 2026

import React, { useState } from 'react'
import { Car, Fuel, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { MOCK_VEHICLES, MOCK_FUEL_ENTRIES, TOTAL_WEEKLY_ALLOCATION, type FleetVehicle } from '@/lib/fleet'

const TYPE_STYLES = {
  Personal: 'bg-brand-50 text-brand-700',
  Pool:     'bg-purple-100 text-purple-700',
  Delivery: 'bg-amber-100 text-amber-700',
}

function fmt(n: number) {
  return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function VehicleFuelHistory({ vehicleId }: { vehicleId: string }) {
  const entries = MOCK_FUEL_ENTRIES
    .filter(e => e.status === 'posted')
    .map(e => {
      const line = e.lines.find(l => l.vehicleId === vehicleId)
      if (!line) return null
      return {
        weekStart: e.weekStart, weekEnd: e.weekEnd,
        maxAlloc: line.maxAllocation,
        dispensed: line.dispensed,
        utilisationPct: line.maxAllocation > 0 ? parseFloat(((line.dispensed / line.maxAllocation) * 100).toFixed(1)) : 0,
        amount: line.amount,
      }
    }).filter(Boolean) as Array<{ weekStart: string; weekEnd: string; maxAlloc: number; dispensed: number; utilisationPct: number; amount: number }>

  if (entries.length === 0) return <p className="text-xs text-nexus-muted px-4 py-3">No posted fuel history yet.</p>

  return (
    <div className="px-4 pb-3">
      <p className="text-xs font-semibold text-nexus-muted uppercase tracking-wider mb-2">Fuel History</p>
      <table className="table text-xs w-full">
        <thead>
          <tr>
            <th>Week</th>
            <th className="text-right">Max Alloc</th>
            <th className="text-right">Dispensed</th>
            <th className="text-right">Utilisation</th>
            <th className="text-right">Amount (USD)</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(e => (
            <tr key={e.weekStart}>
              <td className="text-xs">{e.weekStart} – {e.weekEnd}</td>
              <td className="text-right num">{e.maxAlloc}L</td>
              <td className="text-right num">{e.dispensed}L</td>
              <td className={cn('text-right num font-medium', e.utilisationPct >= 90 ? 'text-emerald-600' : e.utilisationPct >= 70 ? 'text-amber-600' : 'text-slate-500')}>
                {e.utilisationPct}%
              </td>
              <td className="text-right num">{fmt(e.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function VehicleCard({ vehicle }: { vehicle: FleetVehicle }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border border-nexus-border rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm">
      <button className="w-full text-left" onClick={() => setExpanded(v => !v)}>
        <div className="flex items-center gap-4 p-4">
          <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0', TYPE_STYLES[vehicle.vehicleType])}>
            <Car className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono font-bold text-nexus-ink">{vehicle.registration}</span>
              <span className={cn('badge text-[10px] py-0 px-2', TYPE_STYLES[vehicle.vehicleType])}>{vehicle.vehicleType}</span>
              {vehicle.isActive
                ? <span className="badge bg-emerald-100 text-emerald-700 text-[10px] py-0">Active</span>
                : <span className="badge bg-red-100 text-red-600 text-[10px] py-0">Inactive</span>
              }
            </div>
            <p className="text-sm text-nexus-muted mt-0.5">{vehicle.make} {vehicle.model}</p>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="flex items-center gap-1.5 text-xs text-nexus-muted justify-end">
              <Fuel className="w-3.5 h-3.5" />
              {vehicle.weeklyAllocationLitres}L/week
            </div>
            <p className="text-xs text-nexus-muted mt-1">{vehicle.assignedTo}</p>
          </div>
          <span className="text-nexus-muted ml-2 flex-shrink-0">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </button>
      {expanded && (
        <div className="border-t border-nexus-border bg-nexus-bg/30">
          <VehicleFuelHistory vehicleId={vehicle.id} />
        </div>
      )}
    </div>
  )
}

export default function FleetTab() {
  const [typeFilter, setTypeFilter] = useState<'All' | 'Personal' | 'Pool' | 'Delivery'>('All')

  const filtered = typeFilter === 'All' ? MOCK_VEHICLES : MOCK_VEHICLES.filter(v => v.vehicleType === typeFilter)
  const personal = MOCK_VEHICLES.filter(v => v.vehicleType === 'Personal').length
  const pool = MOCK_VEHICLES.filter(v => v.vehicleType === 'Pool').length
  const delivery = MOCK_VEHICLES.filter(v => v.vehicleType === 'Delivery').length

  const kpis = [
    { label: 'Total Vehicles', value: MOCK_VEHICLES.length.toString(), color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Personal', value: personal.toString(), color: 'text-brand-600', bg: 'bg-brand-50' },
    { label: 'Pool Cars', value: pool.toString(), color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Delivery', value: delivery.toString(), color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Weekly Allocation', value: `${TOTAL_WEEKLY_ALLOCATION}L`, color: 'text-nexus-ink', bg: 'bg-nexus-bg' },
  ]

  return (
    <div className="p-4 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {kpis.map(k => (
          <div key={k.label} className={cn('rounded-xl p-3', k.bg)}>
            <p className="text-[11px] text-nexus-muted">{k.label}</p>
            <p className={cn('font-display font-bold text-xl num mt-0.5', k.color)}>{k.value}</p>
          </div>
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {(['All','Personal','Pool','Delivery'] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-colors', typeFilter === t ? 'bg-brand-600 text-white' : 'bg-nexus-bg text-nexus-muted hover:text-nexus-ink')}>
            {t}
          </button>
        ))}
      </div>

      {/* Vehicle Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map(v => <VehicleCard key={v.id} vehicle={v} />)}
      </div>

      <p className="text-xs text-nexus-muted text-center pt-2">
        {filtered.length} vehicle{filtered.length !== 1 ? 's' : ''} · Total weekly fuel allocation: {TOTAL_WEEKLY_ALLOCATION}L
      </p>
    </div>
  )
}
