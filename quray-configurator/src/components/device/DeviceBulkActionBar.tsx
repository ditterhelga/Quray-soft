import {
  bulkActionBarButtonGroupClassName,
  bulkActionBarClassName,
  bulkActionBarClearClassName,
  bulkActionBarCountClassName,
  bulkActionBarLinkClassName,
  bulkActionBarTextGroupClassName,
} from '@/components/library/BulkActionBar'

type DeviceBulkActionBarProps = {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClear: () => void
  onRemoveSelected: () => void
}

export function deviceBulkRemoveButtonClassName() {
  return 'inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-status-error px-4 text-sm font-light text-text-primary transition-[filter] duration-[120ms] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100'
}

export function DeviceBulkActionBar({
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  onRemoveSelected,
}: DeviceBulkActionBarProps) {
  if (selectedCount === 0) {
    return null
  }

  const countLabel = selectedCount === 1 ? '1 selected' : `${selectedCount} selected`

  return (
    <div className={bulkActionBarClassName()} role="toolbar" aria-label="Bulk device slot actions">
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
        <button
          type="button"
          onClick={onRemoveSelected}
          className={deviceBulkRemoveButtonClassName()}
        >
          Remove from device
        </button>
      </div>
    </div>
  )
}
