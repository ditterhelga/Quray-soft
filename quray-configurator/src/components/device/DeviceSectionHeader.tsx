import { DeviceBulkActionBar } from '@/components/device/DeviceBulkActionBar'
import { presetListToolbarClassName } from '@/components/library/libraryLayout'

type DeviceSectionHeaderProps = {
  bulkActive: boolean
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClear: () => void
  onRemoveSelected: () => void
}

export function DeviceSectionHeader({
  bulkActive,
  selectedCount,
  totalCount,
  onSelectAll,
  onClear,
  onRemoveSelected,
}: DeviceSectionHeaderProps) {
  if (!bulkActive) {
    return null
  }

  return (
    <div className={presetListToolbarClassName()}>
      <DeviceBulkActionBar
        selectedCount={selectedCount}
        totalCount={totalCount}
        onSelectAll={onSelectAll}
        onClear={onClear}
        onRemoveSelected={onRemoveSelected}
      />
    </div>
  )
}
