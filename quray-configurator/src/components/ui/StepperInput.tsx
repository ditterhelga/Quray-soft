type StepperInputProps = {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
  className?: string
}

export function stepperInputClassName() {
  return 'inline-flex h-9 items-center rounded-xl border border-border-subtle bg-bg-active pl-2'
}

export function stepperInputButtonClassName() {
  return 'flex h-full w-9 shrink-0 cursor-pointer items-center justify-center pr-0 text-text-muted transition-colors duration-[120ms] hover:text-text-primary'
}

export function stepperInputValueClassName() {
  return 'min-w-[2.5rem] px-2 text-center text-sm font-light text-text-primary tabular-nums'
}

function clampStep(value: number, min: number, max: number, step: number) {
  const stepped = Math.round(value / step) * step
  return Math.max(min, Math.min(max, stepped))
}

export function StepperInput({
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue,
  className = '',
}: StepperInputProps) {
  const display = formatValue ? formatValue(value) : String(value)

  return (
    <div className={`${stepperInputClassName()} ${className}`.trim()}>
      <button
        type="button"
        aria-label="Decrease value"
        onClick={() => onChange(clampStep(value - step, min, max, step))}
        className={stepperInputButtonClassName()}
      >
        −
      </button>
      <span className={stepperInputValueClassName()}>{display}</span>
      <button
        type="button"
        aria-label="Increase value"
        onClick={() => onChange(clampStep(value + step, min, max, step))}
        className={stepperInputButtonClassName()}
      >
        +
      </button>
    </div>
  )
}
