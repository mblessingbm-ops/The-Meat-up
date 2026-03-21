/**
 * lib/payroll.ts
 * Kingsport — Payroll calculation engine
 * All figures USD. Tax tables per ZIMRA schedule (configurable).
 * Created March 2026.
 */

// ─── Statutory Settings ────────────────────────────────────────────────────────
// Stored here as defaults; the UI uses PayrollSettings from state which can be
// edited by accountants at runtime.
export interface PayrollSettings {
  // PAYE bands: [min, max|null, baseAmount, rate on excess]
  payeBands: Array<{ min: number; max: number | null; base: number; rate: number }>
  aidsLevyRate: number          // fraction, e.g. 0.03
  nssaEmployeeRate: number      // fraction, e.g. 0.035
  nssaEmployeeMonthlyCap: number // USD
  nssaEmployerRate: number
  nssaEmployerMonthlyCap: number
  zimdefRate: number            // employer only, fraction
  necEmployeeRate: number       // fraction
  necEmployerRate: number
  standardHoursPerWeek: number
  overtimeMultiplier: number    // e.g. 1.5
  updatedBy: string
  updatedAt: string
}

export const DEFAULT_SETTINGS: PayrollSettings = {
  payeBands: [
    { min: 0,    max: 100,  base: 0,   rate: 0.00 },
    { min: 100,  max: 300,  base: 0,   rate: 0.20 },
    { min: 300,  max: 500,  base: 40,  rate: 0.25 },
    { min: 500,  max: 1000, base: 90,  rate: 0.30 },
    { min: 1000, max: 2000, base: 240, rate: 0.35 },
    { min: 2000, max: null, base: 590, rate: 0.40 },
  ],
  aidsLevyRate: 0.03,
  nssaEmployeeRate: 0.035,
  nssaEmployeeMonthlyCap: 5.50,
  nssaEmployerRate: 0.035,
  nssaEmployerMonthlyCap: 5.50,
  zimdefRate: 0.01,
  necEmployeeRate: 0.005,
  necEmployerRate: 0.005,
  standardHoursPerWeek: 48,
  overtimeMultiplier: 1.5,
  updatedBy: 'Ashleigh Kurira',
  updatedAt: '2026-01-15',
}

// ─── PAYE Calculation ──────────────────────────────────────────────────────────
/**
 * Calculate monthly PAYE from monthly taxable income.
 * For weekly runs, pass prorated income (weekly gross × no. of weeks or / 4.33).
 */
export function calculatePAYE(monthlyTaxableIncome: number, settings: PayrollSettings): number {
  const bands = settings.payeBands
  let paye = 0
  for (const band of bands) {
    if (monthlyTaxableIncome <= band.min) break
    const taxable = Math.min(monthlyTaxableIncome, band.max ?? Infinity) - band.min
    paye = band.base + taxable * band.rate
    if (band.max === null || monthlyTaxableIncome <= band.max) break
  }
  return Math.max(0, paye)
}

/** Prorate a monthly PAYE for a weekly payslip */
export function calculateWeeklyPAYE(weeklyGross: number, settings: PayrollSettings): number {
  const monthlyEquivalent = weeklyGross * 4.33
  const monthlyPAYE = calculatePAYE(monthlyEquivalent, settings)
  return monthlyPAYE / 4.33
}

// ─── AIDS Levy ─────────────────────────────────────────────────────────────────
export function calculateAIDSLevy(paye: number, settings: PayrollSettings): number {
  return paye * settings.aidsLevyRate
}

// ─── NSSA ─────────────────────────────────────────────────────────────────────
export function calculateNSSAEmployee(
  basicPay: number,
  isWeekly: boolean,
  settings: PayrollSettings
): number {
  const cap = isWeekly ? settings.nssaEmployeeMonthlyCap / 4.33 : settings.nssaEmployeeMonthlyCap
  return Math.min(basicPay * settings.nssaEmployeeRate, cap)
}

export function calculateNSSAEmployer(
  basicPay: number,
  isWeekly: boolean,
  settings: PayrollSettings
): number {
  const cap = isWeekly ? settings.nssaEmployerMonthlyCap / 4.33 : settings.nssaEmployerMonthlyCap
  return Math.min(basicPay * settings.nssaEmployerRate, cap)
}

