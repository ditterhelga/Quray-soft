import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useDeviceContext } from '@/context/DeviceContext'
import { DeviceStatusBlock } from '@/components/device/DeviceStatusBlock'
import { DeviceToolbar } from '@/components/device/DeviceToolbar'
import { DeviceWorkingSetList } from '@/components/device/DeviceWorkingSetList'
import { Toast } from '@/components/ui/Toast'
import {
  FRESH_DEVICE_PRESET_SYNC,
  FRESH_DEVICE_WORKING_SET,
  type DeviceSlot,
  type DeviceSyncStatus,
} from '@/data/deviceWorkingSet'
import { FACTORY_PRESETS } from '@/data/factoryPresets'
import { PRESETS } from '@/data/presets'
import { SETS } from '@/data/sets'
import { focusLibrarySet } from '@/utils/deviceNavigation'
import {
  countDeviceSlotsNeedingSync,
  type DevicePresetSyncMap,
} from '@/utils/deviceSyncStatus'
import { getDeviceSlotId, getDeviceSlotName } from '@/utils/deviceSlots'

// PLACEHOLDER — all device status values await dev confirmation.
const PLACEHOLDER_DEVICE_STATUS = {
  usedMb: 2.1,
  totalMb: 8,
  firmwareVersion: '1.22',
} as const

type ToastState = {
  message: string
  actionLabel?: string
  onAction?: () => void
}

function markAllSlotsCurrent(
  slots: DeviceSlot[],
  presetSync: DevicePresetSyncMap,
): { slots: DeviceSlot[]; presetSync: DevicePresetSyncMap } {
  const nextPresetSync = Object.fromEntries(
    Object.keys(presetSync).map((presetId) => [presetId, 'current' as DeviceSyncStatus]),
  ) as DevicePresetSyncMap

  const nextSlots = slots.map((slot) =>
    slot.type === 'preset' ? { ...slot, syncStatus: 'current' as const } : slot,
  )

  return { slots: nextSlots, presetSync: nextPresetSync }
}

