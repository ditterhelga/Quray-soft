import { useState, type ReactElement } from 'react'

type TooltipProps = {
  content: string
  children: ReactElement
  disabled?: boolean
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'bottom-end'
}

export function tooltipWrapperClassName() {
  return 'relative inline-flex'
}

  export function tooltipBubbleClassName() {
    return 'rounded-lg bg-bg-hover px-3 py-1.5 text-sm font-light font-[300] text-text-muted shadow-lg whitespace-nowrap [font-weight:300]'
  }

export function tooltipPlacementClassName() {
  return 'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 flex -translate-x-1/2 flex-col items-center'
}

export function Tooltip({
  content,
  children,
  disabled = false,
  className = tooltipWrapperClassName(),
  side = 'top',
}: TooltipProps) {
  const [visible, setVisible] = useState(false)

  if (disabled) {
    return children
  }

  return (
    <div
      className={className}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={
            side === 'right'
              ? 'pointer-events-none absolute left-full top-1/2 z-50 ml-2 flex -translate-y-1/2 flex-row items-center'
              : side === 'bottom'
                ? 'pointer-events-none absolute top-full left-1/2 z-50 mt-2 flex -translate-x-1/2 flex-col items-center'
                : side === 'bottom-end'
                  ? 'pointer-events-none absolute top-full right-0 z-50 mt-2 flex flex-col items-end'
                  : tooltipPlacementClassName()
          }
        >
          {side === 'right' ? (
            <>
              <span
                className="h-0 w-0 border-y-[5px] border-y-transparent border-r-[5px] border-r-bg-hover"
                aria-hidden="true"
              />
              <div className={tooltipBubbleClassName()}>{content}</div>
            </>
          ) : side === 'bottom' || side === 'bottom-end' ? (
            <>
              <span
                className={`h-0 w-0 border-x-[5px] border-x-transparent border-b-[5px] border-b-bg-hover ${
                  side === 'bottom-end' ? 'mr-4' : ''
                }`}
                aria-hidden="true"
              />
              <div className={tooltipBubbleClassName()}>{content}</div>
            </>
          ) : (
            <>
              <div className={tooltipBubbleClassName()}>{content}</div>
              <span
                className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-bg-active"
                aria-hidden="true"
              />
            </>
          )}
        </div>
      )}
    </div>
  )
}