// ─── ZIMDEF ───────────────────────────────────────────────────────────────────
export function calculateZIMDEF(grossPay: number, settings: PayrollSettings): number {
  return grossPay * settings.zimdefRate
}

// ─── NEC Clothing & Textile Sector ────────────────────────────────────────────
export function calculateNECEmployee(
  basicPay: number,
  necApplicable: boolean,
  settings: PayrollSettings
): number {
  if (!necApplicable) return 0
  return basicPay * settings.necEmployeeRate
}

export function calculateNECEmployer(
  basicPay: number,
  necApplicable: boolean,
  settings: PayrollSettings
): number {
  if (!necApplicable) return 0
  return basicPay * settings.necEmployerRate
}

// ─── Full Payslip Calculation ──────────────────────────────────────────────────
export interface PayslipInput {
  employeeId: string
  payStructure: 'monthly_salary' | 'hourly_rate'
  baseSalaryOrRate: number  // base_salary for salaried, hourly_rate for hourly
  hoursWorked?: number      // for hourly workers
  overtimeHours?: number
  allowances?: Array<{ name: string; amount: number }>
  bonus?: number
  loanDeduction?: number
  otherDeductions?: Array<{ name: string; amount: number }>
  necApplicable: boolean
  isWeekly: boolean         // true for weekly payroll runs
  settings: PayrollSettings
}

export interface PayslipResult {
  basicPay: number
  overtimePay: number
  grossTotal: number
  paye: number
  aidsLevy: number
  nssaEmployee: number
  necEmployee: number
  loanDeduction: number
  otherDeductionsTotal: number
  totalDeductions: number
  nssaEmployer: number
  zimdef: number
  necEmployer: number
  totalEmployerContributions: number
  netPay: number
}

export function calculatePayslip(input: PayslipInput): PayslipResult {
  const { settings, isWeekly } = input

  // ── Gross Calculation ──
  let basicPay: number
  let overtimePay = 0

  if (input.payStructure === 'monthly_salary') {
    basicPay = input.baseSalaryOrRate
  } else {
    // Hourly
    const regular = (input.hoursWorked ?? 0) * input.baseSalaryOrRate
    const otHours = input.overtimeHours ?? 0
    overtimePay = otHours * input.baseSalaryOrRate * settings.overtimeMultiplier
    basicPay = regular
  }

  const allowancesTotal = (input.allowances ?? []).reduce((s, a) => s + a.amount, 0)
  const bonus = input.bonus ?? 0
  const grossTotal = basicPay + overtimePay + allowancesTotal + bonus

  // ── Statutory Deductions ──
  const monthlyEquivalent = isWeekly ? grossTotal * 4.33 : grossTotal
  const monthlyPAYE = calculatePAYE(monthlyEquivalent, settings)
  const paye = isWeekly ? monthlyPAYE / 4.33 : monthlyPAYE
  const aidsLevy = calculateAIDSLevy(paye, settings)
  const nssaEmployee = calculateNSSAEmployee(basicPay, isWeekly, settings)
  const necEmployee = calculateNECEmployee(basicPay, input.necApplicable, settings)
  const loanDeduction = input.loanDeduction ?? 0
  const otherDeductionsTotal = (input.otherDeductions ?? []).reduce((s, d) => s + d.amount, 0)
  const totalDeductions = paye + aidsLevy + nssaEmployee + necEmployee + loanDeduction + otherDeductionsTotal

  // ── Employer Contributions ──
  const nssaEmployer = calculateNSSAEmployer(basicPay, isWeekly, settings)
  const zimdef = calculateZIMDEF(grossTotal, settings)
  const necEmployer = calculateNECEmployer(basicPay, input.necApplicable, settings)
  const totalEmployerContributions = nssaEmployer + zimdef + necEmployer

  const netPay = grossTotal - totalDeductions

  return {
    basicPay,
    overtimePay,
    grossTotal,
    paye,
    aidsLevy,
    nssaEmployee,
    necEmployee,
    loanDeduction,
    otherDeductionsTotal,
    totalDeductions,
    nssaEmployer,
    zimdef,
    necEmployer,
    totalEmployerContributions,
    netPay,
  }
}

