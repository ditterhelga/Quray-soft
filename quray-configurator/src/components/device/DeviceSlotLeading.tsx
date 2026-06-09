import type { DraggableAttributes } from '@dnd-kit/core'
import type { SyntheticListenerMap } from '@dnd-kit/core/dist/hooks/utilities'
import { DotsSixVertical } from '@phosphor-icons/react'
import {
  deviceSlotDragHandleClassName,
  deviceSlotLeadingClassName,
  deviceSlotLeadingGapClassName,
  deviceSlotSequenceClassName,
  formatDeviceSlotSequence,
} from '@/components/device/deviceSlotLayout'
import {
  presetRowCheckboxSlotClassName,
  presetRowCheckboxVisibilityClassName,
} from '@/components/library/presetRowSelection'
import { SelectionCheckbox } from '@/components/ui/SelectionCheckbox'

type DeviceSlotLeadingProps = {
  sequenceIndex: number
  bulkActive: boolean
  isSelected: boolean
  onToggleSelect?: () => void
  selectLabel: string
  dragHandleAttributes?: DraggableAttributes
  dragHandleListeners?: SyntheticListenerMap
}

export function DeviceSlotLeading({
  sequenceIndex,
  bulkActive,
  isSelected,
  onToggleSelect,
  selectLabel,
  dragHandleAttributes,
  dragHandleListeners,
}: DeviceSlotLeadingProps) {
  return (
    <div className={deviceSlotLeadingClassName()}>
      <SelectionCheckbox
        checked={isSelected}
        compact
        onToggle={onToggleSelect}
        ariaLabel={selectLabel}
        className={`${presetRowCheckboxSlotClassName()} self-center ${presetRowCheckboxVisibilityClassName(bulkActive)}`}
      />
      <button
        type="button"
        {...dragHandleAttributes}
        {...dragHandleListeners}
        onClick={(event) => event.stopPropagation()}
        className={`${deviceSlotDragHandleClassName()} ${deviceSlotLeadingGapClassName()}`}
        aria-label="Reorder slot"
      >
        <DotsSixVertical size={16} weight="regular" aria-hidden="true" />
      </button>
      <span
        className={`${deviceSlotSequenceClassName()} ${deviceSlotLeadingGapClassName()}`}
        aria-hidden="true"
      >
        {formatDeviceSlotSequence(sequenceIndex)}
      </span>
    </div>
  )
}
