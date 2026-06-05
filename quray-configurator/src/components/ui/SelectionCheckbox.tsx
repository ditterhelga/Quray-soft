import { Check } from '@phosphor-icons/react'

export function selectionCheckboxBoxClassName(checked: boolean) {
  return `flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors duration-[120ms] ${
    checked ? 'border-accent bg-accent' : 'border-border-checkbox bg-transparent'
  }`
}

export function selectionCheckboxButtonClassName(interactive = true) {
  return `flex h-7 w-7 shrink-0 items-center justify-center transition-opacity duration-[120ms] ${
    interactive ? 'cursor-pointer' : 'cursor-default'
  }`
}

type SelectionCheckboxProps = {
  checked: boolean
  onToggle?: () => void
  ariaLabel?: string
  className?: string
}

export function SelectionCheckbox({
  checked,
  onToggle,
  ariaLabel = 'Select preset',
  className = 'opacity-100',
}: SelectionCheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      onClick={(event) => {
        event.stopPropagation()
        onToggle?.()
      }}
      className={`${selectionCheckboxButtonClassName()} ${className}`.trim()}
    >
      <span className={selectionCheckboxBoxClassName(checked)} aria-hidden="true">
        {checked && (
          <Check size={10} weight="bold" className="text-text-primary" aria-hidden="true" />
        )}
      </span>
    </button>
  )
}
