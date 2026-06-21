import {
  createContext,
  useCallback,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import {
  DEVICE_PRESET_SYNC,
  DEVICE_WORKING_SET,
  type DeviceSlot,
} from '@/data/deviceWorkingSet'
import type { Preset } from '@/types'

type DevicePresetSyncMap = Record<string, 'current' | 'needs-sync'>

type DeviceContextValue = {
  slots: DeviceSlot[]
  setSlots: Dispatch<SetStateAction<DeviceSlot[]>>
  presetSync: DevicePresetSyncMap
  setPresetSync: Dispatch<SetStateAction<DevicePresetSyncMap>>
  extraPresets: Record<string, Preset>
  sendPresetToDevice: (presetId: string, preset?: Preset) => void
  sendSetToDevice: (setId: string) => void
}

const DeviceContext = createContext<DeviceContextValue | null>(null)

export function DeviceProvider({ children }: { children: ReactNode }) {
  const [slots, setSlots] = useState<DeviceSlot[]>(() => [...DEVICE_WORKING_SET])
  const [presetSync, setPresetSync] = useState<DevicePresetSyncMap>(
    () => ({ ...DEVICE_PRESET_SYNC }),
  )
  const [extraPresets, setExtraPresets] = useState<Record<string, Preset>>({})

  const sendPresetToDevice = useCallback((presetId: string, preset?: Preset) => {
    setSlots((current) => {
      const already = current.some(
        (slot) => slot.type === 'preset' && slot.presetId === presetId,
      )
      if (already) return current
      return [...current, { type: 'preset', presetId, syncStatus: 'needs-sync' }]
    })
    setPresetSync((current) => ({ ...current, [presetId]: 'needs-sync' }))
    if (preset) {
      setExtraPresets((current) => ({ ...current, [presetId]: preset }))
    }
  }, [])

  const sendSetToDevice = useCallback((setId: string) => {
    setSlots((current) => {
      const already = current.some(
        (slot) => slot.type === 'set' && slot.setId === setId,
      )
      if (already) return current
      return [...current, { type: 'set', setId }]
    })
  }, [])

  return (
    <DeviceContext.Provider
      value={{ slots, setSlots, presetSync, setPresetSync, extraPresets, sendPresetToDevice, sendSetToDevice }}
    >
      {children}
    </DeviceContext.Provider>
  )
}

export function useDeviceContext() {
  const context = useContext(DeviceContext)
  if (!context) throw new Error('useDeviceContext must be used within DeviceProvider')
  return context
}
