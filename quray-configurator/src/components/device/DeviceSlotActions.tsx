import { ArrowSquareOut, Trash } from '@phosphor-icons/react'
import { presetRowSecondaryActionsClassName } from '@/components/library/PresetRow'
import {
  presetRowActionButtonClassName,
  presetRowActionTooltipClassName,
  presetRowRemoveFromSetButtonClassName,
} from '@/components/library/presetRowActions'
import { Tooltip } from '@/components/ui/Tooltip'
import type { MouseEvent } from 'react'

type DeviceSlotActionsProps = {
  variant: 'set' | 'preset'
  onEdit: () => void
  onRemove: () => void
  forceHover?: boolean
}

export function DeviceSlotActions({
  variant,
  onEdit,
  onRemove,
  forceHover = false,
}: DeviceSlotActionsProps) {
  const editLabel = variant === 'set' ? 'Edit set' : 'Edit in editor'

  function handleClick(event: MouseEvent, action: () => void) {
    event.stopPropagation()
    action()
  }

  return (
    <div className={presetRowSecondaryActionsClassName(forceHover)}>
      <Tooltip content={editLabel} className={presetRowActionTooltipClassName}>
        <button
          type="button"
          onClick={(event) => handleClick(event, onEdit)}
          className={presetRowActionButtonClassName()}
          aria-label={editLabel}
        >
          <ArrowSquareOut size={18} weight="regular" aria-hidden="true" />
        </button>
      </Tooltip>
      <Tooltip content="Remove from device" className={presetRowActionTooltipClassName}>
        <button
          type="button"
          onClick={(event) => handleClick(event, onRemove)}
          className={presetRowRemoveFromSetButtonClassName()}
          aria-label="Remove from device"
        >
          <Trash size={18} weight="regular" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  )
}

type DeviceInnerPresetActionsProps = {
  onEdit: () => void
  forceHover?: boolean
}

export function DeviceInnerPresetActions({
  onEdit,
  forceHover = false,
}: DeviceInnerPresetActionsProps) {
  return (
    <div className={presetRowSecondaryActionsClassName(forceHover)}>
      <Tooltip content="Edit in editor" className={presetRowActionTooltipClassName}>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation()
            onEdit()
          }}
          className={presetRowActionButtonClassName()}
          aria-label="Edit in editor"
        >
          <ArrowSquareOut size={18} weight="regular" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  )
}
