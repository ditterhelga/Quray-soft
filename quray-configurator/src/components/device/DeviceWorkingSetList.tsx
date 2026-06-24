import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useMemo, useState } from 'react'
import { DevicePresetSlotRow } from '@/components/device/DevicePresetSlotRow'
import { DeviceSectionHeader } from '@/components/device/DeviceSectionHeader'
import { DeviceSetSlotRow } from '@/components/device/DeviceSetSlotRow'
import { deviceSlotDragOverlayClassName, deviceSlotInnerRowSpacerClassName, deviceSlotListRowsClassName } from '@/components/device/deviceSlotLayout'
import { DEVICE_TABLE_GRID, DEVICE_TABLE_STATUS_ACTIONS_SLOT } from '@/components/device/deviceTableLayout'
import {
  libraryListBodyClassName,
} from '@/components/library/libraryLayout'
import type { DeviceSlot, DeviceSyncStatus } from '@/data/deviceWorkingSet'
import {
  getDevicePresetSyncStatus,
  getDeviceSetSyncStatus,
  type DevicePresetSyncMap,
} from '@/utils/deviceSyncStatus'
import { getDeviceSlotId } from '@/utils/deviceSlots'
import type { Preset, Set as LibrarySet } from '@/types'

type DeviceWorkingSetListProps = {
  slots: DeviceSlot[]
  sets: LibrarySet[]
  presets: Preset[]
  presetSync: DevicePresetSyncMap
  selectedIds: Set<string>
  onToggleSelect: (slotId: string) => void
  onSelectAll: () => void
  onClearSelection: () => void
  onReorderSlots: (slots: DeviceSlot[]) => void
  onEditSet: (setId: string) => void
  onEditPreset: (presetId: string) => void
  onRemoveSlot: (slotId: string) => void
  onBulkRemove: () => void
}

type SortableDeviceSlotProps = {
  slot: DeviceSlot
  slotId: string
  sequenceIndex: number
  setsById: Map<string, LibrarySet>
  presetsById: Map<string, Preset>
  presetSync: DevicePresetSyncMap
  devicePresetSyncById: Map<string, DeviceSyncStatus>
  expandedSlotId: string | null
  bulkActive: boolean
  isSelected: boolean
  onToggleExpand: (setId: string) => void
  onToggleSelect: () => void
  onEditSet: (setId: string) => void
  onEditPreset: (presetId: string) => void
  onRemoveSlot: (slotId: string) => void
}

function SortableDeviceSlot({
  slot,
  slotId,
  sequenceIndex,
  setsById,
  presetsById,
  presetSync,
  devicePresetSyncById,
  expandedSlotId,
  bulkActive,
  isSelected,
  onToggleExpand,
  onToggleSelect,
  onEditSet,
  onEditPreset,
  onRemoveSlot,
}: SortableDeviceSlotProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slotId })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dragProps = {
    dragHandleAttributes: attributes,
    dragHandleListeners: listeners,
  }

  if (slot.type === 'set') {
    const set = setsById.get(slot.setId)
    if (!set) {
      return null
    }

    return (
      <div ref={setNodeRef} style={style}>
        <DeviceSetSlotRow
          set={set}
          sequenceIndex={sequenceIndex}
          presetsById={presetsById}
          devicePresetSyncById={devicePresetSyncById}
          deviceSyncStatus={getDeviceSetSyncStatus(set, presetSync)}
          isExpanded={expandedSlotId === set.id}
          bulkActive={bulkActive}
          isSelected={isSelected}
          onToggleSelect={onToggleSelect}
          onToggleExpand={() => onToggleExpand(set.id)}
          onEdit={() => onEditSet(set.id)}
          onRemove={() => onRemoveSlot(slotId)}
          onEditInnerPreset={onEditPreset}
          isDragPlaceholder={isDragging}
          {...dragProps}
        />
      </div>
    )
  }

  const preset = presetsById.get(slot.presetId)
  if (!preset) {
    return null
  }

  return (
    <div ref={setNodeRef} style={style}>
      <DevicePresetSlotRow
        preset={preset}
        sequenceIndex={sequenceIndex}
        deviceSyncStatus={slot.syncStatus}
        bulkActive={bulkActive}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
        onEdit={() => onEditPreset(preset.id)}
        onRemove={() => onRemoveSlot(slotId)}
        isDragPlaceholder={isDragging}
        {...dragProps}
      />
    </div>
  )
}