export function Device() {
  const { slots, setSlots, presetSync, setPresetSync, extraPresets } = useDeviceContext()
  const [searchParams] = useSearchParams()
  const isFreshMode = searchParams.get('fresh') === '1'
  const navigate = useNavigate()
  const [orderChanged, setOrderChanged] = useState(false)
  const [removedSlotCount, setRemovedSlotCount] = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set())
  const [toast, setToast] = useState<ToastState | null>(null)

  useEffect(() => {
    if (isFreshMode) {
      const extraPresetIds = new Set(Object.keys(extraPresets))
      setSlots((current) => {
        const sentSlots = current.filter(
          (slot) => slot.type === 'preset' && extraPresetIds.has(slot.presetId),
        )
        return [...FRESH_DEVICE_WORKING_SET, ...sentSlots]
      })
      setPresetSync((current) => {
        const extraSync = Object.fromEntries(
          Object.entries(current).filter(([id]) => extraPresetIds.has(id)),
        )
        return { ...FRESH_DEVICE_PRESET_SYNC, ...extraSync }
      })
    }
  }, [isFreshMode, setSlots, setPresetSync, extraPresets])

  const setsById = useMemo(
    () => (isFreshMode ? new Map() : new Map(SETS.map((set) => [set.id, set]))),
    [isFreshMode],
  )
  const presetsById = useMemo(() => {
    const base = isFreshMode
      ? new Map(FACTORY_PRESETS.map((preset) => [preset.id, preset]))
      : new Map(PRESETS.map((preset) => [preset.id, preset]))
    Object.values(extraPresets).forEach((preset) => base.set(preset.id, preset))
    return base
  }, [isFreshMode, extraPresets])

  const allPresets = useMemo(() => {
    const base = isFreshMode ? [...FACTORY_PRESETS] : [...PRESETS]
    const extras = Object.values(extraPresets).filter(
      (ep) => !base.some((p) => p.id === ep.id),
    )
    return [...base, ...extras]
  }, [isFreshMode, extraPresets])

  const needsSyncCount = useMemo(
    () => countDeviceSlotsNeedingSync(slots, setsById, presetSync),
    [slots, setsById, presetSync],
  )

  const arrangementChangeCount = useMemo(
    () => (orderChanged ? 1 : 0) + removedSlotCount,
    [orderChanged, removedSlotCount],
  )

  const hasStagedChanges = needsSyncCount > 0 || arrangementChangeCount > 0

  const dismissToast = useCallback(() => {
    setToast(null)
  }, [])

  function handleUpdateQuray() {
    const next = markAllSlotsCurrent(slots, presetSync)
    setSlots(next.slots)
    setPresetSync(next.presetSync)
    setOrderChanged(false)
    setRemovedSlotCount(0)
    setSelectedIds(new Set())
    setToast({ message: 'Quray updated.' })
  }

  function handleReorderSlots(nextSlots: DeviceSlot[]) {
    setSlots(nextSlots)
    setOrderChanged(true)
  }

  function handleToggleSelect(slotId: string) {
    setSelectedIds((current) => {
      const next = new Set(current)
      if (next.has(slotId)) {
        next.delete(slotId)
      } else {
        next.add(slotId)
      }
      return next
    })
  }

  function handleSelectAll() {
    setSelectedIds(new Set(slots.map(getDeviceSlotId)))
  }

  function handleClearSelection() {
    setSelectedIds(new Set())
  }

  function handleEditSet(setId: string) {
    focusLibrarySet(setId)
    navigate('/')
  }

  function handleEditPreset(presetId: string) {
    const devicePreset = presetsById.get(presetId)
    navigate(`/editor/${presetId}`, { state: { presetName: devicePreset?.name } })
  }

  function removeSlot(slotId: string) {
    const slotIndex = slots.findIndex((entry) => getDeviceSlotId(entry) === slotId)
    if (slotIndex === -1) {
      return
    }

    const removedSlot = slots[slotIndex]
    const name = getDeviceSlotName(removedSlot, setsById, presetsById)

    setSlots((current) =>
      current.filter((entry) => getDeviceSlotId(entry) !== slotId),
    )
    setSelectedIds((current) => {
      if (!current.has(slotId)) {
        return current
      }

      const next = new Set(current)
      next.delete(slotId)
      return next
    })
    setRemovedSlotCount((current) => current + 1)
    setToast({
      message: `Removed ${name} from Quray.`,
      actionLabel: 'Undo',
      onAction: () => {
        setSlots((current) => {
          const next = [...current]
          next.splice(slotIndex, 0, removedSlot)
          return next
        })
        setRemovedSlotCount((current) => Math.max(0, current - 1))
      },
    })
  }

  function handleBulkRemove() {
    if (selectedIds.size === 0) {
      return
    }

    const removedEntries = slots
      .map((slot, index) => ({ slot, index }))
      .filter(({ slot }) => selectedIds.has(getDeviceSlotId(slot)))

    setSlots((current) =>
      current.filter((slot) => !selectedIds.has(getDeviceSlotId(slot))),
    )
    setSelectedIds(new Set())

    const count = removedEntries.length
    setRemovedSlotCount((current) => current + count)
    setToast({
      message:
        count === 1
          ? `Removed ${getDeviceSlotName(removedEntries[0].slot, setsById, presetsById)} from Quray.`
          : `Removed ${count} items from Quray.`,
      actionLabel: 'Undo',
      onAction: () => {
        setSlots((current) => {
          const next = [...current]
          for (const { slot, index } of [...removedEntries].reverse()) {
            next.splice(Math.min(index, next.length), 0, slot)
          }
          return next
        })
        setRemovedSlotCount((current) => Math.max(0, current - count))
      },
    })
  }

  return (
    <>
      <div className="bg-bg-base">
        <div className="hero-glow pb-8">
          <DeviceToolbar
            hasStagedChanges={hasStagedChanges}
            arrangementChangeCount={arrangementChangeCount}
            updateCount={needsSyncCount}
            onUpdateQuray={handleUpdateQuray}
          />
          <DeviceStatusBlock status={PLACEHOLDER_DEVICE_STATUS} />
        </div>

        <DeviceWorkingSetList
          slots={slots}
          sets={isFreshMode ? [] : SETS}
          presets={allPresets}
          presetSync={presetSync}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onSelectAll={handleSelectAll}
          onClearSelection={handleClearSelection}
          onReorderSlots={handleReorderSlots}
          onEditSet={handleEditSet}
          onEditPreset={handleEditPreset}
          onRemoveSlot={removeSlot}
          onBulkRemove={handleBulkRemove}
        />
      </div>

      {toast && (
        <Toast
          message={toast.message}
          actionLabel={toast.actionLabel}
          onAction={toast.onAction}
          onDismiss={dismissToast}
        />
      )}
    </>
  )
}