// ─── Data Types ────────────────────────────────────────────────────────────────
export type RunStatus = 'draft' | 'pending_approval' | 'approved' | 'paid'
export type RunType = 'weekly' | 'monthly' | 'combined'
export type PayStructure = 'monthly_salary' | 'hourly_rate'
export type LoanStatus = 'active' | 'completed' | 'written_off'
export type LoanType = 'salary_advance' | 'loan'

export interface EmployeePayProfile {
  employeeId: string
  name: string
  department: string
  company: 'Kingsport' | 'Bralyn' | 'SGA'
  payStructure: PayStructure
  baseSalary?: number         // monthly, office staff
  hourlyRate?: number         // production workers
  standardHoursPerWeek?: number
  allowances?: Array<{ name: string; amount: number }>
  bankName?: string
  bankAccount?: string
  taxReference?: string
  nssaNumber?: string
  necApplicable: boolean
  activeLoanId?: string
  payrollNotes?: string
  setupComplete: boolean
}

export interface Loan {
  id: string
  employeeId: string
  employeeName: string
  company: 'Kingsport' | 'Bralyn' | 'SGA'
  loanType: LoanType
  amount: number
  instalment: number
  numberOfInstalments: number
  instalmentsPaid: number
  balance: number
  dateIssued: string
  expectedCompletion: string
  approvedBy: string
  status: LoanStatus
  notes?: string
}

export interface PayrollRun {
  runId: string
  runType: RunType
  periodStart: string
  periodEnd: string
  companyScope: 'all'
  status: RunStatus
  totalGross: number
  totalDeductions: number
  totalNet: number
  totalEmployerContributions: number
  employeeCount: number
  createdBy: string
  approvedBy?: string
  approvedDate?: string
  paidDate?: string
  notes?: string
}

// ─── Mock Data ─────────────────────────────────────────────────────────────────

/** Office staff pay profiles */
export const OFFICE_STAFF_PROFILES: EmployeePayProfile[] = [
  { employeeId: 'ex01', name: 'Kingstone Mhako', department: 'Executive', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 3500, allowances: [{ name: 'Transport Allowance', amount: 200 }, { name: 'Housing Allowance', amount: 300 }], necApplicable: false, setupComplete: true },
  { employeeId: 'ex02', name: 'Lyn Mhako', department: 'Executive', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 2500, necApplicable: false, setupComplete: true },
  { employeeId: 'ex03', name: 'Blessing Mhako', department: 'Executive', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 2500, necApplicable: false, setupComplete: true },
  { employeeId: 'ex04', name: 'Energy Deshe', department: 'Executive', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 2800, allowances: [{ name: 'Transport Allowance', amount: 200 }], necApplicable: false, setupComplete: true },
  { employeeId: 'fn01', name: 'Ashleigh Kurira', department: 'Finance', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 1400, necApplicable: false, setupComplete: true },
  { employeeId: 'fn02', name: 'Nothando Ncube', department: 'Finance', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 1400, necApplicable: false, setupComplete: true },
  { employeeId: 'hr01', name: 'Andrea Chikanga', department: 'Human Resources', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 1100, necApplicable: false, setupComplete: true },
  { employeeId: 'hr02', name: 'Adelaide Mhako', department: 'Human Resources', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 1100, necApplicable: false, setupComplete: true },
  { employeeId: 'ad01', name: 'Tinotenda Kufinya', department: 'Administration', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 800, necApplicable: false, activeLoanId: 'loan01', setupComplete: true },
  { employeeId: 'sl01', name: 'Lucia Chiwanza', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 1800, allowances: [{ name: 'Transport Allowance', amount: 150 }], necApplicable: false, setupComplete: true },
  { employeeId: 'sl02', name: 'Chiedza Jowa', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sl03', name: 'Thandeka Madeya', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sl04', name: 'Sandra Mwanza', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sl05', name: 'Spiwe Mandizha', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sl06', name: 'Yolanda Chigaigai', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sl07', name: 'Dudzai Ndemera', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sl08', name: 'Priviledge Zimunya', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sl09', name: 'Ernest Mutizwa', department: 'Sales', company: 'Kingsport', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sl10', name: 'Sylvester Chigova', department: 'Sales', company: 'Bralyn', payStructure: 'monthly_salary', baseSalary: 900, necApplicable: false, setupComplete: true },
  { employeeId: 'sc01', name: 'Ephraim Sakanda', department: 'Bralyn Litho', company: 'Bralyn', payStructure: 'monthly_salary', baseSalary: 950, necApplicable: true, setupComplete: true },
]

