import { type Icon } from '@phosphor-icons/react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

type ButtonVariant = 'primary'

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  icon?: Icon
  children: ReactNode
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    'inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-accent px-6 text-lg font-normal text-text-primary transition-[filter] duration-[120ms] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100',
}

export function Button({
  variant = 'primary',
  icon: IconComponent,
  children,
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${VARIANT_CLASSES[variant]} ${className}`.trim()}
      {...props}
    >
      {IconComponent && (
        <IconComponent size={18} weight="regular" className="shrink-0" aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
