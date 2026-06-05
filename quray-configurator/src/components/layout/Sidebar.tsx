import QurayLogo from '@/assets/icons/Quray-logo.svg?react'
import QurayLogoShort from '@/assets/icons/Quray-logo-short.svg?react'
import CloseBarIcon from '@/assets/icons/close-bar-icon.svg?react'
import LibraryIcon from '@/assets/icons/Library-icon.svg?react'
import DeviceIcon from '@/assets/icons/Device-icon.svg?react'
import { Divider } from '@/components/ui/Divider'
import { AccountRow } from '@/components/layout/AccountRow'
import { NavItem } from '@/components/layout/NavItem'

const RECENT_PRESETS = [
  {
    label: 'Today',
    presets: [
      'Subharmonic Drift',
      'West Coast Buchla Gesture',
      'Tape Stop Gesture',
    ],
  },
  {
    label: 'Yesterday',
    presets: [
      'Mutable Clouds Wash',
      'Eurorack Clock Mult',
      'Quad VCA Swell',
    ],
  },
  {
    label: 'Earlier',
    presets: ['Acid Squelch Lane', 'Bipolar CV'],
  },
] as const

type SidebarProps = {
  isCollapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  onOpenDeviceSettings: () => void
}

export function Sidebar({
  isCollapsed,
  onCollapsedChange,
  onOpenDeviceSettings,
}: SidebarProps) {
  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-x-visible border-r border-border-panel bg-bg-sidebar transition-[width] duration-[250ms] ease-in-out ${
        isCollapsed ? 'w-[64px]' : 'w-[264px]'
      }`}
    >
      <div
        className={`relative flex h-[72px] shrink-0 items-center ${
          isCollapsed ? 'justify-center' : 'justify-between pl-6 pr-6'
        }`}
      >
        <div
          className={`flex items-center text-text-primary transition-opacity duration-[250ms] ease-in-out ${
            isCollapsed
              ? 'pointer-events-none absolute opacity-0'
              : 'opacity-100'
          }`}
        >
          <QurayLogo className="block shrink-0" aria-label="Quray" />
        </div>

        <button
          type="button"
          onClick={() => onCollapsedChange(true)}
          className={`flex cursor-pointer items-center text-text-primary transition-[opacity,color] duration-[250ms] ease-in-out hover:text-text-secondary ${
            isCollapsed
              ? 'pointer-events-none absolute opacity-0'
              : 'opacity-100'
          }`}
          aria-label="Collapse sidebar"
          tabIndex={isCollapsed ? -1 : 0}
        >
          <CloseBarIcon className="block shrink-0" />
        </button>

        <button
          type="button"
          onClick={() => onCollapsedChange(false)}
          className={`flex cursor-pointer items-center text-text-primary transition-[opacity,color] duration-[250ms] ease-in-out hover:text-text-secondary ${
            isCollapsed ? 'opacity-100' : 'pointer-events-none absolute opacity-0'
          }`}
          aria-label="Expand sidebar"
          tabIndex={isCollapsed ? 0 : -1}
        >
          <QurayLogoShort className="block shrink-0" />
        </button>
      </div>

      <Divider />

      <nav
        className={`mt-8 shrink-0 flex flex-col gap-4 transition-[padding] duration-[250ms] ease-in-out ${
          isCollapsed ? 'px-2' : 'px-4'
        }`}
      >
        <NavItem to="/" end label="Library" icon={LibraryIcon} isCollapsed={isCollapsed} />
        <NavItem to="/device" label="Device" icon={DeviceIcon} isCollapsed={isCollapsed} />
      </nav>

      {isCollapsed ? (
        <div className="min-h-0 flex-1" aria-hidden="true" />
      ) : (
        <div className="mt-8 flex min-h-0 flex-1 flex-col overflow-hidden">
          <Divider />

          <section className="mt-8 flex min-h-0 flex-1 flex-col overflow-hidden">
            <h2 className="shrink-0 pl-6 text-sm font-light uppercase tracking-wide text-text-muted">
              Recent Presets
            </h2>

            <div className="mt-6 min-h-0 flex-1 overflow-y-auto">
              <div className="flex flex-col gap-6 pb-4">
                {RECENT_PRESETS.map((group) => (
                  <div key={group.label}>
                    <h3 className="pl-6 text-sm font-light text-text-muted">
                      {group.label}
                    </h3>
                    <ul className="mt-4 flex w-full flex-col gap-3 px-3">
                      {group.presets.map((name) => (
                        <li key={name} className="w-full">
                          <button
                            type="button"
                            className="block w-full min-w-0 cursor-pointer truncate rounded-lg px-3 py-1.5 text-left text-sm font-light text-text-primary opacity-70 transition duration-[120ms] ease-in-out hover:bg-bg-active hover:opacity-100"
                            title={name}
                          >
                            {name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}

      <AccountRow
        isCollapsed={isCollapsed}
        onOpenDeviceSettings={onOpenDeviceSettings}
      />
    </aside>
  )
}
