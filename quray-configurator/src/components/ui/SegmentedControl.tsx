export type SegmentedControlOption<T extends string> = {
  value: T
  label: string
}

type SegmentedControlProps<T extends string> = {
  value: T
  options: SegmentedControlOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}

export function segmentedControlSegmentClassName(active: boolean) {
  return `flex flex-1 cursor-pointer items-center justify-center rounded-lg border text-sm font-light transition-colors duration-[120ms] ${
    active
      ? 'border-border-active bg-bg-active text-text-primary'
      : 'border-transparent bg-transparent text-text-muted hover:text-text-secondary'
  }`
}

export function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
}: SegmentedControlProps<T>) {
  return (
    <div
      className={`flex h-9 items-center gap-1 ${className}`.trim()}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const active = option.value === value

        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={segmentedControlSegmentClassName(active)}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
