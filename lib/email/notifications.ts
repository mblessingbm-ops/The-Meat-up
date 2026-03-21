import { Resend } from 'resend'
// AUDIT FIX (March 2026): Fixed two buildEmail calls with 6 args (max is 5) — body paragraphs
// were accidentally split across separate positional args instead of being one concatenated bodyHtml.

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL ?? 'notifications@nexus.co.zw'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

// ─── Generic send wrapper ─────────────────────────────────────────────────────
async function send({
  to,
  subject,
  html,
}: {
  to: string | string[]
  subject: string
  html: string
}) {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email skipped — no RESEND_API_KEY]', { to, subject })
    return
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html })
  } catch (err) {
    console.error('[Email send error]', err)
  }
}

// ─── Template builder ─────────────────────────────────────────────────────────
function buildEmail(
  title: string,
  preheader: string,
  bodyHtml: string,
  ctaLabel?: string,
  ctaUrl?: string
) {
  const cta = ctaLabel && ctaUrl
    ? `<div style="text-align:center;margin:32px 0;">
        <a href="${ctaUrl}" style="background:#2563EB;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">${ctaLabel}</a>
       </div>`
    : ''

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#F8FAFC;font-family:'DM Sans',Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;">${preheader}</div>
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8FAFC;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;border:1px solid #E2E8F0;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:#0D1117;padding:20px 32px;">
          <span style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.3px;">⚡ NEXUS</span>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:32px;">
          <h2 style="margin:0 0 16px;font-size:20px;color:#0F172A;font-weight:700;">${title}</h2>
          ${bodyHtml}
          ${cta}
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:16px 32px;background:#F8FAFC;border-top:1px solid #E2E8F0;">
          <p style="margin:0;font-size:12px;color:#94A3B8;">
            This is an automated notification from NEXUS Business Platform.
            <a href="${APP_URL}" style="color:#2563EB;">Open NEXUS</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`
}

function p(text: string) {
  return `<p style="margin:0 0 12px;font-size:14px;color:#334155;line-height:1.6;">${text}</p>`
}
function kv(label: string, value: string) {
  return `<tr>
    <td style="padding:8px 12px;font-size:13px;color:#64748B;font-weight:500;white-space:nowrap;">${label}</td>
    <td style="padding:8px 12px;font-size:13px;color:#0F172A;font-weight:600;">${value}</td>
  </tr>`
}
function table(rows: string) {
  return `<table cellpadding="0" cellspacing="0" style="width:100%;background:#F8FAFC;border-radius:8px;border:1px solid #E2E8F0;margin:16px 0;">${rows}</table>`
}

// ─── Notification types ───────────────────────────────────────────────────────

export async function sendStockAlert({
  to,
  items,
}: {
  to: string
  items: Array<{ name: string; sku: string; qty: number; reorderPoint: number; supplier: string }>
}) {
  const rows = items.map(i =>
    kv(i.name, `${i.qty} remaining (reorder at ${i.reorderPoint}) — ${i.supplier}`)
  ).join('')

  await send({
    to,
    subject: `⚠️ Stock Alert — ${items.length} item${items.length > 1 ? 's' : ''} below reorder point`,
    html: buildEmail(
      'Stock Reorder Alert',
      `${items.length} items have fallen below their reorder point.`,
      p(`The following items in your inventory have fallen below their configured reorder point and require attention:`) +
      table(rows) +
      p('Please review and raise purchase orders as needed.'),
      'View Inventory',
      `${APP_URL}/dashboard/supply-chain`
    ),
  })
}

export async function sendLeaveRequestNotification({
  to,
  employeeName,
  leaveType,
  startDate,
  endDate,
  days,
  reason,
  leaveId,
}: {
  to: string
  employeeName: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason?: string
  leaveId: string
}) {
  await send({
    to,
    subject: `Leave Request — ${employeeName} (${days} day${days > 1 ? 's' : ''})`,
    html: buildEmail(
      'New Leave Request',
      `${employeeName} has submitted a leave request requiring your approval.`,
      p(`<strong>${employeeName}</strong> has submitted a leave request:`) +
      table([
        kv('Leave Type', leaveType.charAt(0).toUpperCase() + leaveType.slice(1) + ' Leave'),
        kv('Start Date', startDate),
        kv('End Date', endDate),
        kv('Duration', `${days} day${days > 1 ? 's' : ''}`),
        reason ? kv('Reason', reason) : '',
      ].join('')) +
      p('Please review and approve or reject this request in NEXUS.'),
      'Review Request',
      `${APP_URL}/dashboard/hr?tab=leave`
    ),
  })
}

export async function sendLeaveDecision({
  to,
  employeeName,
  status,
  leaveType,
  startDate,
  endDate,
  approverName,
  note,
}: {
  to: string
  employeeName: string
  status: 'approved' | 'rejected'
  leaveType: string
  startDate: string
  endDate: string
  approverName: string
  note?: string
}) {
  const approved = status === 'approved'
  await send({
    to,
    subject: `Your leave request has been ${approved ? '✅ Approved' : '❌ Rejected'}`,
    html: buildEmail(
      `Leave Request ${approved ? 'Approved' : 'Rejected'}`,
      `Your leave request has been ${status} by ${approverName}.`,
      p(`Your ${leaveType} leave request from <strong>${startDate}</strong> to <strong>${endDate}</strong> has been <strong style="color:${approved ? '#059669' : '#DC2626'}">${status}</strong> by ${approverName}.`) +
      (note ? p(`<em>Note: ${note}</em>`) : ''),
      'View in NEXUS',
      `${APP_URL}/dashboard/hr`
    ),
  })
}

export async function sendContractExpiryWarning({
  to,
  employees,
  daysThreshold,
}: {
  to: string
  employees: Array<{ name: string; role: string; department: string; expiryDate: string; daysLeft: number }>
  daysThreshold: number
}) {
  const rows = employees.map(e =>
    kv(`${e.name} (${e.department})`, `${e.role} — expires ${e.expiryDate} (${e.daysLeft} days)`)
  ).join('')

  await send({
    to,
    subject: `📋 Contract Expiry Warning — ${employees.length} contract${employees.length > 1 ? 's' : ''} expiring in ${daysThreshold} days`,
    html: buildEmail(
      'Contract Expiry Warning',
      `${employees.length} employee contract${employees.length > 1 ? 's' : ''} expire within ${daysThreshold} days.`,
      p(`The following employee contract${employees.length > 1 ? 's' : ''} will expire within <strong>${daysThreshold} days</strong>. Please take action to renew or end these contracts:`) +
      table(rows) +
      p('Log in to NEXUS HR to manage contract renewals.'),
      'View HR Module',
      `${APP_URL}/dashboard/hr?tab=contracts`
    ),
  })
}

export async function sendPOStatusUpdate({
  to,
  poNumber,
  supplierName,
  totalValue,
  status,
  approverName,
  note,
}: {
  to: string
  poNumber: string
  supplierName: string
  totalValue: number
  status: 'approved' | 'rejected'
  approverName: string
  note?: string
}) {
  const approved = status === 'approved'
  await send({
    to,
    subject: `PO ${poNumber} has been ${approved ? '✅ Approved' : '❌ Rejected'}`,
    html: buildEmail(
      `Purchase Order ${approved ? 'Approved' : 'Rejected'}`,
      `PO ${poNumber} has been ${status} by ${approverName}.`,
      p(`Purchase Order <strong>${poNumber}</strong> for <strong>${supplierName}</strong> has been <strong style="color:${approved ? '#059669' : '#DC2626'}">${status}</strong> by ${approverName}.`) +
      table([
        kv('PO Number', poNumber),
        kv('Supplier', supplierName),
        kv('Total Value', `$${totalValue.toLocaleString()}`),
        kv('Status', status.toUpperCase()),
        note ? kv('Note', note) : '',
      ].join('')) +
      (approved ? p('The order has been approved and can now be sent to the supplier.') : ''),
      'View Purchase Order',
      `${APP_URL}/dashboard/supply-chain/purchase-orders`
    ),
  })
}

export async function sendSalesTargetMilestone({
  to,
  repName,
  milestone,
  achieved,
  target,
  month,
}: {
  to: string | string[]
  repName: string
  milestone: 50 | 100
  achieved: number
  target: number
  month: string
}) {
  const hit100 = milestone === 100
  await send({
    to,
    subject: `${hit100 ? '🏆' : '🎯'} ${repName} hit ${milestone}% of ${month} target`,
    html: buildEmail(
      `${milestone}% Target ${hit100 ? 'Achieved!' : 'Milestone'}`,
      `${repName} has reached ${milestone}% of their monthly sales target.`,
      p(`<strong>${repName}</strong> has reached <strong>${milestone}%</strong> of their ${month} sales target.`) +
      table([
        kv('Sales Rep', repName),
        kv('Month', month),
        kv('Achieved', `$${achieved.toLocaleString()}`),
        kv('Target', `$${target.toLocaleString()}`),
        kv('Progress', `${((achieved / target) * 100).toFixed(1)}%`),
      ].join('')),
      'View Sales',
      `${APP_URL}/dashboard/sales`
    ),
  })
}

export async function sendOverdueInvoiceAlert({
  to,
  invoices,
}: {
  to: string | string[]
  invoices: Array<{ ref: string; customer: string; amount: number; daysOverdue: number }>
}) {
  const rows = invoices.map(i =>
    kv(`${i.ref} — ${i.customer}`, `$${i.amount.toLocaleString()} — ${i.daysOverdue} days overdue`)
  ).join('')

  await send({
    to,
    subject: `🔴 Overdue Invoice Alert — ${invoices.length} invoice${invoices.length > 1 ? 's' : ''} require attention`,
    html: buildEmail(
      'Overdue Invoice Alert',
      `${invoices.length} invoices are overdue and require follow-up.`,
      p(`The following invoice${invoices.length > 1 ? 's are' : ' is'} overdue and require follow-up:`) +
      table(rows),
      'View Accounting',
      `${APP_URL}/dashboard/accounting`
    ),
  })
}
