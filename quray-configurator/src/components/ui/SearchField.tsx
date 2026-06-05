import { MagnifyingGlass, X } from '@phosphor-icons/react'
import type { InputHTMLAttributes } from 'react'

type SearchFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  value: string
  onValueChange: (value: string) => void
}

export function searchFieldClassName() {
  return 'flex h-12 min-w-[240px] flex-1 items-center gap-3 rounded-lg border border-border bg-bg-base px-4'
}

export function searchFieldInputClassName() {
  return 'min-w-0 flex-1 bg-transparent text-sm font-light text-text-primary outline-none placeholder:text-text-primary placeholder:opacity-70'
}

export function SearchField({
  className = '',
  value,
  onValueChange,
  ...props
}: SearchFieldProps) {
  const showClear = value.length > 0

  return (
    <div className={`${searchFieldClassName()} ${className}`.trim()}>
      <MagnifyingGlass
        size={18}
        weight="regular"
        className="shrink-0 text-text-muted"
        aria-hidden="true"
      />
      <input
        type="text"
        role="searchbox"
        placeholder="Search…"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        className={searchFieldInputClassName()}
        {...props}
      />
      {showClear && (
        <button
          type="button"
          onClick={() => onValueChange('')}
          className="shrink-0 cursor-pointer text-text-muted transition-colors duration-[120ms] hover:text-text-primary"
          aria-label="Clear search"
        >
          <X size={16} weight="regular" aria-hidden="true" />
        </button>
      )}
    </div>
  )
}
