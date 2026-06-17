import { useState, type ReactElement } from 'react'

type TooltipProps = {
  content: string
  children: ReactElement
  disabled?: boolean
  className?: string
}

export function tooltipWrapperClassName() {
  return 'relative inline-flex'
}

export function tooltipBubbleClassName() {
  return 'rounded-lg bg-bg-hover px-3 py-1.5 text-sm font-light font-[300] text-text-muted shadow-lg max-w-[160px] text-center [font-weight:300]'
}

export function tooltipPlacementClassName() {
  return 'pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 flex -translate-x-1/2 flex-col items-center'
}

export function Tooltip({
  content,
  children,
  disabled = false,
  className = tooltipWrapperClassName(),
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
        <div role="tooltip" className={tooltipPlacementClassName()}>
          <div className={tooltipBubbleClassName()}>{content}</div>
          <span
            className="h-0 w-0 border-x-[5px] border-x-transparent border-t-[5px] border-t-bg-active"
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  )
}
