/**
 * lib/fleet.ts
 * Vehicle register for Kingsport fleet — 21 vehicles
 * Created March 2026
 */

export type VehicleType = 'Personal' | 'Pool' | 'Delivery'

export interface FleetVehicle {
  id: string
  vehicleType: VehicleType
  assignedTo: string            // employee name, 'Pool', or 'Delivery'
  assignedEmployeeId?: string   // linked to HR employee id
  make: string
  model: string
  registration: string
  weeklyAllocationLitres: number
  isActive: boolean
  notes?: string
}

export interface FuelPriceEntry {
  price: number
  effective_date: string
  set_by: string
}

export interface VehicleFuelLineItem {
  vehicleId: string
  registration: string
  assignedTo: string
  make: string
  model: string
  maxAllocation: number
  estRemaining: number | null
  dispensed: number
  priceAtTime: number
  amount: number
  notes: string
  isNil: boolean
}

export type FuelEntryStatus = 'draft' | 'posted'

export interface FuelEntry {
  id: string
  weekStart: string   // Monday ISO date
  weekEnd: string     // Sunday ISO date
  pricePerLitre: number
  lines: VehicleFuelLineItem[]
  totalDispensed: number
  maxAllocation: number
  utilisationPct: number
  totalCost: number
  postedBy: string
  status: FuelEntryStatus
  createdAt: string
}

