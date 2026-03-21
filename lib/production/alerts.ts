// lib/production/alerts.ts

import type { ProductionOrder, ProductionAlert, ProductionAlertType } from '@/types/production'

export function checkFabricAlert(
  order: ProductionOrder,
  existingAlerts: ProductionAlert[]
): ProductionAlert | null {
  if (!order.signedOffAt) return null

  const thresholdMinutes = {
    critical: 30,
    urgent: 60,
    standard: 120,
  }[order.urgencyLevel]

  const signedOffTime = new Date(order.signedOffAt).getTime()
  const minutesSinceSignOff = (Date.now() - signedOffTime) / 60000

  const unassessedSubJob = order.subJobs.find(
    sj => sj.fabricStatus === 'not_assessed'
  )

  const alreadyRaised = existingAlerts.some(
    a => a.productionOrderId === order.id &&
         a.alertType === 'fabric_not_confirmed' &&
         !a.resolved
  )

  if (
    minutesSinceSignOff >= thresholdMinutes &&
    unassessedSubJob &&
    !alreadyRaised
  ) {
    return {
      id: `alert-${Date.now()}`,
      productionOrderId: order.id,
      subJobId: unassessedSubJob.id,
      alertType: 'fabric_not_confirmed',
      severity: order.urgencyLevel === 'critical' ? 'critical' : 'warning',
      message: `Fabric not assessed — ${order.orderNo} (${order.clientName}) was signed off ${Math.round(minutesSinceSignOff)} minutes ago but fabric has not been confirmed for ${unassessedSubJob.productType}. Cutting cannot begin. Deadline: ${new Date(order.deadlineAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}.`,
      raisedAt: new Date().toISOString(),
      resolved: false,
    }
  }
  return null
}

export function checkCuttingAlert(
  order: ProductionOrder,
  existingAlerts: ProductionAlert[]
): ProductionAlert | null {
  const thresholdHours = {
    critical: 0.5,
    urgent: 2,
    standard: 4,
  }[order.urgencyLevel]

  for (const subJob of order.subJobs) {
    const fabricReady =
      subJob.fabricStatus === 'in_stock' || subJob.fabricStatus === 'delivered'
    const cuttingStage = subJob.stages.find(s => s.stageName === 'cutting')
    const cuttingNotStarted = !cuttingStage || cuttingStage.status === 'pending'

    const fabricConfirmedAt = order.signedOffAt
    if (!fabricConfirmedAt) continue

    const hoursSinceFabricConfirmed =
      (Date.now() - new Date(fabricConfirmedAt).getTime()) / 3600000
    const hoursToDeadline =
      (new Date(order.deadlineAt).getTime() - Date.now()) / 3600000

    const alreadyRaised = existingAlerts.some(
      a => a.productionOrderId === order.id &&
           a.subJobId === subJob.id &&
           a.alertType === 'cutting_not_started' &&
           !a.resolved
    )

    if (
      fabricReady &&
      cuttingNotStarted &&
      hoursSinceFabricConfirmed >= thresholdHours &&
      !alreadyRaised
    ) {
      return {
        id: `alert-${Date.now()}`,
        productionOrderId: order.id,
        subJobId: subJob.id,
        alertType: 'cutting_not_started',
        severity: order.urgencyLevel === 'critical' ? 'critical' : 'warning',
        message: `Cutting not started — ${order.orderNo} (${order.clientName}) fabric was confirmed ${hoursSinceFabricConfirmed.toFixed(1)} hours ago but cutting has not been marked as started. ${hoursToDeadline.toFixed(1)} hours remaining.`,
        raisedAt: new Date().toISOString(),
        resolved: false,
      }
    }
  }
  return null
}

export function checkPaceAlert(
  order: ProductionOrder,
  paceCalculations: Map<string, { current: number; previous: number }>,
  existingAlerts: ProductionAlert[]
): ProductionAlert | null {
  for (const subJob of order.subJobs) {
    if (!subJob.pieceCountTrackingEnabled) continue

    const pace = paceCalculations.get(subJob.id)
    if (!pace) continue

    const isBehindTwiceConsecutively =
      pace.current < 0 && pace.previous < 0

    const alreadyRaised = existingAlerts.some(
      a => a.productionOrderId === order.id &&
           a.subJobId === subJob.id &&
           a.alertType === 'order_behind_pace' &&
           !a.resolved
    )

    if (isBehindTwiceConsecutively && !alreadyRaised) {
      return {
        id: `alert-${Date.now()}`,
        productionOrderId: order.id,
        subJobId: subJob.id,
        alertType: 'order_behind_pace',
        severity: Math.abs(pace.current) > 0.25 ? 'critical' : 'warning',
        message: `Order behind pace — ${order.orderNo} (${order.clientName}): ${subJob.productType} is falling behind the pace required to meet the deadline.`,
        raisedAt: new Date().toISOString(),
        resolved: false,
      }
    }
  }
  return null
}

export function checkAllAlerts(
  orders: ProductionOrder[],
  existingAlerts: ProductionAlert[]
): ProductionAlert[] {
  const newAlerts: ProductionAlert[] = []
  const emptyPaceMap = new Map<string, { current: number; previous: number }>()

  for (const order of orders) {
    const fabricAlert = checkFabricAlert(order, [...existingAlerts, ...newAlerts])
    if (fabricAlert) newAlerts.push(fabricAlert)

    const cuttingAlert = checkCuttingAlert(order, [...existingAlerts, ...newAlerts])
    if (cuttingAlert) newAlerts.push(cuttingAlert)

    const paceAlert = checkPaceAlert(order, emptyPaceMap, [...existingAlerts, ...newAlerts])
    if (paceAlert) newAlerts.push(paceAlert)
  }

  return newAlerts
}

export const ALERT_TYPE_LABELS: Record<ProductionAlertType, string> = {
  fabric_not_confirmed: 'Fabric not confirmed',
  cutting_not_started: 'Cutting not started',
  order_behind_pace: 'Order behind pace',
  overnight_shift_required: 'Overnight shift required',
  subjob_on_hold: 'Sub-job on hold',
}

export const ALERT_ACTION_LABELS: Partial<Record<ProductionAlertType, string>> = {
  fabric_not_confirmed: 'Confirm Fabric',
  cutting_not_started: 'Mark Cutting Started',
  order_behind_pace: 'View Order',
  overnight_shift_required: 'Confirm Overnight Shift',
  subjob_on_hold: 'View Order',
}
