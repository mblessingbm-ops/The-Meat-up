'use client'
// components/accounting/ZimraStatusPanel.tsx
// ZIMRA Fiscal Status panel — shown above all Accounting tabs to accountants and executives
// Polls /api/zimra/fiscal-day/status every 60 seconds

import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, ShieldAlert, ShieldOff, RefreshCw, X, AlertTriangle, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ZimraStatus {
  configured: boolean
  initialised?: boolean
  company?: string
  deviceID?: number
  fiscalDayNo?: number
  fiscalDayStatus?: 'FiscalDayClosed' | 'FiscalDayOpened' | 'FiscalDayCloseInitiated' | 'FiscalDayCloseFailed'
  fiscalDayOpened?: string
  lastReceiptCounter?: number
  certificateValidTill?: string
  daysUntilCertExpiry?: number
  certExpirySoon?: boolean
  autoCloseSchedule?: string
  message?: string
  timestamp?: string
}

type Company = 'Kingsport' | 'Bralyn' | 'SGA'

interface ZimraStatusPanelProps {
  selectedCompany?: Company
}

const STATUS_CONFIG = {
  FiscalDayOpened: {
    label: 'DAY OPEN',
    color: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    icon: ShieldCheck,
    iconColor: 'text-emerald-500',
  },
  FiscalDayClosed: {
    label: 'DAY CLOSED',
    color: 'bg-slate-100 text-slate-600 border border-slate-200',
    icon: ShieldCheck,
    iconColor: 'text-slate-400',
  },
  FiscalDayCloseInitiated: {
    label: 'CLOSING…',
    color: 'bg-amber-100 text-amber-700 border border-amber-200',
    icon: ShieldCheck,
    iconColor: 'text-amber-500',
  },
  FiscalDayCloseFailed: {
    label: 'CLOSE FAILED',
    color: 'bg-red-100 text-red-700 border border-red-200',
    icon: ShieldAlert,
    iconColor: 'text-red-500',
  },
} as const

export default function ZimraStatusPanel({ selectedCompany = 'Kingsport' }: ZimraStatusPanelProps) {
  const [status, setStatus] = useState<ZimraStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForceCloseModal, setShowForceCloseModal] = useState(false)
  const [forceClosing, setForceClosing] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/zimra/fiscal-day/status')
      const data: ZimraStatus = await res.json()
      setStatus(data)
    } catch {
      // Silently fail — panel degrades gracefully
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    // Poll every 60 seconds
    const interval = setInterval(fetchStatus, 60_000)
    return () => clearInterval(interval)
  }, [fetchStatus])

  const handleForceClose = async () => {
    setForceClosing(true)
    try {
      const res = await fetch('/api/zimra/fiscal-day/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: 'KINGSPORT', closedBy: 'User — Manual Force Close' }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success(`Fiscal day ${data.fiscalDayNo} closed successfully.`)
        setShowForceCloseModal(false)
        await fetchStatus()
      } else {
        toast.error(data.error || 'Force close failed.')
      }
    } catch {
      toast.error('Unable to reach ZIMRA. Check your connection.')
    } finally {
      setForceClosing(false)
    }
  }

  // Bralyn and SGA — Phase 2 banner
  if (selectedCompany !== 'Kingsport') {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 mb-4">
        <ShieldOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>
          ZIMRA fiscalisation for <strong>{selectedCompany}</strong> is not yet active (Phase 2). Invoices issued now will not be submitted to ZIMRA.
        </span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50/60 border border-indigo-100 rounded-xl text-xs text-indigo-400 mb-4 animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Loading ZIMRA fiscal status…
      </div>
    )
  }

  if (!status || !status.configured) {
    return (
      <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 mb-4">
        <ShieldOff className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span>ZIMRA not yet configured — device registration required. Contact system support.</span>
      </div>
    )
  }

  const fiscalStatus = status.fiscalDayStatus
  const statusCfg = fiscalStatus ? STATUS_CONFIG[fiscalStatus] : null
  const StatusIcon = statusCfg?.icon ?? ShieldCheck
  const isHealthy = fiscalStatus === 'FiscalDayOpened' || fiscalStatus === 'FiscalDayClosed'
  const showForceCloseButton = fiscalStatus === 'FiscalDayCloseFailed'

  return (
    <>
      <div className={cn(
        'flex items-center gap-4 px-5 py-3 rounded-xl border mb-4 text-xs',
        isHealthy ? 'bg-indigo-50/70 border-indigo-100' : 'bg-red-50/70 border-red-200'
      )}>
        {/* Left: icon */}
        <div className="flex-shrink-0">
          {isHealthy
            ? <ShieldCheck className={cn('w-6 h-6', statusCfg?.iconColor ?? 'text-slate-400')} />
            : <ShieldAlert className="w-6 h-6 text-red-500" />
          }
        </div>

        {/* Centre: status info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            {/* Company badge */}
            <span className="badge bg-indigo-100 text-indigo-700 text-[10px] font-semibold">Kingsport Investments</span>
            {/* Status badge */}
            {statusCfg && (
              <span className={cn('badge text-[10px] font-bold tracking-wide', statusCfg.color)}>
                {statusCfg.label}
              </span>
            )}
            {/* Cert expiry warning */}
            {status.certExpirySoon && (
              <span className="badge bg-amber-100 text-amber-700 text-[10px]">
                <AlertTriangle className="w-2.5 h-2.5 inline mr-0.5" />
                Cert expires in {status.daysUntilCertExpiry}d
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
            {status.fiscalDayNo !== undefined && (
              <span>Fiscal Day <strong className="text-slate-700">#{status.fiscalDayNo}</strong></span>
            )}
            {status.lastReceiptCounter !== undefined && (
              <span><strong className="text-slate-700">{status.lastReceiptCounter}</strong> receipt{status.lastReceiptCounter !== 1 ? 's' : ''} submitted today</span>
            )}
            {fiscalStatus === 'FiscalDayClosed' && (
              <span className="text-slate-400">Next day opens automatically on first invoice.</span>
            )}
          </div>

          {/* Auto-close note */}
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
            <Clock className="w-2.5 h-2.5" />
            <span>Auto-close scheduled {status.autoCloseSchedule || '23:45 CAT'} tonight</span>
            {status.certificateValidTill && !status.certExpirySoon && (
              <span className="ml-2 text-slate-300">· Cert valid until {new Date(status.certificateValidTill).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
            )}
          </div>
        </div>

        {/* Right: Force Close button */}
        {showForceCloseButton && (
          <button
            onClick={() => setShowForceCloseModal(true)}
            className="flex-shrink-0 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Force Close
          </button>
        )}
      </div>

      {/* Force Close confirmation modal */}
      <AnimatePresence>
        {showForceCloseModal && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 z-50"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => !forceClosing && setShowForceCloseModal(false)}
            />
            <motion.div
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                    <h3 className="font-bold text-slate-800 text-sm">Force Close Fiscal Day</h3>
                  </div>
                  {!forceClosing && (
                    <button onClick={() => setShowForceCloseModal(false)}>
                      <X className="w-4 h-4 text-slate-400" />
                    </button>
                  )}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  The automatic close failed at 23:45. Force-closing will submit today&apos;s fiscal counters to ZIMRA now. Do you want to proceed?
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowForceCloseModal(false)}
                    disabled={forceClosing}
                    className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleForceClose}
                    disabled={forceClosing}
                    className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {forceClosing ? <><RefreshCw className="w-3 h-3 animate-spin" />Closing…</> : 'Confirm Force Close'}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
