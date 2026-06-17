import QurayLogo from '@/assets/icons/Quray-logo.svg?react'
import QurayLogoShort from '@/assets/icons/Quray-logo-short.svg?react'
import CloseBarIcon from '@/assets/icons/close-bar-icon.svg?react'
import LibraryIcon from '@/assets/icons/Library-icon.svg?react'
import DeviceIcon from '@/assets/icons/Device-icon.svg?react'
import StatusOnIcon from '@/assets/icons/status-on.svg?react'
import StatusNoneIcon from '@/assets/icons/status-none.svg?react'
import {
  ArrowLeft,
  CaretRight,
  MusicNote,
  SquaresFour,
  WarningCircle,
} from '@phosphor-icons/react'
import { useEditorZones } from '@/context/EditorZonesContext'
import type { EditorZone } from '@/types'
import { useLocation, useNavigate } from 'react-router-dom'
import { Divider } from '@/components/ui/Divider'

function editorZoneStatusSubLabel(zone: EditorZone): string | null {
  const parts: string[] = []
  if (zone.locked) parts.push('Locked')
  if (!zone.active) parts.push('Inactive')
  return parts.length > 0 ? parts.join(' · ') : null
}
import { AccountRow } from '@/components/layout/AccountRow'
import { NavItem } from '@/components/layout/NavItem'

const MOCK_PRESET = {
  id: 'preset-1',
  name: 'Bassline Filter Sweep',
  colorA: '#A259F7',
  colorB: '#F24E8A',
}

