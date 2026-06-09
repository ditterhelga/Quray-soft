import { Outlet, useLocation } from 'react-router-dom'
import { DeviceSettingsModal } from '@/components/DeviceSettingsModal'
import {
  DeviceSettingsProvider,
  useDeviceSettings,
} from '@/context/DeviceSettingsContext'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

function AppShellContent() {
  const { isCollapsed, onCollapsedChange } = useSidebar()
  const { isOpen, openDeviceSettings, closeDeviceSettings } = useDeviceSettings()
  const location = useLocation()
  const isLibraryHome = location.pathname === '/'

  return (
    <>
      <div className="flex h-screen min-h-0 overflow-hidden bg-bg-main">
        <Sidebar
          isCollapsed={isCollapsed}
          onCollapsedChange={onCollapsedChange}
          onOpenDeviceSettings={openDeviceSettings}
        />
        <div className="flex min-h-0 flex-1 flex-col bg-bg-base">
          {!isLibraryHome && <Header />}
          <main className="min-h-0 flex-1 overflow-y-auto bg-bg-base">
            <Outlet />
          </main>
        </div>
      </div>
      <DeviceSettingsModal open={isOpen} onClose={closeDeviceSettings} />
    </>
  )
}

export function AppShell() {
  return (
    <DeviceSettingsProvider>
      <SidebarProvider>
        <AppShellContent />
      </SidebarProvider>
    </DeviceSettingsProvider>
  )
}
