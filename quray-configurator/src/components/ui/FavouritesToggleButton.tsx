import { Star } from '@phosphor-icons/react'
import { useState } from 'react'
import { squareIconButtonClassName } from '@/components/ui/IconButton'

type FavouritesToggleButtonProps = {
  active: boolean
  onToggle: () => void
}

export function FavouritesToggleButton({ active, onToggle }: FavouritesToggleButtonProps) {
  const [hovered, setHovered] = useState(false)
  const filled = active || hovered

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label="Show favourites only"
      onClick={onToggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={squareIconButtonClassName()}
    >
      <Star
        size={20}
        weight={filled ? 'fill' : 'regular'}
        className="text-text-muted"
        aria-hidden="true"
      />
    </button>
  )
}

export function favouritesToggleClassName(state: 'off' | 'hover' | 'active') {
  return squareIconButtonClassName(state === 'hover' || state === 'active')
}
