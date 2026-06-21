import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import { FACTORY_PRESETS } from '@/data/factoryPresets'
import { PRESETS } from '@/data/presets'
import { SETS } from '@/data/sets'
import type { Preset, Set as LibrarySet } from '@/types'

type PresetsContextValue = {
  freshPresets: Preset[]
  setFreshPresets: Dispatch<SetStateAction<Preset[]>>
  fullPresets: Preset[]
  setFullPresets: Dispatch<SetStateAction<Preset[]>>
  freshSets: LibrarySet[]
  setFreshSets: Dispatch<SetStateAction<LibrarySet[]>>
  fullSets: LibrarySet[]
  setFullSets: Dispatch<SetStateAction<LibrarySet[]>>
  favourites: Record<string, boolean>
  setFavourites: Dispatch<SetStateAction<Record<string, boolean>>>
}

const PresetsContext = createContext<PresetsContextValue | null>(null)

export function PresetsProvider({ children }: { children: ReactNode }) {
  const [freshPresets, setFreshPresets] = useState<Preset[]>(() => [...FACTORY_PRESETS])
  const [fullPresets, setFullPresets] = useState<Preset[]>(() => [...PRESETS])
  const [freshSets, setFreshSets] = useState<LibrarySet[]>([])
  const [fullSets, setFullSets] = useState<LibrarySet[]>(() => [...SETS])
  const [favourites, setFavourites] = useState<Record<string, boolean>>(() => ({
    ...Object.fromEntries(PRESETS.map((p) => [p.id, p.isFavourite ?? false])),
    ...Object.fromEntries(FACTORY_PRESETS.map((p) => [p.id, false])),
    ...Object.fromEntries(SETS.map((s) => [s.id, false])),
  }))

  return (
    <PresetsContext.Provider
      value={{
        freshPresets, setFreshPresets,
        fullPresets, setFullPresets,
        freshSets, setFreshSets,
        fullSets, setFullSets,
        favourites, setFavourites,
      }}
    >
      {children}
    </PresetsContext.Provider>
  )
}

export function usePresetsContext() {
  const context = useContext(PresetsContext)
  if (!context) throw new Error('usePresetsContext must be used within PresetsProvider')
  return context
}
