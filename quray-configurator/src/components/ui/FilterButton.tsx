import { CaretDown } from '@phosphor-icons/react'

type FilterButtonProps = {
  label: string
}

export function filterButtonClassName(hover = false) {
  return `group flex h-12 w-[180px] shrink-0 cursor-pointer items-center justify-between rounded-lg border border-border px-4 transition-colors duration-[120ms] ${
    hover ? 'bg-bg-hover' : 'bg-bg-base hover:bg-bg-hover'
  }`
}

export function filterButtonLabelClassName(fullOpacity = false) {
  return `text-sm font-light text-text-primary transition-opacity duration-[120ms] ease-in-out ${
    fullOpacity ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'
  }`
}

export function FilterButton({ label }: FilterButtonProps) {
  return (
    <button type="button" className={filterButtonClassName()}>
      <span className={filterButtonLabelClassName()}>{label}</span>
      <CaretDown
        size={16}
        weight="regular"
        className="shrink-0 text-text-muted"
        aria-hidden="true"
      />
    </button>
  )
}