/** Generate payroll profiles for all production workers.
 *  IDs must match those in hr/page.tsx MOCK_EMPLOYEES.
 *  Kingsport production: 82 workers (ids from hr page).
 *  Bralyn production: 143 workers.
 *  For brevity in static data, we use a factory approach keyed on
 *  the employee IDs used in hr/page.tsx.
 */
function makeProductionProfile(
  employeeId: string,
  name: string,
  department: string,
  company: 'Kingsport' | 'Bralyn'
): EmployeePayProfile {
  return {
    employeeId, name, department, company,
    payStructure: 'hourly_rate',
    hourlyRate: 0.85,
    standardHoursPerWeek: 48,
    necApplicable: true,
    setupComplete: true,
  }
}

// Kingsport production (82): ids c01-c28 (Caps,28), s01-s28 (Sewing,28), d01-d24 (Dispatch,24), e01-e02 (Embroidery,2)
const KP_PROD_IDS: Array<[string, string, string]> = [
  ['c01','F. Mapa','Caps'],['c02','Joel Mapetsani','Caps'],['c03','Farai Mwadekurozva','Caps'],
  ['c04','Ashley Jambwa','Caps'],['c05','Cliford Magora','Caps'],['c06','Shilla Jack','Caps'],
  ['c07','Emma Hama','Caps'],['c08','Keresia Runesu','Caps'],['c09','Lillian Wadzanai Bizari','Caps'],
  ['c10','Neriat Chiura','Caps'],['c11','Seredzayi Muchayi','Caps'],['c12','Amanda Chiwengo','Caps'],
  ['c13','Concillia Muchonya','Caps'],['c14','Loveness Mupunga','Caps'],['c15','Elliot Singano','Caps'],
  ['c16','Kundiso Chiremba','Caps'],['c17','Honest Kaparangwe','Caps'],['c18','Gladys Munyeredzwa','Caps'],
  ['c19','Gladys Murumbi','Caps'],['c20','Jonathan Mwadekurozva','Caps'],['c21','Chibhoriwa Chikurungu','Caps'],
  ['c22','Denford Chipuriro','Caps'],['c23','Elisha Gwatidzo','Caps'],['c24','Persuade Zhuwawo','Caps'],
  ['c25','Filimon Ngarandi','Caps'],['c26','Shylet Mukaro','Caps'],['c27','Sharon Muvaka','Caps'],
  ['c28','Melisa Jimu','Caps'],
  ['s01','Ereneo Chigaigai','Sewing'],['s02','Fressy Yakulu','Sewing'],['s03','Tendeudzai Tinofa','Sewing'],
  ['s04','Tatenda Charakupa','Sewing'],['s05','Augustine Mudzingaidzwa','Sewing'],['s06','Dion Mbundire','Sewing'],
  ['s07','Thomas Ngwarai','Sewing'],['s08','Robeson Chizema','Sewing'],['s09','Sophia Tinofa','Sewing'],
  ['s10','Walter Manatsa','Sewing'],['s11','Essien Bhonomani','Sewing'],['s12','Virginia Changa','Sewing'],
  ['s13','Energy Muhamba','Sewing'],['s14','Irene Madenyika','Sewing'],['s15','Doreen Mukuvapasi','Sewing'],
  ['s16','Kampson Bindiridza','Sewing'],['s17','Neddy Swiza','Sewing'],['s18','Mirriam Matsika','Sewing'],
  ['s19','Fortunate Hondongwa','Sewing'],['s20','Petronella Topo','Sewing'],['s21','Maxwell Chiwashira','Sewing'],
  ['s22','Raina Nebvuma','Sewing'],['s23','Nyaradzo Chiwerure','Sewing'],['s24','Ayness Mombisi','Sewing'],
  ['s25','Blessing Mugweni','Sewing'],['s26','Esther Sakudya','Sewing'],['s27','Albert Gurure','Sewing'],
  ['s28','Tinashe Mazvimba','Sewing'],
  ['d01','Brian Mafuta','Dispatch'],['d02','Givemore Musenha','Dispatch'],['d03','Chrispen Madyo','Dispatch'],
  ['d04','Memory Matande','Dispatch'],['d05','Benjamin Saranewako','Dispatch'],['d06','Talent Mudzingaidzwa','Dispatch'],
  ['d07','Nickson Gutsa','Dispatch'],['d08','Simbarashe Chivandire','Dispatch'],['d09','Keith Munyanyi','Dispatch'],
  ['d10','Tendai Chikukwa Ziganiro','Dispatch'],['d11','Itai Kwanele Mwendesi','Dispatch'],['d12','Never Chigwaza','Dispatch'],
  ['d13','Mary Mhino','Dispatch'],['d14','Givemore Nyamajiwa','Dispatch'],['d15','Shylet Mugauri Mhako','Dispatch'],
  ['d16','Pedzisai Magwere','Dispatch'],['d17','Mavis Chiteshe','Dispatch'],['d18','Patson Chigama','Dispatch'],
  ['d19','Moiler Hega','Dispatch'],['d20','Naison Mafukidze','Dispatch'],['d21','Sylvester Mhako','Dispatch'],
  ['d22','Regis Chihamabakwe','Dispatch'],['d23','Vacky Kutyauripo','Dispatch'],['d24','Tawana Machekera','Dispatch'],
  // Kingsport Embroidery (2 prong workers — bring to 82)
  ['ke01','Loveness Chikunguwo','Embroidery'],['ke02','Rutendo Mawonde','Embroidery'],
]

