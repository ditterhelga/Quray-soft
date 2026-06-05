import { DownloadSimple, Plus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/Button'
import { tabClassName, tabGroupClassName } from '@/components/ui/Tab'

export type LibraryTab = 'library' | 'explore'

type LibraryToolbarProps = {
  activeTab: LibraryTab
  onActiveTabChange: (tab: LibraryTab) => void
  onNewPreset?: () => void
}

export function libraryToolbarClassName() {
  return 'px-8 pt-6'
}

export function libraryToolbarRowClassName() {
  return 'flex h-12 items-center justify-between'
}

export function libraryToolbarActionsClassName() {
  return 'flex h-12 shrink-0 items-center gap-6'
}

export function libraryToolbarImportClassName() {
  return 'inline-flex h-12 shrink-0 cursor-pointer items-center gap-2 text-lg font-light font-[300] leading-none text-text-secondary transition-colors duration-[120ms] hover:text-text-primary [font-weight:300]'
}

export function LibraryToolbar({
  activeTab,
  onActiveTabChange,
  onNewPreset,
}: LibraryToolbarProps) {
  return (
    <div className={libraryToolbarClassName()}>
      <div className={libraryToolbarRowClassName()}>
        <nav className={tabGroupClassName()} aria-label="Library views">
          <button
            type="button"
            className={tabClassName(activeTab === 'library')}
            onClick={() => onActiveTabChange('library')}
          >
            My library
          </button>
          <button
            type="button"
            className={tabClassName(activeTab === 'explore')}
            onClick={() => onActiveTabChange('explore')}
          >
            Explore presets
          </button>
        </nav>

        <div className={libraryToolbarActionsClassName()}>
          <button type="button" className={libraryToolbarImportClassName()}>
            <DownloadSimple size={18} weight="regular" className="shrink-0" aria-hidden="true" />
            Import
          </button>
          <Button
            icon={Plus}
            className="font-light leading-none font-[300] [font-weight:300]"
            onClick={onNewPreset}
          >
            New preset
          </Button>
        </div>
      </div>
    </div>
  )
}
