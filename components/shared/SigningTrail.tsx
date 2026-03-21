'use client'

import { motion } from 'framer-motion'
import { CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SigningEvent } from '@/lib/imported-orders'

interface SigningTrailProps {
    trail: SigningEvent[]
    currentStatus: string
    className?: string
}

const STAGE_META: Record<SigningEvent['stage'], { label: string; order: number }> = {
    submitted: { label: 'Submitted by Rep', order: 1 },
    manager_signed: { label: 'Sales Manager Approval', order: 2 },
    executive_signed: { label: 'Executive Countersignature', order: 3 },
    approved: { label: 'Fully Approved', order: 4 },
    completed: { label: 'Completed', order: 5 },
    rejected: { label: 'Rejected', order: 6 },
}

// The canonical approval steps (in order), regardless of what's in the trail
const CANONICAL_STEPS: SigningEvent['stage'][] = [
    'submitted',
    'manager_signed',
    'executive_signed',
    'approved',
]

function formatTs(ts: string): string {
    const d = new Date(ts)
    return d.toLocaleDateString('en-ZW', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + d.toLocaleTimeString('en-ZW', { hour: '2-digit', minute: '2-digit' })
}

export default function SigningTrail({ trail, currentStatus, className }: SigningTrailProps) {
    const rejectionEvent = trail.find(e => e.stage === 'rejected')
    const completedEvent = trail.find(e => e.stage === 'completed')

    // Build a map of stage → event
    const byStage = Object.fromEntries(trail.map(e => [e.stage, e]))

    // Decide which steps to show
    const steps: SigningEvent['stage'][] = rejectionEvent
        ? [...CANONICAL_STEPS.filter(s => byStage[s]), 'rejected']
        : completedEvent
            ? [...CANONICAL_STEPS, 'completed']
            : CANONICAL_STEPS

    return (
        <div className={cn('space-y-0', className)}>
            {steps.map((stage, idx) => {
                const event = byStage[stage]
                const isDone = !!event
                const isRejection = stage === 'rejected'
                const isLast = idx === steps.length - 1

                return (
                    <div key={stage} className="flex gap-3">
                        {/* Line + icon */}
                        <div className="flex flex-col items-center">
                            <motion.div
                                initial={{ scale: 0.6, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: idx * 0.06 }}
                                className={cn(
                                    'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2',
                                    isDone && !isRejection && 'bg-emerald-100 border-emerald-400',
                                    isDone && isRejection && 'bg-red-100 border-red-400',
                                    !isDone && 'bg-surface-muted border-nexus-border',
                                )}
                            >
                                {isDone && !isRejection && <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />}
                                {isDone && isRejection && <XCircle className="w-3.5 h-3.5 text-red-600" />}
                                {!isDone && <Clock className="w-3.5 h-3.5 text-nexus-light" />}
                            </motion.div>
                            {!isLast && (
                                <div className={cn(
                                    'w-0.5 flex-1 min-h-[20px] my-1',
                                    isDone && !isRejection ? 'bg-emerald-300' : 'bg-nexus-border'
                                )} />
                            )}
                        </div>

                        {/* Content */}
                        <div className={cn('pb-4 flex-1', isLast && 'pb-0')}>
                            <p className={cn(
                                'text-sm font-semibold leading-tight',
                                isDone && !isRejection && 'text-emerald-700',
                                isDone && isRejection && 'text-red-600',
                                !isDone && 'text-nexus-muted',
                            )}>
                                {STAGE_META[stage]?.label ?? stage}
                            </p>
                            {event ? (
                                <>
                                    <p className="text-xs text-nexus-muted mt-0.5">
                                        {event.actor_name} · <span className="italic">{event.actor_role}</span>
                                    </p>
                                    <p className="text-xs text-nexus-light mt-0.5">{formatTs(event.timestamp)}</p>
                                    {event.note && (
                                        <div className="mt-1.5 p-2 bg-red-50 border border-red-200 rounded-lg">
                                            <div className="flex items-start gap-1.5">
                                                <AlertCircle className="w-3 h-3 text-red-500 flex-shrink-0 mt-0.5" />
                                                <p className="text-xs text-red-700"><span className="font-semibold">Reason:</span> {event.note}</p>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <p className="text-xs text-nexus-light mt-0.5">Pending</p>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
