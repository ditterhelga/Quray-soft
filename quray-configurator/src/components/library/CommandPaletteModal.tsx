import { useEffect, useId, type ReactNode } from 'react'
import { SearchField } from '@/components/ui/SearchField'

type CommandPaletteModalProps = {
  open: boolean
  title: string
  onClose: () => void
  searchQuery: string
  onSearchQueryChange: (query: string) => void
  searchPlaceholder?: string
  footer?: ReactNode
  children: ReactNode
}

export function commandPaletteModalPanelClassName() {
  return 'relative flex w-full max-w-lg flex-col overflow-hidden rounded-lg border border-border bg-bg-active shadow-xl'
}

export function commandPaletteModalSearchClassName() {
  return 'border-b border-border p-4'
}

export function commandPaletteModalListClassName() {
  return 'max-h-[min(420px,50vh)] overflow-y-auto py-1'
}

export function commandPaletteModalFooterClassName() {
  return 'flex items-center justify-between border-t border-border px-4 py-3'
}

export function commandPaletteCreateActionClassName() {
  return 'flex w-full cursor-pointer items-center gap-2 px-4 py-3 text-left text-sm font-light text-accent transition-colors duration-[120ms] hover:bg-bg-hover'
}

export function commandPaletteItemClassName(active = false) {
  return `flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left text-sm font-light transition-colors duration-[120ms] ${
    active ? 'bg-bg-hover text-text-primary' : 'text-text-primary hover:bg-bg-hover'
  }`
}

export function CommandPaletteModal({
  open,
  title,
  onClose,
  searchQuery,
  onSearchQueryChange,
  searchPlaceholder = 'Search…',
  footer,
  children,
}: CommandPaletteModalProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) {
      return
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <button
        type="button"
        className="absolute inset-0 cursor-pointer bg-black/60"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={commandPaletteModalPanelClassName()}
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="sr-only">
          {title}
        </h2>
        <div className={commandPaletteModalSearchClassName()}>
          <SearchField
            value={searchQuery}
            onValueChange={onSearchQueryChange}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            autoFocus
          />
        </div>
        <div className={commandPaletteModalListClassName()}>{children}</div>
        {footer && <div className={commandPaletteModalFooterClassName()}>{footer}</div>}
      </div>
    </div>
  )
}
