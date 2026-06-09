import {
  presetRowCheckboxSlotClassName,
} from '@/components/library/presetRowSelection'
import { SelectionCheckbox } from '@/components/ui/SelectionCheckbox'

type PresetTableSelectAllCheckboxProps = {
  selectedCount: number
  totalCount: number
  onSelectAll: () => void
  onClearSelection: () => void
}

export function PresetTableSelectAllCheckbox({
  selectedCount,
  totalCount,
  onSelectAll,
  onClearSelection,
}: PresetTableSelectAllCheckboxProps) {
  const allSelected = totalCount > 0 && selectedCount === totalCount
  const indeterminate = selectedCount > 0 && selectedCount < totalCount

  function handleToggle() {
    if (allSelected) {
      onClearSelection()
      return
    }

    onSelectAll()
  }

  return (
    <SelectionCheckbox
      checked={allSelected}
      indeterminate={indeterminate}
      compact
      onToggle={handleToggle}
      ariaLabel={allSelected ? 'Deselect all' : 'Select all'}
      className={presetRowCheckboxSlotClassName()}
    />
  )
}
