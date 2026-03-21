'use client'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { cn } from '@/lib/utils'
import { forwardRef } from 'react'

const TooltipProvider = TooltipPrimitive.Provider
const TooltipRoot = TooltipPrimitive.Root
const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        // Base
        'z-50 overflow-hidden',
        // Sizing — generous padding, never squashed
        'px-3 py-2',
        'max-w-[280px]',
        // Shape
        'rounded-[6px]',
        // Background — dark in light mode, slightly lighter dark in dark mode
        'bg-[#1A1917] dark:bg-[#2A2722]',
        // Border — subtle definition
        'border border-[rgba(255,255,255,0.08)]',
        // Shadow
        'shadow-[0_8px_24px_rgba(0,0,0,0.3),0_2px_8px_rgba(0,0,0,0.2)]',
        // Typography — Cormorant Garamond, readable size and weight
        "font-['Cormorant_Garamond'] text-[15px] font-[500] leading-[1.45]",
        'text-[#E8E5E0]',
        // Animation
        'animate-in fade-in-0 zoom-in-95',
        'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95',
        'data-[side=bottom]:slide-in-from-top-1',
        'data-[side=top]:slide-in-from-bottom-1',
        'data-[side=left]:slide-in-from-right-1',
        'data-[side=right]:slide-in-from-left-1',
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow
        className="fill-[#1A1917] dark:fill-[#2A2722]"
        width={10}
        height={5}
      />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Convenience wrapper — use this throughout the app
interface TooltipProps {
  children: React.ReactNode        // The trigger element
  content: React.ReactNode         // Tooltip content
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
  delayDuration?: number
  className?: string
}

export function Tooltip({
  children,
  content,
  side = 'top',
  align = 'center',
  delayDuration = 400,
  className,
}: TooltipProps) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          {children}
        </TooltipTrigger>
        <TooltipContent side={side} align={align} className={className}>
          {content}
        </TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  )
}

// Multi-line tooltip with title and description
export function TooltipDetailed({
  children,
  title,
  description,
  side = 'top',
  align = 'center',
  delayDuration = 400,
}: TooltipProps & { title: string; description?: string }) {
  return (
    <Tooltip
      content={
        <div className="space-y-0.5">
          <p className="font-[600] text-[#F0EDE8]">{title}</p>
          {description && (
            <p className="text-[13px] text-[#8C8882] leading-[1.4]">{description}</p>
          )}
        </div>
      }
      side={side}
      align={align}
      delayDuration={delayDuration}
    >
      {children}
    </Tooltip>
  )
}

// Keyboard shortcut tooltip
export function TooltipWithShortcut({
  children,
  label,
  shortcut,
  side = 'bottom',
}: {
  children: React.ReactNode
  label: string
  shortcut?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}) {
  return (
    <Tooltip
      content={
        <div className="flex items-center gap-2">
          <span>{label}</span>
          {shortcut && (
            <kbd className="
              font-['JetBrains_Mono'] text-[11px] font-[500]
              bg-[rgba(255,255,255,0.1)]
              border border-[rgba(255,255,255,0.15)]
              rounded-[3px]
              px-1.5 py-0.5
              text-[#A8A49E]
            ">
              {shortcut}
            </kbd>
          )}
        </div>
      }
      side={side}
      delayDuration={300}
    >
      {children}
    </Tooltip>
  )
}

export { TooltipProvider, TooltipRoot, TooltipTrigger, TooltipContent }
