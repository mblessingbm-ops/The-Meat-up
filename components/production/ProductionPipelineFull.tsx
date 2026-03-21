'use client'
// components/production/ProductionPipelineFull.tsx
// Full visual pipeline diagram with parallel streams, clickable nodes, stage detail popovers

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Clock, User, Package, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SubJob, SubJobStage, ProductionStage } from '@/types/production'
import { formatRelativeTime } from '@/lib/production/pace'

const STAGE_LABELS: Record<ProductionStage, string> = {
  cutting: 'Cutting',
  sewing: 'Sewing',
  printing: 'Printing',
  finishing: 'Finishing',
  quality_check: 'QC',
  packaging: 'Packaging',
  dispatch: 'Dispatch',
}

// ── Stage popover ─────────────────────────────────────────────────────────────
function StageDetailPopover({ stage, onClose, canEdit }: {
  stage: SubJobStage
  onClose: () => void
  canEdit: boolean
}) {
  const duration = stage.startedAt && stage.completedAt
    ? Math.round((new Date(stage.completedAt).getTime() - new Date(stage.startedAt).getTime()) / 60000)
    : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-80 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className={cn(
          'px-4 py-3 flex items-center justify-between',
          stage.status === 'completed' ? 'bg-gray-50' :
          stage.status === 'in_progress' ? 'bg-blue-50' : 'bg-slate-50'
        )}>
          <h3 className="font-bold text-nexus-ink">{STAGE_LABELS[stage.stageName]}</h3>
          <div className="flex items-center gap-2">
            <span className={cn(
              'badge text-[10px] capitalize',
              stage.status === 'completed' ? 'bg-gray-200 text-gray-700' :
              stage.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
              'bg-slate-100 text-slate-500'
            )}>
              {stage.status === 'in_progress' ? 'In Progress' : stage.status}
            </span>
            <button onClick={onClose}><X className="w-4 h-4 text-nexus-muted" /></button>
          </div>
        </div>
        <div className="p-4 space-y-3 text-sm">
          {stage.startedBy && (
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-nexus-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-nexus-muted">Started by</p>
                <p className="font-medium">{stage.startedBy}</p>
                {stage.startedAt && (
                  <p className="text-xs text-nexus-muted">{new Date(stage.startedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {formatRelativeTime(stage.startedAt)}</p>
                )}
              </div>
            </div>
          )}
          {stage.completedBy && (
            <div className="flex items-start gap-2">
              <User className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-nexus-muted">Completed by</p>
                <p className="font-medium">{stage.completedBy}</p>
                {stage.completedAt && (
                  <p className="text-xs text-nexus-muted">{new Date(stage.completedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</p>
                )}
              </div>
            </div>
          )}
          {(stage.piecesIn !== undefined || stage.piecesOut !== undefined) && (
            <div className="flex items-start gap-2">
              <Package className="w-3.5 h-3.5 text-nexus-muted mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-nexus-muted">Pieces</p>
                {stage.piecesIn !== undefined && <p className="text-nexus-muted text-xs">In: <span className="font-semibold text-nexus-ink">{stage.piecesIn.toLocaleString()}</span></p>}
                {stage.piecesOut !== undefined && <p className="text-nexus-muted text-xs">Out: <span className="font-semibold text-nexus-ink">{stage.piecesOut.toLocaleString()}</span></p>}
              </div>
            </div>
          )}
          {duration && (
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-nexus-muted flex-shrink-0" />
              <p className="text-xs"><span className="text-nexus-muted">Duration:</span> <span className="font-semibold">{duration >= 60 ? `${Math.floor(duration / 60)}h ${duration % 60}m` : `${duration}m`}</span></p>
            </div>
          )}
          {stage.notes && (
            <div className="flex items-start gap-2">
              <FileText className="w-3.5 h-3.5 text-nexus-muted mt-0.5 flex-shrink-0" />
              <p className="text-xs text-nexus-muted italic">&ldquo;{stage.notes}&rdquo;</p>
            </div>
          )}
          {!stage.startedBy && stage.status === 'pending' && (
            <p className="text-xs text-nexus-muted italic">This stage has not started yet.</p>
          )}
          {canEdit && stage.status !== 'pending' && (
            <button className="text-xs text-brand-600 hover:underline">Edit stage details</button>
          )}
        </div>
      </motion.div>
    </div>
  )
}

// ── Pipeline node ─────────────────────────────────────────────────────────────
function FullPipelineNode({ stage, onClick }: {
  stage: SubJobStage
  onClick: () => void
}) {
  const label = STAGE_LABELS[stage.stageName]

  if (stage.status === 'completed') {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity group">
        <div className="w-8 h-8 rounded-full bg-gray-400 flex items-center justify-center shadow-sm group-hover:ring-2 ring-gray-300">
          <span className="w-3 h-3 rounded-full bg-white" />
        </div>
        <span className="text-[9px] font-semibold text-gray-500 text-center">{label}</span>
        {stage.piecesOut !== undefined && (
          <span className="text-[8px] text-gray-400 num">{stage.piecesOut.toLocaleString()}</span>
        )}
        {stage.startedAt && (
          <span className="text-[8px] text-gray-400">
            {new Date(stage.startedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </button>
    )
  }

  if (stage.status === 'in_progress') {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-1 relative hover:opacity-80 transition-opacity group">
        <div className="relative w-8 h-8">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center shadow-md group-hover:ring-2 ring-blue-300">
            <span className="w-3 h-3 rounded-full bg-white" />
          </div>
          <motion.div
            className="absolute inset-0 rounded-full bg-blue-400 opacity-0"
            animate={{ scale: [1, 1.5, 1], opacity: [0, 0.4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
        <span className="text-[9px] font-bold text-blue-600 text-center">{label}</span>
        {stage.startedAt && (
          <span className="text-[8px] text-blue-400">
            {new Date(stage.startedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}→
          </span>
        )}
      </button>
    )
  }

  // Pending / skipped
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1 hover:opacity-80 transition-opacity group">
      <div className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center bg-white group-hover:border-gray-400">
        <span className="w-2.5 h-2.5 rounded-full bg-gray-200" />
      </div>
      <span className="text-[9px] text-gray-300 text-center">{label}</span>
    </button>
  )
}

function FullConnector({ active }: { active: boolean }) {
  return (
    <div className="relative flex items-center">
      <div className={cn('h-0.5 w-6 flex-shrink-0', active ? 'bg-gray-400' : 'border-t-2 border-dashed border-gray-200')} />
    </div>
  )
}

// ── Full pipeline for one sub-job ─────────────────────────────────────────────
interface FullPipelineProps {
  subJob: SubJob
  canEdit?: boolean
}

export default function ProductionPipelineFull({ subJob, canEdit = false }: FullPipelineProps) {
  const [selectedStage, setSelectedStage] = useState<SubJobStage | null>(null)

  const cuttingStage = subJob.stages.find(s => s.stageName === 'cutting')
  const sewingStage = subJob.stages.find(s => s.stageName === 'sewing')
  const printingStage = subJob.stages.find(s => s.stageName === 'printing')
  const finishingStage = subJob.stages.find(s => s.stageName === 'finishing')
  const qcStage = subJob.stages.find(s => s.stageName === 'quality_check')
  const packagingStage = subJob.stages.find(s => s.stageName === 'packaging')
  const dispatchStage = subJob.stages.find(s => s.stageName === 'dispatch')

  const cuttingDone = cuttingStage?.status === 'completed'
  const sewingDone = sewingStage?.status === 'completed'
  const printingDone = printingStage?.status === 'completed'

  // Fabric status badge
  const fabricColors: Record<string, string> = {
    in_stock: 'bg-emerald-100 text-emerald-700',
    partial_stock: 'bg-amber-100 text-amber-700',
    sourcing: 'bg-amber-100 text-amber-700',
    delivered: 'bg-blue-100 text-blue-700',
    not_assessed: 'bg-gray-100 text-gray-500',
  }
  const fabricLabels: Record<string, string> = {
    in_stock: 'In Stock',
    partial_stock: 'Partial',
    sourcing: 'Sourcing',
    delivered: 'Delivered',
    not_assessed: 'Not Assessed',
  }

  return (
    <div className="rounded-xl border border-nexus-border bg-white p-4 space-y-3">
      {/* Sub-job header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="font-bold text-nexus-ink">{subJob.subJobNo}</span>
          <span className="text-nexus-ink font-medium">{subJob.productType} · {subJob.colour}</span>
          <span className="text-nexus-muted text-sm">· {subJob.totalQuantity.toLocaleString()} pcs</span>
          <span className={cn(
            'badge text-[10px]',
            subJob.complexityRating === 'complex' ? 'bg-purple-100 text-purple-700' :
            subJob.complexityRating === 'standard' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-500'
          )}>
            {subJob.complexityRating}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-nexus-muted">
          <span className={cn('badge text-[10px]', fabricColors[subJob.fabricStatus])}>{fabricLabels[subJob.fabricStatus]}</span>
          <span>{subJob.fabricType} · {subJob.fabricColour} · {subJob.fabricQuantityMetres}m</span>
        </div>
      </div>

      {/* Pipeline diagram */}
      <div className="flex items-start gap-0 overflow-x-auto py-2">
        {/* Cutting */}
        {cuttingStage && <FullPipelineNode stage={cuttingStage} onClick={() => setSelectedStage(cuttingStage)} />}
        <FullConnector active={cuttingDone} />

        {/* Parallel Sewing + Printing */}
        <div className="flex flex-col gap-4">
          {subJob.sewingRequired && sewingStage && (
            <div className="flex items-center gap-0">
              <FullPipelineNode stage={sewingStage} onClick={() => setSelectedStage(sewingStage)} />
              {subJob.sewingPiecesCompleted > 0 && (
                <span className="ml-2 text-[9px] text-blue-500 num">
                  {subJob.sewingPiecesCompleted.toLocaleString()}/{subJob.totalQuantity.toLocaleString()}
                </span>
              )}
            </div>
          )}
          {subJob.printingRequired && printingStage && (
            <div className="flex items-center gap-0">
              <FullPipelineNode stage={printingStage} onClick={() => setSelectedStage(printingStage)} />
              {subJob.printingPiecesCompleted > 0 && (
                <span className="ml-2 text-[9px] text-blue-500 num">
                  {subJob.printingPiecesCompleted.toLocaleString()}/{subJob.totalQuantity.toLocaleString()}
                </span>
              )}
            </div>
          )}
        </div>

        <FullConnector active={sewingDone || printingDone} />

        {/* Downstream linear */}
        {finishingStage && (
          <>
            <FullPipelineNode stage={finishingStage} onClick={() => setSelectedStage(finishingStage)} />
            {subJob.finishingPiecesCompleted > 0 && finishingStage.status === 'in_progress' && (
              <span className="text-[9px] text-blue-500 num self-center ml-1">
                {subJob.finishingPiecesCompleted}/{subJob.totalQuantity}
              </span>
            )}
          </>
        )}
        {qcStage && <><FullConnector active={finishingStage?.status === 'completed' || false} /><FullPipelineNode stage={qcStage} onClick={() => setSelectedStage(qcStage)} /></>}
        {packagingStage && <><FullConnector active={qcStage?.status === 'completed' || false} /><FullPipelineNode stage={packagingStage} onClick={() => setSelectedStage(packagingStage)} /></>}
        {dispatchStage && <><FullConnector active={packagingStage?.status === 'completed' || false} /><FullPipelineNode stage={dispatchStage} onClick={() => setSelectedStage(dispatchStage)} /></>}
      </div>

      {/* Size breakdown */}
      {Object.keys(subJob.sizeBreakdown).length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1 border-t border-nexus-border">
          {Object.entries(subJob.sizeBreakdown).filter(([, v]) => v !== undefined && v > 0).map(([size, qty]) => (
            <span key={size} className="badge bg-slate-100 text-slate-600 text-[10px]">
              {size}: {qty}
            </span>
          ))}
        </div>
      )}

      {/* Stage detail popover */}
      {selectedStage && (
        <StageDetailPopover
          stage={selectedStage}
          canEdit={canEdit}
          onClose={() => setSelectedStage(null)}
        />
      )}
    </div>
  )
}