// Bralyn production (143): be01-be15 (Embroidery,15), bl01-bl16 (Litho,16), mc01-mc12 (Muchokore,12), bs01-bs40 (Sewing,40), + more
const BRALYN_PROD_IDS: Array<[string, string, string]> = [
  ['be01','Zvinashe Bonde','Bralyn Embroidery'],['be02','Vongai Chitungo','Bralyn Embroidery'],
  ['be03','Chipo Jaure','Bralyn Embroidery'],['be04','Sungano Mararike','Bralyn Embroidery'],
  ['be05','Valentine Baloyi','Bralyn Embroidery'],['be06','Gabriel Moyo','Bralyn Embroidery'],
  ['be07','Precious Mutemeri','Bralyn Embroidery'],['be08','Hilda Mupata','Bralyn Embroidery'],
  ['be09','John Mandizvidza','Bralyn Embroidery'],['be10','Gracious Chitsiga','Bralyn Embroidery'],
  ['be11','Mercy Funye','Bralyn Embroidery'],['be12','Irene Mudzumwe','Bralyn Embroidery'],
  ['be13','Francisca Mabota','Bralyn Embroidery'],['be14','Marble Makwarimba','Bralyn Embroidery'],
  ['be15','Colleta Mupoperi','Bralyn Embroidery'],
  ['bl01','James Mutaramutswa','Bralyn Litho'],['bl02','Mixon Charungura','Bralyn Litho'],
  ['bl03','Lawrence Madzamba','Bralyn Litho'],['bl04','Webster Nhunzvi','Bralyn Litho'],
  ['bl05','Christopher Murefu','Bralyn Litho'],['bl06','Jaqcob Diza','Bralyn Litho'],
  ['bl07','Revai Mwase','Bralyn Litho'],['bl08','Beulla Meja','Bralyn Litho'],
  ['bl09','William Kwenda','Bralyn Litho'],['bl10','Ephraim Sakanda','Bralyn Litho'],
  ['bl11','Oscar Konde','Bralyn Litho'],['bl12','John Makumbe','Bralyn Litho'],
  ['bl13','Vimbai Jumira','Bralyn Litho'],['bl14','Lennia Chigaba','Bralyn Litho'],
  ['bl15','Nicholas Nyamarombo','Bralyn Litho'],['bl16','Noah Kwenda','Bralyn Litho'],
  ['mc01','Johanesse Muchokore','Muchokore'],['mc02','Blessmore Kutema','Muchokore'],
  ['mc03','Abishai Chirwa','Muchokore'],['mc04','Benediction Gwengo','Muchokore'],
  ['mc05','Susan Taonezvi','Muchokore'],['mc06','Ian Chikonyora','Muchokore'],
  ['mc07','Sharmaine Kajongwe','Muchokore'],['mc08','Nyarai Chitewe','Muchokore'],
  ['mc09','Carlton Chandaengerwa','Muchokore'],['mc10','Loveness Mungende','Muchokore'],
  ['mc11','Patience Madzingwa','Muchokore'],['mc12','Salma Tauya','Muchokore'],
  ['bs01','Garikai Ganyiwa','Bralyn Sewing'],['bs02','Noey Gonyora','Bralyn Sewing'],
  ['bs03','Nomore Maota','Bralyn Sewing'],['bs04','Wellington Chakanya','Bralyn Sewing'],
  ['bs05','Anita Chaora','Bralyn Sewing'],['bs06','Emeldah Muchechetere','Bralyn Sewing'],
  ['bs07','Blessing Kasiga','Bralyn Sewing'],['bs08','Thomas Masengere','Bralyn Sewing'],
  ['bs09','Martin Chimbende','Bralyn Sewing'],['bs10','Chomunorwa Chikarirwi','Bralyn Sewing'],
  ['bs11','Rosewinter Dingemire','Bralyn Sewing'],['bs12','Innocent Bonyongwe','Bralyn Sewing'],
  ['bs13','Vivian Kaparangwe','Bralyn Sewing'],['bs14','Sarafina Mashura','Bralyn Sewing'],
  ['bs15','Loveness Simika','Bralyn Sewing'],['bs16','Benjamin Mahowa','Bralyn Sewing'],
  ['bs17','Cephas Makanza','Bralyn Sewing'],['bs18','Shelter Samaneka','Bralyn Sewing'],
  ['bs19','Matthew Muneka','Bralyn Sewing'],['bs20','Yeukai Makurira','Bralyn Sewing'],
  ['bs21','Yeukai Munetsi','Bralyn Sewing'],['bs22','Nyaradzo Makosa','Bralyn Sewing'],
  ['bs23','Prosper Chirozva','Bralyn Sewing'],['bs24','Leocadia Mupambawashe','Bralyn Sewing'],
  ['bs25','Blantina Runzirai','Bralyn Sewing'],['bs26','Regis Mahere','Bralyn Sewing'],
  ['bs27','Betty Muderere','Bralyn Sewing'],['bs28','Takunda Runzonza','Bralyn Sewing'],
  ['bs29','Gamuchirai Kafalimani','Bralyn Sewing'],['bs30','Runyararo Mauye','Bralyn Sewing'],
  ['bs31','Blessed Makiwa','Bralyn Sewing'],['bs32','Rossa Gumbura','Bralyn Sewing'],
  ['bs33','Diana Mabhonga','Bralyn Sewing'],['bs34','Thulani Mwandiyambira','Bralyn Sewing'],
  ['bs35','Jephias Chihwereva','Bralyn Sewing'],['bs36','Matenga Masiiwa','Bralyn Sewing'],
  ['bs37','Wellington Twoboy','Bralyn Sewing'],['bs38','Mike Alfonso','Bralyn Sewing'],
  ['bs39','Sam Murerwa','Bralyn Sewing'],['bs40','Wellington Matambandini','Bralyn Sewing'],
  // Additional Bralyn workers to reach 143
  ['bx01','Chido Mazowe','Bralyn Sewing'],['bx02','Tatenda Gova','Bralyn Sewing'],
  ['bx03','Rutendo Gonzo','Bralyn Sewing'],['bx04','Tapiwa Murova','Bralyn Sewing'],
  ['bx05','Silibaziso Ndlovu','Bralyn Sewing'],['bx06','Farisai Mutsvairo','Bralyn Sewing'],
  ['bx07','Patience Ziki','Bralyn Sewing'],['bx08','Lovemore Chikumbu','Bralyn Sewing'],
  ['bx09','Kudakwashe Hamandishe','Bralyn Sewing'],['bx10','Tawanda Makoni','Bralyn Sewing'],
  ['bx11','Charity Kutsanzira','Bralyn Sewing'],['bx12','Nyasha Mapondera','Bralyn Sewing'],
  ['bx13','Clever Gweshe','Bralyn Sewing'],['bx14','Rudo Muzvondiwa','Bralyn Sewing'],
  ['bx15','Shingirai Mhembere','Bralyn Sewing'],['bx16','Anesu Muchibwa','Bralyn Sewing'],
  ['bx17','Tamara Mutenheri','Bralyn Sewing'],['bx18','Maxwell Haura','Bralyn Sewing'],
  ['bx19','Simba Murwisi','Bralyn Sewing'],['bx20','Viola Moyo','Bralyn Sewing'],
  ['bx21','Blessing Gondo','Bralyn Sewing'],['bx22','Trust Chitengu','Bralyn Sewing'],
  ['bx23','Manica Chizwiti','Bralyn Sewing'],['bx24','Abigail Nhema','Bralyn Sewing'],
  ['bx25','Lloyd Musemwa','Bralyn Sewing'],['bx26','Daniel Simango','Bralyn Sewing'],
  ['bx27','Vimbai Samaita','Bralyn Sewing'],['bx28','Phenias Mutero','Bralyn Sewing'],
  ['bx29','Linda Mlambo','Bralyn Sewing'],['bx30','Calton Dziva','Bralyn Sewing'],
  ['bx31','Miriam Mawere','Bralyn Sewing'],['bx32','Tatenda Mutisi','Bralyn Sewing'],
  ['bx33','Dennis Chitanda','Bralyn Sewing'],['bx34','Siphiwe Moyo','Bralyn Sewing'],
  ['bx35','Elizabeth Marimbe','Bralyn Sewing'],['bx36','Takudzwa Mutombwa','Bralyn Sewing'],
  ['bx37','Ngonidzashe Moyana','Bralyn Sewing'],['bx38','Yvonne Mukusha','Bralyn Sewing'],
  ['bx39','Taurai Mwedzi','Bralyn Sewing'],['bx40','Petronella Machava','Bralyn Sewing'],
  ['bx41','Ruvimbo Zhakata','Bralyn Sewing'],['bx42','Mavis Musiyiwa','Bralyn Sewing'],
  ['bx43','Munesu Bvunzawabaya','Bralyn Sewing'],['bx44','Sibangumuzi Dube','Bralyn Sewing'],
  ['bx45','Fortunate Paradza','Bralyn Sewing'],['bx46','Tinashe Gwenzi','Bralyn Sewing'],
  ['bx47','Rumbidzai Moyo','Bralyn Sewing'],['bx48','Nigel Chirinda','Bralyn Sewing'],
  ['bx49','Tarisai Chibaya','Bralyn Sewing'],['bx50','Nhamo Tafadzwa','Bralyn Sewing'],
  ['bx51','Constance Choto','Bralyn Sewing'],['bx52','Felix Makokoro','Bralyn Sewing'],
  ['bx53','Patricia Misi','Bralyn Sewing'],['bx54','Witness Duri','Bralyn Sewing'],
  ['bx55','Tatenda Muredzi','Bralyn Sewing'],['bx56','Innocent Musaka','Bralyn Sewing'],
  ['bx57','Hilda Mupanda','Bralyn Sewing'],['bx58','Munesu Muhwati','Bralyn Sewing'],
  ['bx59','Vongai Chamunorwa','Bralyn Sewing'],['bx60','Nyasha Mapurisa','Bralyn Sewing'],
]

