// lib/production/pace.ts

import type { SubJob, PaceCalculation, ProductionOrder, DepartmentLoad, ProductionStage } from '@/types/production'

export function calculatePace(
  subJob: SubJob,
  deadlineAt: string
): PaceCalculation {
  const now = new Date()
  const deadline = new Date(deadlineAt)

  const hoursRemaining = Math.max(
    0,
    (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
  )

  // Use the furthest-along parallel stream as the reference
  const piecesCompleted = Math.max(
    subJob.sewingPiecesCompleted,
    subJob.printingPiecesCompleted,
    subJob.finishingPiecesCompleted
  )

  const piecesRemaining = Math.max(0, subJob.totalQuantity - piecesCompleted)

  const requiredPacePerHour =
    hoursRemaining > 0 ? piecesRemaining / hoursRemaining : Infinity

  // Actual pace — derived from complexity rating for mock data
  // In production this comes from the delta between two piece count recordings
  const actualPacePerHour = simulateActualPace(subJob, requiredPacePerHour)

  const projectedHoursToComplete =
    actualPacePerHour > 0 ? piecesRemaining / actualPacePerHour : Infinity

  const projectedCompletionTime = new Date(
    now.getTime() + projectedHoursToComplete * 60 * 60 * 1000
  ).toISOString()

  const paceDelta = actualPacePerHour - requiredPacePerHour
  // 10% buffer — flag as at risk before it becomes critical
  const isAtRisk = actualPacePerHour < requiredPacePerHour * 0.9

  return {
    subJobId: subJob.id,
    totalPieces: subJob.totalQuantity,
    piecesCompleted,
    piecesRemaining,
    hoursRemaining: Math.round(hoursRemaining * 10) / 10,
    requiredPacePerHour: Math.round(requiredPacePerHour * 10) / 10,
    actualPacePerHour: Math.round(actualPacePerHour * 10) / 10,
    paceDelta: Math.round(paceDelta * 10) / 10,
    isAtRisk,
    projectedCompletionTime,
    willMeetDeadline: new Date(projectedCompletionTime) <= deadline,
  }
}

function simulateActualPace(
  subJob: SubJob,
  requiredPace: number
): number {
  // Simulate pace based on complexity rating
  // complex orders run slower, simple orders run faster
  const complexityMultiplier = {
    simple: 1.1,
    standard: 0.95,
    complex: 0.78,
  }[subJob.complexityRating]

  return requiredPace * complexityMultiplier
}

export function getTimeRemainingLabel(deadlineAt: string): {
  label: string
  colour: 'slate' | 'amber' | 'red'
  bold: boolean
  pulse: boolean
  hours: number
} {
  const hours = (new Date(deadlineAt).getTime() - Date.now()) / 3600000

  if (hours > 8)
    return { label: `${Math.round(hours)}h remaining`, colour: 'slate', bold: false, pulse: false, hours }
  if (hours > 4)
    return { label: `${Math.round(hours)}h remaining`, colour: 'amber', bold: true, pulse: false, hours }
  if (hours > 1)
    return { label: `${Math.round(hours)}h remaining`, colour: 'red', bold: true, pulse: false, hours }
  if (hours > 0)
    return { label: `${Math.round(hours * 60)}min remaining`, colour: 'red', bold: true, pulse: true, hours }

  return { label: 'OVERDUE', colour: 'red', bold: true, pulse: true, hours }
}

export function getTimeRemainingStyle(hoursRemaining: number): string {
  if (hoursRemaining > 8) return 'text-gray-600 font-normal'
  if (hoursRemaining > 4) return 'text-amber-600 font-medium'
  if (hoursRemaining > 1) return 'text-red-600 font-bold'
  return 'text-red-600 font-bold animate-pulse'
}

export function calculateDepartmentLoad(
  orders: ProductionOrder[]
): DepartmentLoad[] {
  const departments: ProductionStage[] = [
    'cutting', 'sewing', 'printing', 'finishing', 'dispatch'
  ]

  const supervisors: Record<string, string> = {
    sewing: 'Sewing Supervisor',
    printing: 'Printing Supervisor',
    finishing: 'Finishing Supervisor',
    dispatch: 'Dispatch Supervisor',
  }

  return departments.map(dept => {
    const activeSubJobs = orders.flatMap(o =>
      o.subJobs.filter(sj => {
        const stage = sj.stages.find(s => s.stageName === dept)
        return stage?.status === 'in_progress'
      })
    )

    return {
      department: dept,
      activeJobs: activeSubJobs.length,
      supervisorName: supervisors[dept],
      isOverloaded: activeSubJobs.length > 2,
      subJobIds: activeSubJobs.map(sj => sj.id),
    }
  })
}

export function formatRelativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} minute${mins > 1 ? 's' : ''} ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

export function formatDeadline(isoString: string): string {
  return new Date(isoString).toLocaleString('en-GB', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Sort orders: critical risk first, then at_risk, then by deadline soonest
export function sortOrdersByPriority(orders: ProductionOrder[]): ProductionOrder[] {
  const riskOrder: Record<string, number> = {
    overdue: 0,
    critical: 1,
    at_risk: 2,
    on_track: 3,
  }

  return [...orders].sort((a, b) => {
    const riskDiff = (riskOrder[a.riskStatus] ?? 4) - (riskOrder[b.riskStatus] ?? 4)
    if (riskDiff !== 0) return riskDiff
    return new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime()
  })
}

// Check if overnight shift might be needed based on projected completion
export function checkOvernightRequired(projectedCompletionTime: string): boolean {
  const hour = new Date(projectedCompletionTime).getHours()
  return hour >= 22 || hour < 6
}
