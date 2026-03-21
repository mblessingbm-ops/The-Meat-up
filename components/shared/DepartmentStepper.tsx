'use client'

// ─── components/shared/DepartmentStepper.tsx ──────────────────────────────────
// Reusable vertical stepper for the production order department sequence.

import { motion } from 'framer-motion'
import { CheckCircle, Circle, Loader2, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeptStep, DeptStatus } from '@/lib/production'

interface DepartmentStepperProps {
    steps: DeptStep[]
    canAction: boolean  // whether the logged-in user can mark in-progress/complete
    onMarkInProgress: (index: number, units: number) => void
    onMarkComplete: (index: number, unitsOut: number) => void
    totalOrdered: number
}

const STATUS_ICON: Record<DeptStatus, React.ReactNode> = {
    pending: <Circle className="w-4 h-4 text-nexus-border" />,
    in_progress: <Loader2 className="w-4 h-4 text-brand-600 animate-spin" />,
    completed: <CheckCircle className="w-4 h-4 text-emerald-500" />,
}

const STATUS_LABEL: Record<DeptStatus, string> = {
    pending: 'Pending',
    in_progress: 'In Progress',
    completed: 'Completed',
}

const STATUS_COLOR: Record<DeptStatus, string> = {
    pending: 'text-nexus-muted',
    in_progress: 'text-brand-600',
    completed: 'text-emerald-600',
}

import React, { useState } from 'react'

export default function DepartmentStepper({ steps, canAction, onMarkInProgress, onMarkComplete, totalOrdered }: DepartmentStepperProps) {
    const [unitsInput, setUnitsInput] = useState<Record<number, string>>({})

    const firstPendingIdx = steps.findIndex(s => s.status === 'pending')
    const firstInProgIdx = steps.findIndex(s => s.status === 'in_progress')

    return (
        <div className="space-y-0">
            {steps.map((step, i) => {
                const isLastItem = i === steps.length - 1
                const isCurrentPending = i === firstPendingIdx && firstInProgIdx === -1
                const isCurrentInProg = i === firstInProgIdx

                return (
                    <motion.div
                        key={`${step.department}-${i}`}
                        className="flex gap-4"
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.07 }}
                    >
                        {/* Connector column */}
                        <div className="flex flex-col items-center">
                            <div className={cn(
                                'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2',
                                step.status === 'completed' ? 'border-emerald-300 bg-emerald-50' :
                                    step.status === 'in_progress' ? 'border-brand-300 bg-brand-50' :
                                        'border-nexus-border bg-surface-muted'
                            )}>
                                {STATUS_ICON[step.status]}
                            </div>
                            {!isLastItem && <div className="w-px flex-1 bg-nexus-border mt-1 mb-1 min-h-[16px]" />}
                        </div>

                        {/* Content */}
                        <div className={cn('flex-1 pb-5', isLastItem && 'pb-0')}>
                            <div className="flex items-center justify-between mb-1">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm text-nexus-ink">{step.department}</span>
                                    <span className={cn('text-xs font-semibold', STATUS_COLOR[step.status])}>
                                        {STATUS_LABEL[step.status]}
                                    </span>
                                </div>
                                {step.status === 'completed' && step.units_out !== undefined && (
                                    <span className="text-xs text-emerald-600 font-semibold num">{step.units_out} units out</span>
                                )}
                            </div>

                            {step.status === 'completed' && (
                                <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs space-y-1">
                                    <div className="flex justify-between"><span className="text-nexus-muted">Completed by</span><span className="text-nexus-ink font-medium">{step.completed_by}</span></div>
                                    {step.completed_at && <div className="flex justify-between"><span className="text-nexus-muted">Completed at</span><span className="text-nexus-ink">{new Date(step.completed_at).toLocaleString('en-ZW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>}
                                    {step.units_in !== undefined && <div className="flex justify-between"><span className="text-nexus-muted">Units received</span><span className="text-nexus-ink font-medium">{step.units_in}</span></div>}
                                    {step.units_out !== undefined && step.units_in !== undefined && step.units_out < step.units_in && (
                                        <div className="flex justify-between"><span className="text-red-500">Variance</span><span className="text-red-600 font-semibold">−{step.units_in - step.units_out} units</span></div>
                                    )}
                                </div>
                            )}

                            {step.status === 'in_progress' && (
                                <div className="bg-brand-50/60 border border-brand-100 rounded-xl p-3 text-xs space-y-2">
                                    {step.units_in !== undefined && (
                                        <div className="flex justify-between"><span className="text-nexus-muted">Units in dept</span><span className="text-brand-700 font-semibold">{step.units_in}</span></div>
                                    )}
                                    {step.started_at && (
                                        <div className="flex justify-between"><span className="text-nexus-muted">Started</span><span className="text-nexus-ink">{new Date(step.started_at).toLocaleString('en-ZW', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span></div>
                                    )}
                                    {canAction && isCurrentInProg && (
                                        <div className="pt-1 space-y-1.5">
                                            <label className="text-nexus-muted">Units completed (out)</label>
                                            <div className="flex gap-2">
                                                <input
                                                    type="number"
                                                    className="input text-sm py-1.5 flex-1"
                                                    placeholder={`e.g. ${step.units_in ?? totalOrdered}`}
                                                    value={unitsInput[i] ?? ''}
                                                    onChange={e => setUnitsInput(u => ({ ...u, [i]: e.target.value }))}
                                                    min="0"
                                                    max={step.units_in ?? totalOrdered}
                                                />
                                                <button
                                                    onClick={() => {
                                                        const v = parseInt(unitsInput[i] ?? '')
                                                        if (!isNaN(v) && v >= 0) onMarkComplete(i, v)
                                                    }}
                                                    className="btn-primary btn-sm text-xs"
                                                >
                                                    <CheckCircle className="w-3.5 h-3.5" />Mark Complete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {step.status === 'pending' && isCurrentPending && canAction && (
                                <div className="mt-2 space-y-1.5">
                                    <div className="flex gap-2">
                                        <input
                                            type="number"
                                            className="input text-sm py-1.5 max-w-[160px]"
                                            placeholder={`Units entering dept (${totalOrdered})`}
                                            value={unitsInput[i] ?? ''}
                                            onChange={e => setUnitsInput(u => ({ ...u, [i]: e.target.value }))}
                                            min="1"
                                        />
                                        <button
                                            onClick={() => {
                                                const v = parseInt(unitsInput[i] ?? String(totalOrdered))
                                                onMarkInProgress(i, isNaN(v) ? totalOrdered : v)
                                            }}
                                            className="btn-secondary btn-sm text-xs"
                                        >
                                            <ChevronRight className="w-3.5 h-3.5" />Mark In Progress
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
