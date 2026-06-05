import { AccountMenu } from '@/components/layout/AccountMenu'

type AccountRowProps = {
  isCollapsed: boolean
  onOpenDeviceSettings: () => void
}

export function AccountRow({ isCollapsed, onOpenDeviceSettings }: AccountRowProps) {
  return (
    <div
      className={`mt-auto flex shrink-0 items-center pb-6 transition-[padding] duration-[250ms] ease-in-out ${
        isCollapsed ? 'justify-center px-1' : 'pl-6 pr-6'
      }`}
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-avatar text-sm text-text-primary">
        E
      </div>
      <span
        className={`ml-3 min-w-0 flex-1 truncate text-sm font-normal text-text-primary transition-opacity duration-[250ms] ease-in-out ${
          isCollapsed ? 'hidden' : 'opacity-100'
        }`}
      >
        Eduard
      </span>
      {!isCollapsed && <AccountMenu onOpenDeviceSettings={onOpenDeviceSettings} />}
    </div>
  )
}
