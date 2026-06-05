import { DownloadSimple, UploadSimple } from '@phosphor-icons/react'

type BulkActionBarProps = {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClear: () => void
  onSendToQuray: () => void
  onExport: () => void
}

export function bulkActionBarCountClassName() {
  return 'text-sm font-light text-text-secondary'
}

export function bulkActionBarLinkClassName() {
  return 'cursor-pointer text-sm font-light text-text-muted transition-colors duration-[120ms] hover:text-text-primary'
}

export function bulkActionBarClearClassName() {
  return 'cursor-pointer text-sm font-light text-text-muted transition-colors duration-[120ms] hover:text-status-error'
}

export function bulkActionBarPrimaryButtonClassName() {
  return 'inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg bg-accent px-4 text-sm font-light text-text-primary transition-[filter] duration-[120ms] hover:brightness-110'
}

export function bulkActionBarSecondaryButtonClassName() {
  return 'inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border bg-bg-active px-4 text-sm font-light text-text-secondary transition-colors duration-[120ms] hover:bg-bg-hover hover:text-text-primary'
}

export function bulkActionBarClassName() {
  return 'flex min-w-0 flex-1 flex-wrap items-center justify-end gap-y-3'
}

export function bulkActionBarTextGroupClassName() {
  return 'flex flex-wrap items-center gap-5'
}

export function bulkActionBarButtonGroupClassName() {
  return 'ml-8 flex flex-wrap items-center gap-4'
}

export function BulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  onSendToQuray,
  onExport,
}: BulkActionBarProps) {
  if (selectedCount === 0) {
    return null
  }

  const countLabel = selectedCount === 1 ? '1 selected' : `${selectedCount} selected`

  return (
    <div className={bulkActionBarClassName()} role="toolbar" aria-label="Bulk preset actions">
      <div className={bulkActionBarTextGroupClassName()}>
        <span className={bulkActionBarCountClassName()}>{countLabel}</span>
        <button type="button" onClick={onSelectAll} className={bulkActionBarLinkClassName()}>
          Select all ({totalCount})
        </button>
        <button type="button" onClick={onClear} className={bulkActionBarClearClassName()}>
          Clear
        </button>
      </div>
      <div className={bulkActionBarButtonGroupClassName()}>
        <button type="button" onClick={onExport} className={bulkActionBarSecondaryButtonClassName()}>
          <DownloadSimple size={16} weight="regular" aria-hidden="true" />
          Export
        </button>
        <button
          type="button"
          onClick={onSendToQuray}
          className={bulkActionBarPrimaryButtonClassName()}
        >
          <UploadSimple size={16} weight="regular" aria-hidden="true" />
          Send to Quray
        </button>
      </div>
    </div>
  )
}