const mockSyncStatus = 'not-synced' as 'synced' | 'not-synced'
const mockAutosaveStatus = 'saved' as 'saving' | 'saved' | 'error'

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
  const location = useLocation()
  const isEditor = location.pathname === '/editor'
  const navigate = useNavigate()
  const { zones, selectedZoneId, setSelectedZoneId, openZoneContextMenu } = useEditorZones()

  return (
    <aside
      className={`flex h-full min-h-0 shrink-0 flex-col overflow-x-visible border-r border-border-panel bg-bg-sidebar transition-all duration-200 ease-in-out ${
        isCollapsed ? 'w-[64px]' : 'w-[264px]'
      }`}
    >
      <div
        className={`relative flex h-[72px] shrink-0 items-center transition-all duration-200 ease-in-out ${
          isCollapsed ? 'px-0' : 'px-6'
        }`}
      >
        <div className="relative min-w-0 flex-1 self-stretch">
          <div
            aria-hidden={isCollapsed}
            className={`absolute inset-y-0 flex items-center text-text-primary transition-all duration-200 ease-in-out ${
              isCollapsed
                ? 'pointer-events-none left-1/2 -translate-x-1/2 translate-y-1 opacity-0'
                : 'left-0 translate-x-0 translate-y-1 opacity-100'
            }`}
          >
            <QurayLogo className="block shrink-0" aria-label="Quray" />
          </div>

          <button
            type="button"
            onClick={() => onCollapsedChange(false)}
            aria-label="Expand sidebar"
            tabIndex={isCollapsed ? 0 : -1}
            className={`absolute inset-y-0 flex cursor-pointer items-center text-text-primary transition-all duration-200 ease-in-out hover:text-text-secondary ${
              isCollapsed
                ? 'left-1/2 -translate-x-1/2 translate-y-1 opacity-100'
                : 'pointer-events-none left-0 translate-x-0 translate-y-1 opacity-0'
            }`}
          >
            <QurayLogoShort className="block shrink-0" aria-hidden="true" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => onCollapsedChange(true)}
          aria-label="Collapse sidebar"
          aria-hidden={isCollapsed}
          tabIndex={isCollapsed ? -1 : 0}
          className={`flex shrink-0 cursor-pointer items-center overflow-hidden text-text-primary transition-all duration-200 ease-in-out hover:text-text-secondary ${
            isCollapsed
              ? 'pointer-events-none ml-0 w-0 min-w-0 opacity-0'
              : 'ml-3 w-5 opacity-100'
          }`}
        >
          <CloseBarIcon className="block shrink-0" />
        </button>
      </div>

      <Divider />

      {isEditor ? (
        isCollapsed ? (
          <div className="min-h-0 flex-1" aria-hidden="true" />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col px-0">
            <div className="px-6 pt-4">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="relative flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border border-transparent bg-transparent pl-2 text-text-secondary hover:bg-white/[0.04] transition-colors duration-[120ms] ease-in-out"
              >
                <ArrowLeft size={20} className="shrink-0" />
                <span>Back to Library</span>
              </button>
            </div>

            <div className="px-6 pb-5 pt-4">
              <p className="text-lg font-light text-text-primary">{MOCK_PRESET.name}</p>

              <div className="mt-3 flex items-center gap-1.5 text-xs text-text-muted">
                {mockSyncStatus === 'synced' ? (
                  <StatusOnIcon className="h-3 w-3 shrink-0 text-status-positive" />
                ) : (
                  <StatusNoneIcon className="h-3 w-3 shrink-0 text-status-neutral" />
                )}
                <span>{mockSyncStatus === 'synced' ? 'Synced' : 'Not synced'}</span>

                <span className="opacity-30">·</span>

                {mockAutosaveStatus === 'saving' && <span>Saving…</span>}
                {mockAutosaveStatus === 'saved' && (
                  <span className="inline-flex items-center gap-1.5">
                    <StatusOnIcon className="h-3 w-3 shrink-0 text-status-positive" />
                    Autosaved
                  </span>
                )}
                {mockAutosaveStatus === 'error' && (
                  <span className="flex items-center gap-1 text-status-error">
                    <WarningCircle size={12} />
                    Not saved
                  </span>
                )}
              </div>
            </div>

            <div className="mt-5">
              <p className="mb-5 shrink-0 pl-6 text-sm font-light uppercase tracking-wide text-text-muted">
                Preset setup
              </p>

              <div className="flex flex-col gap-3 px-4 pb-5">
                <button
                  type="button"
                  className="flex h-12 w-full items-center gap-5 rounded-xl border border-border-active bg-bg-active pl-5 pr-4 cursor-pointer transition-colors duration-[120ms] ease-in-out hover:bg-bg-row-hover"
                >
                  <span
                    className="h-5 w-5 shrink-0 rounded-full"
                    style={{
                      background: `linear-gradient(135deg, ${MOCK_PRESET.colorA}, ${MOCK_PRESET.colorB})`,
                    }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block text-left text-sm text-text-primary">Color</span>
                    <span className="block text-left text-xs font-light text-text-muted">Gradient</span>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-text-muted ml-auto" />
                </button>

                <button
                  type="button"
                  className="flex h-12 w-full items-center gap-5 rounded-xl border border-border-active bg-bg-active pl-5 pr-4 cursor-pointer transition-colors duration-[120ms] ease-in-out hover:bg-bg-row-hover"
                >
                  <MusicNote size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block text-left text-sm text-text-primary">Scale</span>
                    <span className="block text-left text-xs font-light text-text-muted">Chromatic</span>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-text-muted ml-auto" />
                </button>

                <button
                  type="button"
                  className="flex h-12 w-full items-center gap-5 rounded-xl border border-border-active bg-bg-active pl-5 pr-4 cursor-pointer transition-colors duration-[120ms] ease-in-out hover:bg-bg-row-hover"
                >
                  <SquaresFour size={20} className="shrink-0 text-text-muted" aria-hidden="true" />
                  <div className="flex-1 min-w-0 text-left">
                    <span className="block text-left text-sm text-text-primary">Layout</span>
                    <span className="block text-left text-xs font-light text-text-muted">Freehand</span>
                  </div>
                  <CaretRight size={16} className="shrink-0 text-text-muted ml-auto" />
                </button>
              </div>
            </div>

            <section className="min-h-0 flex-1 overflow-y-auto">
              <p className="mt-5 mb-3 shrink-0 pl-6 text-sm font-light uppercase tracking-wide text-text-muted">
                Zones
              </p>

              <ul className="flex flex-col gap-3 px-4">
                {zones.map((zone, index) => {
                  const isSelected = zone.id === selectedZoneId
                  const statusSubLabel = editorZoneStatusSubLabel(zone)

                  return (
                    <li key={zone.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedZoneId(zone.id)}
                        onContextMenu={(event) => {
                          event.preventDefault()
                          setSelectedZoneId(zone.id)
                          openZoneContextMenu(zone.id, event.clientX, event.clientY)
                        }}
                        className={`flex items-center h-12 w-full pl-5 pr-4 rounded-xl border border-border-active bg-bg-active cursor-pointer hover:bg-bg-row-hover transition-colors duration-[120ms] ease-in-out ${
                          isSelected ? 'relative' : ''
                        }`}
                      >
                        {isSelected && (
                          <span
                            className="absolute -left-px top-1/2 h-[28px] w-[3px] -translate-y-1/2 bg-accent"
                            aria-hidden="true"
                          />
                        )}
                        <span className="mr-5 shrink-0 text-sm font-medium text-text-muted">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        <div className="min-w-0 flex-1 text-left">
                          <span
                            className={`block truncate text-sm font-light ${
                              isSelected ? 'text-text-primary' : 'text-text-muted'
                            }`}
                          >
                            {zone.name}
                          </span>
                          {statusSubLabel && (
                            <span className="block text-[10px] leading-tight text-text-muted">
                              {statusSubLabel}
                            </span>
                          )}
                        </div>
                        <span
                          className="ml-auto h-[10px] w-[10px] shrink-0 rounded-sm"
                          style={{ background: zone.color }}
                          aria-hidden="true"
                        />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          </div>
        )
      ) : (
        <>
          <nav
            className={`mt-8 shrink-0 flex flex-col gap-4 transition-all duration-200 ease-in-out ${
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
        </>
      )}

      <AccountRow
        isCollapsed={isCollapsed}
        onOpenDeviceSettings={onOpenDeviceSettings}
      />
    </aside>
  )
}
