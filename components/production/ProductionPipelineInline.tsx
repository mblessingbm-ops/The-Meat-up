'use client'
// components/production/ProductionPipelineInline.tsx
// Compact single-line pipeline per sub-job for the Command View order cards

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import type { SubJob, SubJobStage } from '@/types/production'

const STAGE_ABBR: Record<string, string> = {
  cutting: 'CUT',
  sewing: 'SEW',
  printing: 'PRT',
  finishing: 'FIN',
  quality_check: 'QC',
  packaging: 'PKG',
  dispatch: 'DSP',
}

function PipelineNode({
  stage,
  isParallel = false,
}: {
  stage: SubJobStage
  isParallel?: boolean
}) {
  const abbr = STAGE_ABBR[stage.stageName] ?? stage.stageName.slice(0, 3).toUpperCase()

  if (stage.status === 'completed') {
    return (
      <div className="flex flex-col items-center">
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] text-gray-500 font-mono font-medium">{abbr}</span>
          <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block flex-shrink-0" />
        </div>
        {stage.piecesOut !== undefined && (
          <span className="text-[8px] text-gray-400 num mt-0.5">{stage.piecesOut.toLocaleString()}</span>
        )}
      </div>
    )
  }

  if (stage.status === 'in_progress') {
    return (
      <div className="flex flex-col items-center relative">
        <div className="flex items-center gap-0.5">
          <span className="text-[9px] text-blue-600 font-mono font-semibold">{abbr}</span>
          <div className="relative w-2.5 h-2.5 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
            <motion.span
              className="absolute inset-0 rounded-full bg-blue-400 opacity-60"
              animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </div>
      </div>
    )
  }

  // pending / skipped
  return (
    <div className="flex items-center gap-0.5">
      <span className="text-[9px] text-gray-300 font-mono">{abbr}</span>
      <span className="w-2.5 h-2.5 rounded-full border-2 border-gray-300 inline-block flex-shrink-0" />
    </div>
  )
}

function Connector({ active }: { active: boolean }) {
  return (
    <div className={cn('w-4 h-px flex-shrink-0', active ? 'bg-gray-400' : 'bg-gray-200 border-t border-dashed border-gray-300')} />
  )
}

interface Props {
  subJob: SubJob
  showPaceStrip?: boolean
  paceActual?: number
  paceRequired?: number
}

export default function ProductionPipelineInline({ subJob, showPaceStrip, paceActual, paceRequired }: Props) {
  // Separate out the parallel stages (sewing + printing)
  const cuttingStage = subJob.stages.find(s => s.stageName === 'cutting')
  const sewingStage = subJob.stages.find(s => s.stageName === 'sewing')
  const printingStage = subJob.stages.find(s => s.stageName === 'printing')
  const finishingStage = subJob.stages.find(s => s.stageName === 'finishing')
  const qcStage = subJob.stages.find(s => s.stageName === 'quality_check')
  const packagingStage = subJob.stages.find(s => s.stageName === 'packaging')
  const dispatchStage = subJob.stages.find(s => s.stageName === 'dispatch')

  const cuttingDone = cuttingStage?.status === 'completed'

  // Piece counts for label
  const sewPieces = subJob.sewingPiecesCompleted
  const prtPieces = subJob.printingPiecesCompleted
  const finPieces = subJob.finishingPiecesCompleted
  const total = subJob.totalQuantity

  return (
    <div className="space-y-1">
      <div className="flex items-center text-[10px] text-nexus-muted font-medium gap-1">
        <span className="font-semibold text-nexus-ink">{subJob.subJobNo}</span>
        <span>·</span>
        <span>{subJob.productType}</span>
        <span className="text-gray-300">·</span>
        <span>{subJob.colour}</span>
        <span className="text-gray-300">·</span>
        <span className="num font-semibold">{total.toLocaleString()} pcs</span>
        <span className={cn(
          'ml-1 badge text-[8px] py-0',
          subJob.complexityRating === 'complex' ? 'bg-purple-100 text-purple-700' :
          subJob.complexityRating === 'standard' ? 'bg-blue-50 text-blue-600' :
          'bg-gray-100 text-gray-500'
        )}>
          {subJob.complexityRating}
        </span>
      </div>

      {/* Pipeline row */}
      <div className="flex items-center gap-0 flex-wrap">
        {/* Cutting */}
        {cuttingStage && <PipelineNode stage={cuttingStage} />}
        <Connector active={cuttingDone} />

        {/* Parallel streams */}
        <div className="flex flex-col gap-0.5">
          {/* Sewing row */}
          {sewingStage && subJob.sewingRequired && (
            <div className="flex items-center gap-0">
              <PipelineNode stage={sewingStage} />
              {sewPieces > 0 && (
                <span className="text-[8px] text-blue-500 num ml-1">{sewPieces.toLocaleString()}/{total.toLocaleString()}</span>
              )}
            </div>
          )}
          {/* Printing row */}
          {printingStage && subJob.printingRequired && (
            <div className="flex items-center gap-0">
              <PipelineNode stage={printingStage} />
              {prtPieces > 0 && (
                <span className="text-[8px] text-blue-500 num ml-1">{prtPieces.toLocaleString()}/{total.toLocaleString()}</span>
              )}
            </div>
          )}
        </div>

        <Connector active={sewingStage?.status === 'completed' || false} />

        {/* Downstream linear stages */}
        {finishingStage && (
          <>
            <PipelineNode stage={finishingStage} />
            {finPieces > 0 && finishingStage.status === 'in_progress' && (
              <span className="text-[8px] text-blue-500 num ml-1">{finPieces}/{total}</span>
            )}
          </>
        )}
        {qcStage && <><Connector active={finishingStage?.status === 'completed' || false} /><PipelineNode stage={qcStage} /></>}
        {packagingStage && <><Connector active={qcStage?.status === 'completed' || false} /><PipelineNode stage={packagingStage} /></>}
        {dispatchStage && <><Connector active={packagingStage?.status === 'completed' || false} /><PipelineNode stage={dispatchStage} /></>}
      </div>

      {/* Pace strip */}
      {showPaceStrip && paceActual !== undefined && paceRequired !== undefined && paceRequired > 0 && (
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-nexus-muted">⚡</span>
          <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden relative max-w-24">
            <div
              className={cn(
                'h-full rounded-full transition-all',
                paceActual >= paceRequired ? 'bg-emerald-500' :
                paceActual >= paceRequired * 0.75 ? 'bg-amber-500' : 'bg-red-500'
              )}
              style={{ width: `${Math.min((paceActual / paceRequired) * 100, 100)}%` }}
            />
          </div>
          <span className={cn(
            'text-[9px] font-mono font-semibold num',
            paceActual >= paceRequired ? 'text-emerald-600' :
            paceActual >= paceRequired * 0.75 ? 'text-amber-600' : 'text-red-600'
          )}>
            {Math.round(paceActual)}/hr
          </span>
          <span className="text-[9px] text-nexus-muted">need {Math.round(paceRequired)}/hr</span>
        </div>
      )}
    </div>
  )
}
