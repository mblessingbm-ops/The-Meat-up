'use client'
// components/payments/ProofOfPaymentViewer.tsx

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatFileSize } from '@/types/payments'
import type { ProofOfPaymentFile } from '@/types/payments'

interface Props {
  files: ProofOfPaymentFile[]
  initialIndex?: number
  isOpen: boolean
  onClose: () => void
}

export default function ProofOfPaymentViewer({ files, initialIndex = 0, isOpen, onClose }: Props) {
  const [idx, setIdx] = useState(initialIndex)

  useEffect(() => { setIdx(initialIndex) }, [initialIndex, isOpen])

  const prev = useCallback(() => setIdx(i => (i - 1 + files.length) % files.length), [files.length])
  const next = useCallback(() => setIdx(i => (i + 1) % files.length), [files.length])

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft' && files.length > 1) prev()
      if (e.key === 'ArrowRight' && files.length > 1) next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [isOpen, onClose, prev, next, files.length])

  const current = files[idx]

  function handleDownload() {
    if (!current?.url) return
    const a = document.createElement('a')
    a.href = current.url
    a.download = current.fileName
    a.click()
  }

  const isImage = current?.fileType?.startsWith('image/')
  const isPdf = current?.fileType === 'application/pdf'

  return (
    <AnimatePresence>
      {isOpen && current && (
        <motion.div
          className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3 z-10"
            onClick={e => e.stopPropagation()}
          >
            <span className="text-white/70 text-sm font-medium">
              {files.length > 1 ? `${idx + 1} of ${files.length}` : ''}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Download"
              >
                <Download className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content area */}
          <div
            className="flex-1 flex items-center justify-center relative overflow-hidden px-12"
            onClick={e => e.stopPropagation()}
          >
            {/* Prev/next arrows */}
            {files.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {/* File content */}
            {isImage && current.url && (
              <img
                src={current.url}
                alt={current.fileName}
                className="max-h-full max-w-full object-contain rounded-lg"
                style={{ touchAction: 'pinch-zoom' }}
              />
            )}
            {isPdf && current.url && (
              <div className="w-full h-full flex flex-col items-center">
                <iframe
                  src={current.url}
                  className="w-full flex-1 rounded-lg"
                  title={current.fileName}
                  onError={() => {}}
                />
                <a
                  href={current.url}
                  download={current.fileName}
                  className="mt-3 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors"
                >
                  Download PDF
                </a>
              </div>
            )}
            {!current.url && (
              <div className="text-center text-white/50">
                <p className="text-lg font-medium">{current.fileName}</p>
                <p className="text-sm mt-1">File preview not available in mock mode</p>
              </div>
            )}
          </div>

          {/* Bottom bar */}
          <div
            className="px-4 py-3 flex items-end gap-4"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <p className="text-white text-sm font-medium">{current.fileName}</p>
              <p className="text-white/50 text-xs">{formatFileSize(current.fileSize)} · Uploaded {new Date(current.uploadedAt).toLocaleString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
