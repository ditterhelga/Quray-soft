import { Plus } from '@phosphor-icons/react'
import { useEffect, useMemo, useState } from 'react'
import {
  CommandPaletteModal,
  commandPaletteCreateActionClassName,
  commandPaletteItemClassName,
} from '@/components/library/CommandPaletteModal'
import type { Set as LibrarySet } from '@/types'

type SetPickerModalProps = {
  open: boolean
  title: string
  sets: LibrarySet[]
  excludeSetId?: string
  onClose: () => void
  onSelectSet: (setId: string) => void
  onCreateSet: () => void
}

export function SetPickerModal({
  open,
  title,
  sets,
  excludeSetId,
  onClose,
  onSelectSet,
  onCreateSet,
}: SetPickerModalProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeSetId, setActiveSetId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setSearchQuery('')
      setActiveSetId(null)
    }
  }, [open])

  const filteredSets = useMemo(() => {
    const availableSets = excludeSetId
      ? sets.filter((set) => set.id !== excludeSetId)
      : sets
    const query = searchQuery.trim().toLowerCase()

    if (!query) {
      return availableSets
    }

    return availableSets.filter((set) => set.name.toLowerCase().includes(query))
  }, [sets, excludeSetId, searchQuery])

  function handleSelectSet(setId: string) {
    onSelectSet(setId)
    onClose()
  }

  function handleCreateSet() {
    onCreateSet()
    onClose()
  }

  return (
    <CommandPaletteModal
      open={open}
      title={title}
      onClose={onClose}
      searchQuery={searchQuery}
      onSearchQueryChange={setSearchQuery}
      searchPlaceholder="Search sets…"
    >
      <button type="button" onClick={handleCreateSet} className={commandPaletteCreateActionClassName()}>
        <Plus size={16} weight="regular" className="shrink-0" aria-hidden="true" />
        Create new set
      </button>

      {filteredSets.length === 0 ? (
        <p className="px-4 py-6 text-sm font-light text-text-muted">No sets match your search</p>
      ) : (
        filteredSets.map((set) => (
          <button
            key={set.id}
            type="button"
            onClick={() => handleSelectSet(set.id)}
            onMouseEnter={() => setActiveSetId(set.id)}
            className={commandPaletteItemClassName(activeSetId === set.id)}
          >
            <span className="truncate">{set.name}</span>
            <span className="ml-auto shrink-0 text-text-muted">
              {set.members.length} preset{set.members.length === 1 ? '' : 's'}
            </span>
          </button>
        ))
      )}
    </CommandPaletteModal>
  )
}