export function DeviceWorkingSetList({
  slots,
  sets,
  presets,
  presetSync,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onReorderSlots,
  onEditSet,
  onEditPreset,
  onRemoveSlot,
  onBulkRemove,
}: DeviceWorkingSetListProps) {
  const [expandedSlotId, setExpandedSlotId] = useState<string | null>(null)
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null)

  const setsById = useMemo(() => new Map(sets.map((set) => [set.id, set])), [sets])
  const presetsById = useMemo(
    () => new Map(presets.map((preset) => [preset.id, preset])),
    [presets],
  )
  const devicePresetSyncById = useMemo(
    () =>
      new Map(
        presets.map((preset) => [
          preset.id,
          getDevicePresetSyncStatus(preset.id, presetSync),
        ]),
      ),
    [presets, presetSync],
  )

  const slotIds = useMemo(() => slots.map(getDeviceSlotId), [slots])
  const bulkActive = selectedIds.size > 0

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const activeSlot = activeSlotId
    ? slots.find((slot) => getDeviceSlotId(slot) === activeSlotId)
    : undefined
  const activeSequenceIndex = activeSlot
    ? slots.findIndex((slot) => getDeviceSlotId(slot) === activeSlotId)
    : -1

  function handleToggleExpand(setId: string) {
    setExpandedSlotId((current) => (current === setId ? null : setId))
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveSlotId(String(event.active.id))
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    setActiveSlotId(null)

    if (!over || active.id === over.id) {
      return
    }

    const oldIndex = slotIds.indexOf(String(active.id))
    const newIndex = slotIds.indexOf(String(over.id))

    if (oldIndex === -1 || newIndex === -1) {
      return
    }

    onReorderSlots(arrayMove(slots, oldIndex, newIndex))
  }

  function handleDragCancel() {
    setActiveSlotId(null)
  }

  function renderDragOverlaySlot(slot: DeviceSlot, sequenceIndex: number) {
    if (slot.type === 'set') {
      const set = setsById.get(slot.setId)
      if (!set) {
        return null
      }

      return (
        <DeviceSetSlotRow
          set={set}
          sequenceIndex={sequenceIndex}
          presetsById={presetsById}
          devicePresetSyncById={devicePresetSyncById}
          deviceSyncStatus={getDeviceSetSyncStatus(set, presetSync)}
          isExpanded={false}
          bulkActive={bulkActive}
          isSelected={selectedIds.has(getDeviceSlotId(slot))}
          onToggleExpand={() => undefined}
          onEdit={() => undefined}
          onRemove={() => undefined}
          onEditInnerPreset={() => undefined}
          isDragOverlay
        />
      )
    }

    const preset = presetsById.get(slot.presetId)
    if (!preset) {
      return null
    }

    return (
      <DevicePresetSlotRow
        preset={preset}
        sequenceIndex={sequenceIndex}
        deviceSyncStatus={slot.syncStatus}
        bulkActive={bulkActive}
        isSelected={selectedIds.has(getDeviceSlotId(slot))}
        onEdit={() => undefined}
        onRemove={() => undefined}
        isDragOverlay
      />
    )
  }

  return (
    <>
      {bulkActive && (
        <div className="mt-8">
          <DeviceSectionHeader
            bulkActive={bulkActive}
            selectedCount={selectedIds.size}
            totalCount={slots.length}
            onSelectAll={onSelectAll}
            onClear={onClearSelection}
            onRemoveSelected={onBulkRemove}
          />
        </div>
      )}

      {!bulkActive && (
        <div className="pb-2 pt-8">
          <div className={`${DEVICE_TABLE_GRID} pr-6 text-sm font-light text-text-muted`}>
            <div className="flex items-center">
              <span className={`shrink-0 ${deviceSlotInnerRowSpacerClassName()}`} aria-hidden="true" />
              <span className="ml-3">Name</span>
            </div>
            <div className="flex justify-end pr-[4.75rem]">
              <span>Status</span>
            </div>
          </div>
        </div>
      )}
      <div className={`${libraryListBodyClassName()} ${bulkActive ? '' : 'mt-2'}`}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={slotIds} strategy={verticalListSortingStrategy}>
            <div className={deviceSlotListRowsClassName()}>
              {slots.map((slot, index) => {
                const slotId = getDeviceSlotId(slot)

                return (
                  <SortableDeviceSlot
                    key={slotId}
                    slot={slot}
                    slotId={slotId}
                    sequenceIndex={index}
                    setsById={setsById}
                    presetsById={presetsById}
                    presetSync={presetSync}
                    devicePresetSyncById={devicePresetSyncById}
                    expandedSlotId={expandedSlotId}
                    bulkActive={bulkActive}
                    isSelected={selectedIds.has(slotId)}
                    onToggleExpand={handleToggleExpand}
                    onToggleSelect={() => onToggleSelect(slotId)}
                    onEditSet={onEditSet}
                    onEditPreset={onEditPreset}
                    onRemoveSlot={onRemoveSlot}
                  />
                )
              })}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeSlot && activeSequenceIndex >= 0 ? (
              <div className={deviceSlotDragOverlayClassName()}>
                {renderDragOverlaySlot(activeSlot, activeSequenceIndex)}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </>
  )
}
