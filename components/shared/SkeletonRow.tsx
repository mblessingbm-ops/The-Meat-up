/**
 * components/shared/SkeletonRow.tsx
 * Animated skeleton row matching the standard table row structure.
 * Use this on initial table loads — never a spinner for list content.
 */

interface SkeletonRowProps {
  /** Number of columns to show */
  cols?: number
  /** Whether first column has an avatar */
  hasAvatar?: boolean
}

export default function SkeletonRow({ cols = 6, hasAvatar = true }: SkeletonRowProps) {
  return (
    <tr
      style={{ borderBottom: '1px solid var(--border-subtle)' }}
      aria-hidden="true"
    >
      {/* First column — optionally with avatar */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          {hasAvatar && (
            <div
              className="skeleton w-7 h-7 rounded-full flex-shrink-0"
              style={{ background: 'var(--bg-overlay)' }}
            />
          )}
          <div className="space-y-1.5">
            <div
              className="skeleton h-3.5 w-28 rounded"
              style={{ background: 'var(--bg-overlay)' }}
            />
            <div
              className="skeleton h-2.5 w-20 rounded"
              style={{ background: 'var(--bg-subtle)' }}
            />
          </div>
        </div>
      </td>

      {/* Remaining columns */}
      {Array.from({ length: Math.max(0, cols - 1) }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="skeleton h-3.5 rounded"
            style={{
              background: 'var(--bg-overlay)',
              width: i % 3 === 0 ? '5rem' : i % 3 === 1 ? '7rem' : '4rem',
            }}
          />
        </td>
      ))}
    </tr>
  )
}

/**
 * Renders N skeleton rows. Drop directly into a <tbody>.
 */
export function SkeletonRows({ count = 8, cols = 6, hasAvatar = true }: {
  count?: number
  cols?: number
  hasAvatar?: boolean
}) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} hasAvatar={hasAvatar} />
      ))}
    </>
  )
}
