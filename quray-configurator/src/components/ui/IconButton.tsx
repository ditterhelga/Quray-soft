import { Star, type Icon } from '@phosphor-icons/react'
import type { ButtonHTMLAttributes } from 'react'

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: Icon
  'aria-label': string
}

export function squareIconButtonClassName(hover = false) {
  return `flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-border transition-colors duration-[120ms] ${
    hover ? 'bg-bg-hover' : 'bg-bg-base hover:bg-bg-hover'
  }`
}

export function IconButton({
  icon: IconComponent = Star,
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <button
      type={type}
      className={`${squareIconButtonClassName()} ${className}`.trim()}
      {...props}
    >
      <IconComponent
        size={20}
        weight="regular"
        className="text-text-muted"
        aria-hidden="true"
      />
    </button>
  )
}
