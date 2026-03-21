'use client'

import React from 'react'
import type { QuoteCompany } from '@/lib/quotations'
import { COMPANY_DETAILS } from '@/lib/quotations'

interface CompanyStampProps {
  company: QuoteCompany
  size?: number
}

export default function CompanyStamp({ company, size = 80 }: CompanyStampProps) {
  const details = COMPANY_DETAILS[company]
  const color = details.color
  const r = size / 2

  const stamps: Record<QuoteCompany, React.ReactNode> = {
    Kingsport: (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Outer ring */}
        <circle cx={r} cy={r} r={r - 2} fill="none" stroke={color} strokeWidth="2.5" />
        <circle cx={r} cy={r} r={r - 7} fill="none" stroke={color} strokeWidth="0.8" />
        {/* Ring text */}
        <defs>
          <path id="kin-arc" d={`M ${r},${r} m -${r - 5},0 a ${r - 5},${r - 5} 0 1,1 ${(r - 5) * 2},0`} />
          <path id="kin-arc-bottom" d={`M ${r},${r} m -${r - 5},0 a ${r - 5},${r - 5} 0 0,0 ${(r - 5) * 2},0`} />
        </defs>
        <text fontSize="6.5" fill={color} fontFamily="serif" letterSpacing="0.5">
          <textPath href="#kin-arc" startOffset="5%">KINGSPORT INVESTMENTS (PVT) LTD</textPath>
        </text>
        <text fontSize="6.5" fill={color} fontFamily="serif" letterSpacing="0.5">
          <textPath href="#kin-arc-bottom" startOffset="25%">HARARE · ZIMBABWE</textPath>
        </text>
        {/* Centre diamond motif */}
        <polygon points={`${r},${r - 10} ${r + 8},${r} ${r},${r + 10} ${r - 8},${r}`} fill="none" stroke={color} strokeWidth="1.5" />
        <polygon points={`${r},${r - 5} ${r + 4},${r} ${r},${r + 5} ${r - 4},${r}`} fill={color} />
      </svg>
    ),
    Bralyn: (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={r - 2} fill="none" stroke={color} strokeWidth="2.5" />
        <circle cx={r} cy={r} r={r - 7} fill="none" stroke={color} strokeWidth="0.8" />
        <defs>
          <path id="brl-arc" d={`M ${r},${r} m -${r - 5},0 a ${r - 5},${r - 5} 0 1,1 ${(r - 5) * 2},0`} />
          <path id="brl-arc-bottom" d={`M ${r},${r} m -${r - 5},0 a ${r - 5},${r - 5} 0 0,0 ${(r - 5) * 2},0`} />
        </defs>
        <text fontSize="6" fill={color} fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.3">
          <textPath href="#brl-arc" startOffset="3%">BRALYN LITHO PRINTERS (PVT) LTD</textPath>
        </text>
        <text fontSize="6.5" fill={color} fontFamily="sans-serif" letterSpacing="0.5">
          <textPath href="#brl-arc-bottom" startOffset="22%">EST. 2009 · HARARE</textPath>
        </text>
        {/* Geometric press motif */}
        <rect x={r - 8} y={r - 6} width="16" height="12" fill="none" stroke={color} strokeWidth="1.5" rx="1" />
        <rect x={r - 5} y={r - 3} width="10" height="6" fill={color} rx="0.5" />
        <line x1={r - 8} y1={r} x2={r + 8} y2={r} stroke="white" strokeWidth="1" />
      </svg>
    ),
    SGA: (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle cx={r} cy={r} r={r - 2} fill="none" stroke={color} strokeWidth="2.5" />
        <circle cx={r} cy={r} r={r - 7} fill="none" stroke={color} strokeWidth="0.8" />
        <defs>
          <path id="sga-arc" d={`M ${r},${r} m -${r - 5},0 a ${r - 5},${r - 5} 0 1,1 ${(r - 5) * 2},0`} />
          <path id="sga-arc-bottom" d={`M ${r},${r} m -${r - 5},0 a ${r - 5},${r - 5} 0 0,0 ${(r - 5) * 2},0`} />
        </defs>
        <text fontSize="6" fill={color} fontFamily="sans-serif" fontWeight="bold" letterSpacing="0.3">
          <textPath href="#sga-arc" startOffset="3%">SOURCE GLOBAL ALLIANCE (PVT) LTD</textPath>
        </text>
        <text fontSize="6.5" fill={color} fontFamily="sans-serif" letterSpacing="0.5">
          <textPath href="#sga-arc-bottom" startOffset="22%">HARARE · ZIMBABWE</textPath>
        </text>
        {/* Globe motif */}
        <circle cx={r} cy={r} r="9" fill="none" stroke={color} strokeWidth="1.5" />
        <ellipse cx={r} cy={r} rx="5" ry="9" fill="none" stroke={color} strokeWidth="1" />
        <line x1={r - 9} y1={r} x2={r + 9} y2={r} stroke={color} strokeWidth="1" />
        <line x1={r - 7.5} y1={r - 5} x2={r + 7.5} y2={r - 5} stroke={color} strokeWidth="0.8" />
        <line x1={r - 7.5} y1={r + 5} x2={r + 7.5} y2={r + 5} stroke={color} strokeWidth="0.8" />
      </svg>
    ),
  }

  return <>{stamps[company]}</>
}
