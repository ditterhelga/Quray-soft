import { NavLink } from 'react-router-dom'
import type { ReactNode } from 'react'

const TAB_BASE_CLASSNAME =
  'relative inline-flex h-12 cursor-pointer items-center text-xl font-light font-[300] leading-none transition-colors duration-[120ms] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:content-[""] [font-weight:300]'

type TabProps = {
  to: string
  end?: boolean
  children: ReactNode
}

export function Tab({ to, end, children }: TabProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) => tabClassName(isActive)}
    >
      {children}
    </NavLink>
  )
}

export function tabClassName(active: boolean) {
  return `${TAB_BASE_CLASSNAME} ${
    active
      ? 'text-text-primary after:bg-accent'
      : 'text-text-secondary hover:text-text-primary after:bg-transparent'
  }`
}

export function tabGroupClassName() {
  return 'flex h-12 min-w-0 items-center gap-8'
}
