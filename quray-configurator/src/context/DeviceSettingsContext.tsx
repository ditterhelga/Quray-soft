import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'

type DeviceSettingsContextValue = {
  isOpen: boolean
  openDeviceSettings: () => void
  closeDeviceSettings: () => void
}

const DeviceSettingsContext = createContext<DeviceSettingsContextValue | null>(null)

export function DeviceSettingsProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openDeviceSettings = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeDeviceSettings = useCallback(() => {
    setIsOpen(false)
  }, [])

  return (
    <DeviceSettingsContext.Provider
      value={{ isOpen, openDeviceSettings, closeDeviceSettings }}
    >
      {children}
    </DeviceSettingsContext.Provider>
  )
}

export function useDeviceSettings() {
  const context = useContext(DeviceSettingsContext)

  if (!context) {
    throw new Error('useDeviceSettings must be used within DeviceSettingsProvider')
  }

  return context
}