export const PRODUCTION_PROFILES: EmployeePayProfile[] = [
  ...KP_PROD_IDS.map(([id, name, dept]) => makeProductionProfile(id, name, dept, 'Kingsport')),
  ...BRALYN_PROD_IDS.map(([id, name, dept]) => makeProductionProfile(id, name, dept, 'Bralyn')),
]

export const ALL_PAY_PROFILES: EmployeePayProfile[] = [
  ...OFFICE_STAFF_PROFILES,
  ...PRODUCTION_PROFILES,
]

/** Mock loan records */
export const MOCK_LOANS: Loan[] = [
  {
    id: 'loan01',
    employeeId: 'ad01',
    employeeName: 'Tinotenda Kufinya',
    company: 'Kingsport',
    loanType: 'loan',
    amount: 300,
    instalment: 50,
    numberOfInstalments: 6,
    instalmentsPaid: 2,
    balance: 200,
    dateIssued: '2026-01-15',
    expectedCompletion: '2026-06-15',
    approvedBy: 'Kingstone Mhako',
    status: 'active',
    notes: 'Personal advance — approved Jan 2026.',
  }
]

/** Mock payroll runs */
function calcRunTotals(isWeekly: boolean, count: number, s = DEFAULT_SETTINGS) {
  if (!isWeekly) {
    // Monthly — use average of office staff salaries
    const avgGross = 1250
    const gross = avgGross * count
    const input: PayslipInput = { employeeId: '', payStructure: 'monthly_salary', baseSalaryOrRate: avgGross, necApplicable: false, isWeekly: false, settings: s }
    const ps = calculatePayslip(input)
    const deductions = ps.totalDeductions * count
    return { gross, deductions, net: gross - deductions, employer: ps.totalEmployerContributions * count }
  } else {
    // Weekly — 48hrs × $0.85 = $40.80/week per production worker
    const weeklyGross = 48 * 0.85 // $40.80
    const gross = weeklyGross * count
    const input: PayslipInput = { employeeId: '', payStructure: 'hourly_rate', baseSalaryOrRate: 0.85, hoursWorked: 48, necApplicable: true, isWeekly: true, settings: s }
    const ps = calculatePayslip(input)
    const deductions = ps.totalDeductions * count
    return { gross, deductions, net: gross - deductions, employer: ps.totalEmployerContributions * count }
  }
}

