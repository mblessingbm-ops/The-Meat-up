// types/production.ts

export type ProductionOrderStatus =
  | 'pending_signoff'          // Received by rep, awaiting executive sign-off
  | 'signed_off'               // Executive approved, awaiting fabric assessment
  | 'fabric_confirmed'         // All fabric in stock, ready for cutting
  | 'fabric_sourcing'          // PO raised, waiting for fabric delivery
  | 'in_production'            // At least one sub-job has started cutting
  | 'completed'                // All sub-jobs dispatched
  | 'cancelled'

export type SubJobStatus =
  | 'queued'                   // Not yet started
  | 'cutting'                  // In cutting department
  | 'cut_complete'             // Panels ready, awaiting sewing/printing
  | 'in_progress'              // Sewing and/or printing underway (parallel)
  | 'finishing'                // In finishing / QC / packaging
  | 'dispatched'               // Left the building
  | 'on_hold'                  // Blocked — reason recorded

export type UrgencyLevel = 'standard' | 'urgent' | 'critical'
// standard: normal lead time (5+ days)
// urgent: 24–48 hours
// critical: under 24 hours — overnight shift may be required

export type FabricStatus =
  | 'not_assessed'             // Not yet checked — default on sign-off
  | 'in_stock'                 // Confirmed available in warehouse
  | 'partial_stock'            // Some available, remainder being sourced
  | 'sourcing'                 // PO raised, awaiting delivery
  | 'delivered'                // Sourced fabric has arrived

export type ProductionStage =
  | 'cutting'
  | 'sewing'
  | 'printing'
  | 'finishing'
  | 'quality_check'
  | 'packaging'
  | 'dispatch'

export type ProductionAlertType =
  | 'fabric_not_confirmed'     // 1hr after executive sign-off, fabric still not_assessed
  | 'cutting_not_started'      // Fabric confirmed but cutting not started within threshold
  | 'order_behind_pace'        // Actual pace < required pace to meet deadline
  | 'overnight_shift_required' // Pace implies overnight production, no decision recorded
  | 'subjob_on_hold'           // A sub-job has been placed on hold

export type OrderRiskStatus = 'on_track' | 'at_risk' | 'critical' | 'overdue'

export interface SizeBreakdown {
  XS?: number
  S?: number
  M?: number
  L?: number
  XL?: number
  XXL?: number
  XXXL?: number
  [customSize: string]: number | undefined
}

export interface SubJobStage {
  stageName: ProductionStage
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  startedAt?: string           // ISO datetime
  completedAt?: string
  startedBy?: string           // User full name
  completedBy?: string
  piecesIn?: number            // Pieces received at this stage
  piecesOut?: number           // Pieces leaving this stage (may differ — QC rejects)
  notes?: string
  durationMinutes?: number     // Calculated: completedAt - startedAt
}

export interface SubJob {
  id: string
  productionOrderId: string
  subJobNo: string             // e.g. SJ-001, SJ-002
  productType: string          // e.g. 'T-Shirt', 'Golf Shirt', 'Polo'
  colour: string
  totalQuantity: number
  sizeBreakdown: SizeBreakdown

  // Print / style specification
  hasPrinting: boolean
  printDescription?: string    // e.g. 'Front chest logo + back graphic, 4 colours'
  printColourCount?: number    // More colours = slower printing
  hasEmbroidery?: boolean
  styleNotes?: string          // e.g. 'French seam, concealed zip placket'
  complexityRating: 'simple' | 'standard' | 'complex'
  // simple:   plain, one colour or no print
  // standard: 1–2 colour print, standard construction
  // complex:  3+ colour print or complex construction

  // Fabric
  fabricType: string
  fabricColour: string
  fabricQuantityMetres: number
  fabricStatus: FabricStatus
  fabricLinkedPOId?: string    // Links to PurchaseOrder if sourcing required

  // Pipeline stages
  stages: SubJobStage[]

  // Parallel stream tracking
  sewingRequired: boolean
  sewingStarted: boolean
  sewingCompleted: boolean
  sewingPiecesCompleted: number

  printingRequired: boolean
  printingStarted: boolean
  printingCompleted: boolean
  printingPiecesCompleted: number

  finishingStarted: boolean
  finishingCompleted: boolean
  finishingPiecesCompleted: number

  status: SubJobStatus
  onHoldReason?: string

  // Pace tracking — only active when urgencyLevel is 'urgent' or 'critical'
  pieceCountTrackingEnabled: boolean
}

export interface ProductionOrder {
  id: string
  orderNo: string              // e.g. PO-2026-0047
  clientOrderRef: string       // Links to sales invoice / quotation number
  clientName: string
  company: 'Kingsport' | 'Bralyn' | 'SGA'

  // People
  receivedBy: string           // Sales rep name
  signedOffBy?: string         // Executive name
  signedOffAt?: string         // ISO datetime — triggers fabric assessment alert timer

  // Timeline — the most important fields in the system
  orderReceivedAt: string      // ISO datetime
  deadlineAt: string           // ISO datetime — when order must leave the building
  urgencyLevel: UrgencyLevel
  overnightShiftRequired?: boolean
  overnightShiftConfirmedBy?: string
  overnightShiftConfirmedAt?: string

  // Sub-jobs
  subJobs: SubJob[]

  // Overall status (derived from sub-job statuses)
  status: ProductionOrderStatus

  // Risk — calculated continuously from pace data
  riskStatus: OrderRiskStatus
  riskReason?: string          // Human-readable reason for current risk status

  // Fabric summary
  allFabricConfirmed: boolean  // True only when every sub-job fabric is confirmed

  // Linked purchase orders for sourced fabric
  linkedPurchaseOrderIds: string[]

  notes: string
  internalNotes: string        // Not shared with client
}

// Pace calculation — computed on every render, never stored
export interface PaceCalculation {
  subJobId: string
  totalPieces: number
  piecesCompleted: number
  piecesRemaining: number
  hoursRemaining: number
  requiredPacePerHour: number  // piecesRemaining / hoursRemaining
  actualPacePerHour: number    // based on recent piece count recordings
  paceDelta: number            // actualPace - requiredPace (negative = falling behind)
  isAtRisk: boolean            // true when actualPace < requiredPace * 0.9
  projectedCompletionTime: string // ISO datetime based on actual pace
  willMeetDeadline: boolean
}

// Department load — computed across all active orders
export interface DepartmentLoad {
  department: ProductionStage
  activeJobs: number           // Sub-jobs currently in this stage
  supervisorName?: string
  isOverloaded: boolean        // true when activeJobs > 2
  subJobIds: string[]
}

// Proactive alert
export interface ProductionAlert {
  id: string
  productionOrderId: string
  subJobId?: string
  alertType: ProductionAlertType
  severity: 'warning' | 'critical'
  message: string
  raisedAt: string             // ISO datetime
  acknowledgedBy?: string
  acknowledgedAt?: string
  resolved: boolean
}
