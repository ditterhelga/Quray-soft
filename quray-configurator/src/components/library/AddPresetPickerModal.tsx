import { Plus } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import {
  CommandPaletteModal,
  commandPaletteItemClassName,
} from '@/components/library/CommandPaletteModal'
import { libraryOutlinedButtonClassName } from '@/components/library/presetRowActions'
import { SelectionCheckbox } from '@/components/ui/SelectionCheckbox'
import { confirmDialogConfirmClassName } from '@/components/ui/ConfirmDialog'
import type { Preset } from '@/types'

type AddPresetPickerModalProps = {
  open: boolean
  presets: Preset[]
  setPresetIds: string[]
  onClose: () => void
  onAdd: (presetIds: string[]) => void
  onCreatePreset: () => void
}

export function addPresetPickerItemDisabledClassName() {
  return `${commandPaletteItemClassName()} cursor-default opacity-70 hover:bg-transparent`
}

export function AddPresetPickerModal({
  open,
  presets,
  setPresetIds,
  onClose,
  onAdd,
  onCreatePreset,
}: AddPresetPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedPresetIds, setSelectedPresetIds] = useState<string[]>([])

  const setPresetIdSet = useMemo(() => new Set(setPresetIds), [setPresetIds])

  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setSelectedPresetIds([])
    }
  }, [open])

  const filteredPresets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return presets
    }

    return presets.filter((preset) => preset.name.toLowerCase().includes(query))
  }, [presets, searchQuery])

  function togglePresetSelection(presetId: string) {
    if (setPresetIdSet.has(presetId)) {
      return
    }

    setSelectedPresetIds((current) =>
      current.includes(presetId)
        ? current.filter((id) => id !== presetId)
        : [...current, presetId],
    )
  }

  function handleAdd() {
    if (selectedPresetIds.length === 0) {
      return
    }

    onAdd(selectedPresetIds)
    onClose()
  }

  function handleCreatePreset() {
    onCreatePreset()
    onClose()
  }

  const selectedCount = selectedPresetIds.length

  return (
    <CommandPaletteModal
      open={open}
      title="Add presets"
      onClose={onClose}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchPlaceholder="Search presets…"
      footer={
        <>
          <button
            type="button"
            onClick={handleCreatePreset}
            className={libraryOutlinedButtonClassName()}
          >
            <Plus size={16} weight="regular" className="shrink-0" aria-hidden="true" />
            New preset
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm font-light text-text-muted">
              {selectedCount > 0 ? `${selectedCount} selected` : ''}
            </span>
            <button
              type="button"
              onClick={handleAdd}
              disabled={selectedCount === 0}
              className={`${confirmDialogConfirmClassName()} disabled:cursor-not-allowed disabled:opacity-50`}
            >
              Add
            </button>
          </div>
        </>
      }
    >
      {filteredPresets.length === 0 ? (
        <p className="px-4 py-6 text-sm font-light text-text-muted">
          No presets match your search
        </p>
      ) : (
        filteredPresets.map((preset) => {
          const alreadyInSet = setPresetIdSet.has(preset.id)
          const checked = alreadyInSet || selectedPresetIds.includes(preset.id)

          return (
            <button
              key={preset.id}
              type="button"
              disabled={alreadyInSet}
              onClick={() => togglePresetSelection(preset.id)}
              className={
                alreadyInSet ? addPresetPickerItemDisabledClassName() : commandPaletteItemClassName()
              }
            >
              <SelectionCheckbox
                checked={checked}
                onToggle={() => togglePresetSelection(preset.id)}
                ariaLabel={
                  alreadyInSet
                    ? `${preset.name} already in set`
                    : checked
                      ? `Deselect ${preset.name}`
                      : `Select ${preset.name}`
                }
                className={alreadyInSet ? 'pointer-events-none' : undefined}
              />
              <span className="min-w-0 truncate">{preset.name}</span>
              {alreadyInSet && (
                <span className="ml-auto shrink-0 text-xs font-light text-text-muted">
                  Already in set
                </span>
              )}
            </button>
          )
        })
      )}
    </CommandPaletteModal>
  )
}