// ─── 21 Vehicles ───────────────────────────────────────────────────────────────
export const MOCK_VEHICLES: FleetVehicle[] = [
  { id: 'v01', vehicleType: 'Personal', assignedTo: 'Lucia Chiwanza',   assignedEmployeeId: 'sl01', make: 'Toyota',  model: 'Premio',   registration: 'AEI 0105', weeklyAllocationLitres: 40, isActive: true },
  { id: 'v02', vehicleType: 'Personal', assignedTo: 'Ernest Mutizwa',   assignedEmployeeId: 'sl09', make: 'Toyota',  model: 'Premio',   registration: 'AEP 8140', weeklyAllocationLitres: 40, isActive: true },
  { id: 'v03', vehicleType: 'Personal', assignedTo: 'Sylvester Chigova',assignedEmployeeId: 'sl10', make: 'Toyota',  model: 'Premio',   registration: 'ACY 8991', weeklyAllocationLitres: 40, isActive: true },
  { id: 'v04', vehicleType: 'Personal', assignedTo: 'Chiedza Jowa',     assignedEmployeeId: 'sl02', make: 'Nissan',  model: 'Tiida',    registration: 'AEW 3246', weeklyAllocationLitres: 35, isActive: true },
  { id: 'v05', vehicleType: 'Personal', assignedTo: 'Thandeka Madeya',  assignedEmployeeId: 'sl03', make: 'Toyota',  model: 'Vitz',     registration: 'AFD 1583', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v06', vehicleType: 'Personal', assignedTo: 'Sandra Mwanza',    assignedEmployeeId: 'sl04', make: 'Toyota',  model: 'Vitz',     registration: 'AFD 1584', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v07', vehicleType: 'Personal', assignedTo: 'Dudzai Ndemera',   assignedEmployeeId: 'sl07', make: 'Toyota',  model: 'Vitz',     registration: 'AFD 1502', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v08', vehicleType: 'Personal', assignedTo: 'Spiwe Mandizha',   assignedEmployeeId: 'sl05', make: 'Toyota',  model: 'Vitz',     registration: 'AFL 1909', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v09', vehicleType: 'Personal', assignedTo: 'Energy Deshe',     assignedEmployeeId: 'ex04', make: 'Toyota',  model: 'Mark X',   registration: 'AFD 1647', weeklyAllocationLitres: 45, isActive: true },
  { id: 'v10', vehicleType: 'Personal', assignedTo: 'Taurai Maputi',    assignedEmployeeId: 'of01', make: 'Toyota',  model: 'Corolla',  registration: 'ADB 4360', weeklyAllocationLitres: 40, isActive: true },
  { id: 'v11', vehicleType: 'Personal', assignedTo: 'Phineas Mhako',    assignedEmployeeId: 'of03', make: 'Toyota',  model: 'Premio',   registration: 'AEW 3522', weeklyAllocationLitres: 40, isActive: true },
  { id: 'v12', vehicleType: 'Personal', assignedTo: 'Tobias Mazadza',   assignedEmployeeId: 'of04', make: 'Nissan',  model: 'Note',     registration: 'AGS 2733', weeklyAllocationLitres: 20, isActive: true },
  { id: 'v13', vehicleType: 'Personal', assignedTo: 'Jacob Diza',       assignedEmployeeId: 'of02', make: 'Nissan',  model: 'Champ',    registration: 'AEN 2441', weeklyAllocationLitres: 25, isActive: true },
  { id: 'v14', vehicleType: 'Pool',     assignedTo: 'Pool',             make: 'Toyota',  model: 'Allion',   registration: 'AEI 5393', weeklyAllocationLitres: 40, isActive: true },
  { id: 'v15', vehicleType: 'Pool',     assignedTo: 'Pool',             make: 'Nissan',  model: 'Sunny',    registration: 'AFM 8530', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v16', vehicleType: 'Pool',     assignedTo: 'Pool',             make: 'Mazda',   model: 'BT-50',    registration: 'AGI 5330', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v17', vehicleType: 'Pool',     assignedTo: 'Pool',             make: 'Toyota',  model: 'Belta',    registration: 'AFL 1905', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v18', vehicleType: 'Delivery', assignedTo: 'Delivery',         make: 'Toyota',  model: 'Hiace',    registration: 'AFD 1504', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v19', vehicleType: 'Delivery', assignedTo: 'Delivery',         make: 'Toyota',  model: 'Hiace',    registration: 'AFS 5297', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v20', vehicleType: 'Delivery', assignedTo: 'Delivery',         make: 'Toyota',  model: 'Hiace',    registration: 'AEW 4648', weeklyAllocationLitres: 30, isActive: true },
  { id: 'v21', vehicleType: 'Delivery', assignedTo: 'Delivery',         make: 'Toyota',  model: 'Toyoace',  registration: 'ADK 5730', weeklyAllocationLitres: 30, isActive: true },
]

export const TOTAL_WEEKLY_ALLOCATION = MOCK_VEHICLES.reduce((s, v) => s + v.weeklyAllocationLitres, 0) // 695

export const FUEL_PRICE_HISTORY: FuelPriceEntry[] = [
  { price: 1.71, effective_date: '2026-01-01', set_by: 'Ashleigh Kurira' },
]

export function currentFuelPrice(): FuelPriceEntry {
  return FUEL_PRICE_HISTORY[FUEL_PRICE_HISTORY.length - 1]
}

// ─── Mock Fuel Entries ────────────────────────────────────────────────────────
// Entry 1: Week 24 Feb – 01 Mar 2026 · Posted · actual dispensed per vehicle
const ENTRY1_LINES: Omit<VehicleFuelLineItem, 'priceAtTime' | 'amount'>[] = [
  { vehicleId: 'v01', registration: 'AEI 0105', assignedTo: 'Lucia Chiwanza',    make: 'Toyota', model: 'Premio',  maxAllocation: 40, estRemaining: 10, dispensed: 30, notes: '10L remaining from previous week', isNil: false },
  { vehicleId: 'v02', registration: 'AEP 8140', assignedTo: 'Ernest Mutizwa',    make: 'Toyota', model: 'Premio',  maxAllocation: 40, estRemaining: null, dispensed: 40, notes: '', isNil: false },
  { vehicleId: 'v03', registration: 'ACY 8991', assignedTo: 'Sylvester Chigova', make: 'Toyota', model: 'Premio',  maxAllocation: 40, estRemaining: null, dispensed: 40, notes: '', isNil: false },
  { vehicleId: 'v04', registration: 'AEW 3246', assignedTo: 'Chiedza Jowa',      make: 'Nissan', model: 'Tiida',   maxAllocation: 35, estRemaining: null, dispensed: 25, notes: 'Tank not empty', isNil: false },
  { vehicleId: 'v05', registration: 'AFD 1583', assignedTo: 'Thandeka Madeya',   make: 'Toyota', model: 'Vitz',    maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
  { vehicleId: 'v06', registration: 'AFD 1584', assignedTo: 'Sandra Mwanza',     make: 'Toyota', model: 'Vitz',    maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
  { vehicleId: 'v07', registration: 'AFD 1502', assignedTo: 'Dudzai Ndemera',    make: 'Toyota', model: 'Vitz',    maxAllocation: 30, estRemaining: 10,   dispensed: 20, notes: '10L remaining', isNil: false },
  { vehicleId: 'v08', registration: 'AFL 1909', assignedTo: 'Spiwe Mandizha',    make: 'Toyota', model: 'Vitz',    maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
  { vehicleId: 'v09', registration: 'AFD 1647', assignedTo: 'Energy Deshe',      make: 'Toyota', model: 'Mark X',  maxAllocation: 45, estRemaining: null, dispensed: 45, notes: '', isNil: false },
  { vehicleId: 'v10', registration: 'ADB 4360', assignedTo: 'Taurai Maputi',     make: 'Toyota', model: 'Corolla', maxAllocation: 40, estRemaining: null, dispensed: 40, notes: '', isNil: false },
  { vehicleId: 'v11', registration: 'AEW 3522', assignedTo: 'Phineas Mhako',     make: 'Toyota', model: 'Premio',  maxAllocation: 40, estRemaining: null, dispensed: 40, notes: '', isNil: false },
  { vehicleId: 'v12', registration: 'AGS 2733', assignedTo: 'Tobias Mazadza',    make: 'Nissan', model: 'Note',    maxAllocation: 20, estRemaining: null, dispensed: 20, notes: '', isNil: false },
  { vehicleId: 'v13', registration: 'AEN 2441', assignedTo: 'Jacob Diza',        make: 'Nissan', model: 'Champ',   maxAllocation: 25, estRemaining: null, dispensed: 25, notes: '', isNil: false },
  { vehicleId: 'v14', registration: 'AEI 5393', assignedTo: 'Pool',              make: 'Toyota', model: 'Allion',  maxAllocation: 40, estRemaining: null, dispensed: 40, notes: 'Pool car', isNil: false },
  { vehicleId: 'v15', registration: 'AFM 8530', assignedTo: 'Pool',              make: 'Nissan', model: 'Sunny',   maxAllocation: 30, estRemaining: null, dispensed: 0,  notes: 'Nil — not used this week', isNil: true },
  { vehicleId: 'v16', registration: 'AGI 5330', assignedTo: 'Pool',              make: 'Mazda',  model: 'BT-50',   maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
  { vehicleId: 'v17', registration: 'AFL 1905', assignedTo: 'Pool',              make: 'Toyota', model: 'Belta',   maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
  { vehicleId: 'v18', registration: 'AFD 1504', assignedTo: 'Delivery',          make: 'Toyota', model: 'Hiace',   maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
  { vehicleId: 'v19', registration: 'AFS 5297', assignedTo: 'Delivery',          make: 'Toyota', model: 'Hiace',   maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
  { vehicleId: 'v20', registration: 'AEW 4648', assignedTo: 'Delivery',          make: 'Toyota', model: 'Hiace',   maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
  { vehicleId: 'v21', registration: 'ADK 5730', assignedTo: 'Delivery',          make: 'Toyota', model: 'Toyoace', maxAllocation: 30, estRemaining: null, dispensed: 30, notes: '', isNil: false },
]

function buildLines(base: typeof ENTRY1_LINES, price: number): VehicleFuelLineItem[] {
  return base.map(l => ({ ...l, priceAtTime: price, amount: parseFloat((l.dispensed * price).toFixed(2)) }))
}

const PRICE_JAN = 1.71
const entry1Lines = buildLines(ENTRY1_LINES, PRICE_JAN)
const entry1Dispensed = entry1Lines.reduce((s, l) => s + l.dispensed, 0) // 655
const entry1Max = TOTAL_WEEKLY_ALLOCATION // 695
const entry1Cost = parseFloat((entry1Dispensed * PRICE_JAN).toFixed(2))

// Entry 2: Week 03 Mar – 09 Mar 2026 · Draft · 8 vehicles filled, 13 still 0
const ENTRY2_PARTIAL = MOCK_VEHICLES.map((v, i) => ({
  vehicleId: v.id,
  registration: v.registration,
  assignedTo: v.assignedTo,
  make: v.make,
  model: v.model,
  maxAllocation: v.weeklyAllocationLitres,
  estRemaining: null as number | null,
  dispensed: i < 8 ? v.weeklyAllocationLitres : 0,
  priceAtTime: PRICE_JAN,
  amount: i < 8 ? parseFloat((v.weeklyAllocationLitres * PRICE_JAN).toFixed(2)) : 0,
  notes: '',
  isNil: false,
}))
const entry2Dispensed = ENTRY2_PARTIAL.reduce((s, l) => s + l.dispensed, 0)

export const MOCK_FUEL_ENTRIES: FuelEntry[] = [
  {
    id: 'fuel-2026-02-0001',
    weekStart: '2026-02-24',
    weekEnd: '2026-03-01',
    pricePerLitre: PRICE_JAN,
    lines: entry1Lines,
    totalDispensed: entry1Dispensed,
    maxAllocation: entry1Max,
    utilisationPct: parseFloat(((entry1Dispensed / entry1Max) * 100).toFixed(1)),
    totalCost: entry1Cost,
    postedBy: 'Ashleigh Kurira',
    status: 'posted',
    createdAt: '2026-03-02T08:30:00Z',
  },
  {
    id: 'fuel-2026-03-0001',
    weekStart: '2026-03-03',
    weekEnd: '2026-03-09',
    pricePerLitre: PRICE_JAN,
    lines: ENTRY2_PARTIAL,
    totalDispensed: entry2Dispensed,
    maxAllocation: entry1Max,
    utilisationPct: parseFloat(((entry2Dispensed / entry1Max) * 100).toFixed(1)),
    totalCost: parseFloat((entry2Dispensed * PRICE_JAN).toFixed(2)),
    postedBy: 'Nothando Ncube',
    status: 'draft',
    createdAt: '2026-03-10T09:00:00Z',
  },
]
