import { Cards, ListDashes, Plus } from '@phosphor-icons/react'

export type ListView = 'presets' | 'sets'

type LibraryViewToggleProps = {
  value: ListView
  onChange: (value: ListView) => void
  onNewSet?: () => void
}

export function libraryNewSetLinkClassName() {
  return 'inline-flex cursor-pointer items-center gap-1.5 bg-transparent text-base font-medium text-text-secondary transition-colors duration-[120ms] hover:text-text-primary'
}

export function libraryViewToggleContainerClassName() {
  return 'inline-flex h-12 items-center gap-1 rounded-lg border border-border bg-bg-active p-1.5'
}

export function libraryViewToggleSegmentClassName(active: boolean) {
  return `flex h-9 cursor-pointer items-center gap-2 rounded-md px-4 text-sm font-light transition-colors duration-[120ms] ${
    active
      ? 'bg-accent text-text-primary'
      : 'bg-transparent text-text-secondary hover:bg-bg-hover'
  }`
}

export function LibraryViewToggle({ value, onChange, onNewSet }: LibraryViewToggleProps) {
  return (
    <div className="flex items-center gap-4">
      <div
        className={libraryViewToggleContainerClassName()}
        role="tablist"
        aria-label="Library view"
      >
        <button
          type="button"
          role="tab"
          className={libraryViewToggleSegmentClassName(value === 'presets')}
          onClick={() => onChange('presets')}
          aria-selected={value === 'presets'}
        >
          <ListDashes size={18} weight="regular" aria-hidden="true" />
          Presets
        </button>
        <button
          type="button"
          role="tab"
          className={libraryViewToggleSegmentClassName(value === 'sets')}
          onClick={() => onChange('sets')}
          aria-selected={value === 'sets'}
        >
          <Cards size={18} weight="regular" aria-hidden="true" />
          Sets
        </button>
      </div>
      {value === 'sets' && onNewSet && (
        <button type="button" onClick={onNewSet} className={libraryNewSetLinkClassName()}>
          <Plus size={16} weight="regular" className="shrink-0" aria-hidden="true" />
          New set
        </button>
      )}
    </div>
  )
}
