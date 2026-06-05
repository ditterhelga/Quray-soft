import { NavLink } from 'react-router-dom'
import type { FunctionComponent, SVGProps } from 'react'
import { Tooltip } from '@/components/ui/Tooltip'

export const NAV_LINK_BASE =
  'relative flex h-12 cursor-pointer items-center border transition-colors duration-[120ms] ease-in-out'

export function navLinkClass(isActive: boolean, isCollapsed: boolean) {
  const layout = isCollapsed ? 'w-full justify-center' : 'gap-3 px-4'
  const radius = isCollapsed ? 'rounded-lg' : 'rounded-xl'

  if (isActive) {
    return `${NAV_LINK_BASE} ${layout} ${radius} border-border-active bg-bg-active text-text-primary`
  }

  return `${NAV_LINK_BASE} ${layout} ${radius} border-transparent bg-transparent text-text-secondary hover:bg-white/[0.04]`
}

export type NavItemProps = {
  to: string
  label: string
  icon: FunctionComponent<SVGProps<SVGSVGElement>>
  end?: boolean
  isCollapsed: boolean
}

export function NavItem({ to, label, icon: Icon, end, isCollapsed }: NavItemProps) {
  const link = (
    <NavLink to={to} end={end} className={({ isActive }) => navLinkClass(isActive, isCollapsed)}>
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              className="absolute -left-px top-1/2 h-[28px] w-[3px] -translate-y-1/2 bg-accent"
              aria-hidden="true"
            />
          )}
          <Icon className="shrink-0" aria-hidden="true" />
          <span
            className={`whitespace-nowrap transition-opacity duration-[250ms] ease-in-out ${
              isCollapsed ? 'pointer-events-none absolute opacity-0' : 'opacity-100'
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )

  return (
    <Tooltip content={label} disabled={!isCollapsed} className="relative flex w-full">
      {link}
    </Tooltip>
  )
}