const run1 = calcRunTotals(false, OFFICE_STAFF_PROFILES.length)
const run2 = calcRunTotals(true, PRODUCTION_PROFILES.length)

export const MOCK_RUNS: PayrollRun[] = [
  {
    runId: 'PAY-2026-02-0001',
    runType: 'monthly',
    periodStart: '2026-02-01',
    periodEnd: '2026-02-28',
    companyScope: 'all',
    status: 'paid',
    totalGross: Math.round(run1.gross * 100) / 100,
    totalDeductions: Math.round(run1.deductions * 100) / 100,
    totalNet: Math.round(run1.net * 100) / 100,
    totalEmployerContributions: Math.round(run1.employer * 100) / 100,
    employeeCount: OFFICE_STAFF_PROFILES.length,
    createdBy: 'Ashleigh Kurira',
    approvedBy: 'Kingstone Mhako',
    approvedDate: '2026-02-27',
    paidDate: '2026-02-28',
  },
  {
    runId: 'PAY-2026-03-0001',
    runType: 'weekly',
    periodStart: '2026-02-24',
    periodEnd: '2026-03-01',
    companyScope: 'all',
    status: 'approved',
    totalGross: Math.round(run2.gross * 100) / 100,
    totalDeductions: Math.round(run2.deductions * 100) / 100,
    totalNet: Math.round(run2.net * 100) / 100,
    totalEmployerContributions: Math.round(run2.employer * 100) / 100,
    employeeCount: PRODUCTION_PROFILES.length,
    createdBy: 'Nothando Ncube',
    approvedBy: 'Energy Deshe',
    approvedDate: '2026-03-05',
  },
]

/** Settings rate change history for the Settings tab */
export interface SettingsHistoryEntry { date: string; by: string; from: string; to: string }
export const SETTINGS_HISTORY: Record<string, SettingsHistoryEntry[]> = {
  'NSSA Rate': [
    { date: '2024-01-01', by: 'Ashleigh Kurira', from: '3%', to: '3.5%' },
  ],
  'NSSA Cap': [
    { date: '2023-06-01', by: 'Ashleigh Kurira', from: 'USD 4.00', to: 'USD 5.50' },
  ],
}
