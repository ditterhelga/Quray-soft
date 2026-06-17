type ToggleSwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
  id?: string
}

export function toggleSwitchTrackClassName(checked: boolean) {
  return `relative h-5 w-9 shrink-0 rounded-full transition-colors duration-[120ms] ${
    checked ? 'bg-accent' : 'bg-border'
  }`
}

export function toggleSwitchThumbClassName(checked: boolean) {
  return `pointer-events-none absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-text-primary transition-transform duration-[120ms] ${
    checked ? 'translate-x-4' : 'translate-x-0'
  }`
}

export function ToggleSwitch({ checked, onChange, label, id }: ToggleSwitchProps) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2">
      {label && <span className="text-sm font-light text-text-muted">{label}</span>}
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={toggleSwitchTrackClassName(checked)}
      >
        <span className={toggleSwitchThumbClassName(checked)} aria-hidden="true" />
      </button>
    </label>
  )
}
