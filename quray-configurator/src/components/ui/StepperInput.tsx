import { useState } from 'react'

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
  return 'inline-flex h-9 shrink-0 items-center rounded-xl border border-border-subtle bg-bg-active pl-1'
}

export function stepperInputButtonClassName() {
  return 'flex h-full w-8 shrink-0 cursor-pointer items-center justify-center text-text-muted transition-colors duration-[120ms] hover:text-text-primary'
}

export function stepperInputValueClassName() {
  return 'w-[4rem] shrink-0 whitespace-nowrap pl-1 pr-2 text-center text-sm font-light text-text-primary tabular-nums'
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
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
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
      {editing ? (
        <input
          autoFocus
          type="text"
          inputMode="numeric"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={() => {
            const parsed = parseFloat(draft)
            if (!Number.isNaN(parsed)) {
              onChange(clampStep(parsed, min, max, step))
            }
            setEditing(false)
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.currentTarget.blur()
            }
            if (event.key === 'Escape') {
              setEditing(false)
            }
          }}
          className="w-[4rem] shrink-0 whitespace-nowrap bg-transparent pl-1 pr-2 text-center text-sm font-light text-text-primary outline-none"
        />
      ) : (
        <span
          className={stepperInputValueClassName()}
          onClick={() => {
            setDraft(String(value))
            setEditing(true)
          }}
          style={{ cursor: 'text' }}
        >
          {display.endsWith(' V') ? (
            <>
              {display.slice(0, -2)}
              <span className="text-text-muted"> V</span>
            </>
          ) : (
            display
          )}
        </span>
      )}
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
