// lib/zimra/scheduler.ts

export const FISCAL_DAY_SCHEDULE = {
  // Auto-close: 23:45 CAT = 21:45 UTC
  autoCloseCronUTC: '45 21 * * *',
  autoCloseTimeCAT: '23:45',
  description: 'Fiscal day auto-close at 23:45 Zimbabwe time (CAT, UTC+2)',
}

export const PING_SCHEDULE = {
  // Every 15 minutes
  cronUTC: '*/15 * * * *',
  description: 'ZIMRA device ping every 15 minutes to maintain online status',
}
