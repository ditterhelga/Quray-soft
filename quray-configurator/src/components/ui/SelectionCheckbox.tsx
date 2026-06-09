import { Check, Minus } from '@phosphor-icons/react'

export function selectionCheckboxBoxClassName(
  checked: boolean,
  indeterminate = false,
) {
  return `flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-[120ms] ${
    checked || indeterminate
      ? 'border-accent bg-accent'
      : 'border-border-checkbox bg-transparent'
  }`
}

export function selectionCheckboxButtonClassName(compact = false) {
  return `flex shrink-0 items-center justify-center transition-opacity duration-[120ms] ${
    compact ? 'h-4 w-4 cursor-pointer' : 'h-7 w-7 cursor-pointer'
  }`
}

type SelectionCheckboxProps = {
  checked: boolean
  indeterminate?: boolean
  compact?: boolean
  onToggle?: () => void
  ariaLabel?: string
  className?: string
}

export function SelectionCheckbox({
  checked,
  indeterminate = false,
  compact = false,
  onToggle,
  ariaLabel = 'Select preset',
  className = 'opacity-100',
}: SelectionCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={indeterminate ? 'mixed' : checked}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation()
        onToggle?.()
      }}
      className={`${selectionCheckboxButtonClassName(compact)} ${className}`.trim()}
    >
      <span
        className={selectionCheckboxBoxClassName(checked, indeterminate)}
        aria-hidden="true"
      >
        {indeterminate ? (
          <Minus size={10} weight="bold" className="text-text-primary" aria-hidden="true" />
        ) : (
          checked && (
            <Check size={10} weight="bold" className="text-text-primary" aria-hidden="true" />
          )
        )}
      </span>
    </button>
  )
}
