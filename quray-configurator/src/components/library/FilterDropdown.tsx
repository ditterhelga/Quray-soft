import { CaretDown, Check } from '@phosphor-icons/react'
import { useEffect, useId, useRef, type RefObject } from 'react'
import { filterButtonClassName, filterButtonLabelClassName } from '@/components/ui/FilterButton'
import { selectionCheckboxBoxClassName } from '@/components/ui/SelectionCheckbox'
import type { FilterOption } from '@/components/library/filterOptions'

export type FilterAnchor = 'button' | 'pill'

type FilterOptionRowProps = {
  option: FilterOption
  selected: boolean
  onToggle: () => void
  showCheckbox?: boolean
}

export function FilterOptionRow({
  option,
  selected,
  onToggle,
  showCheckbox,
}: FilterOptionRowProps) {
  const Icon = option.icon
  const checkboxVisible = showCheckbox ?? selected

  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={selected}
      onClick={onToggle}
      className="group flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left text-sm font-light text-text-primary transition-colors duration-[120ms] hover:bg-bg-hover"
    >
      <span
        className={`transition-opacity duration-[120ms] ${selectionCheckboxBoxClassName(selected)} ${
          selected
            ? 'opacity-100'
            : checkboxVisible
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
        }`}
        aria-hidden="true"
      >
        {selected && (
          <Check size={10} weight="bold" className="text-text-primary" aria-hidden="true" />
        )}
      </span>
      {Icon && (
        <Icon
          className={`h-3.5 w-3.5 shrink-0 ${option.iconClassName ?? ''}`}
          aria-hidden="true"
        />
      )}
      <span className="min-w-0 truncate">{option.label}</span>
    </button>
  )
}

export function useFilterDropdownDismiss(
  isOpen: boolean,
  onClose: () => void,
  containerRef: RefObject<HTMLElement | null>,
) {
  useEffect(() => {
    if (!isOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose, containerRef])
}

type FilterDropdownPanelProps = {
  menuId: string
  options: FilterOption[]
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  className?: string
}

export function FilterDropdownPanel({
  menuId,
  options,
  selected,
  onSelectedChange,
  className = '',
}: FilterDropdownPanelProps) {
  function toggleOption(id: string) {
    if (selected.includes(id)) {
      onSelectedChange(selected.filter((value) => value !== id))
      return
    }

    onSelectedChange([...selected, id])
  }

  return (
    <div
      id={menuId}
      role="menu"
      className={`min-w-[180px] animate-[dropdown-enter_150ms_ease-out_both] rounded-lg border border-border bg-bg-active py-1 shadow-lg ${className}`.trim()}
    >
      {options.map((option) => (
        <FilterOptionRow
          key={option.id}
          option={option}
          selected={selected.includes(option.id)}
          onToggle={() => toggleOption(option.id)}
        />
      ))}
    </div>
  )
}

type FilterDropdownProps = {
  label: string
  options: FilterOption[]
  selected: string[]
  onSelectedChange: (selected: string[]) => void
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function FilterDropdown({
  label,
  options,
  selected,
  onSelectedChange,
  isOpen,
  onOpenChange,
}: FilterDropdownProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const menuId = useId()

  useFilterDropdownDismiss(isOpen, () => onOpenChange(false), containerRef)

  return (
    <div ref={containerRef} className="relative shrink-0">
      <button
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={isOpen ? menuId : undefined}
        onClick={() => onOpenChange(!isOpen)}
        className={`${filterButtonClassName()} ${isOpen ? 'bg-bg-hover' : ''}`}
      >
        <span className={filterButtonLabelClassName(isOpen)}>{label}</span>
        <CaretDown
          size={16}
          weight="regular"
          className="shrink-0 text-text-muted"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <FilterDropdownPanel
          menuId={menuId}
          options={options}
          selected={selected}
          onSelectedChange={onSelectedChange}
          className="absolute left-0 top-full z-50 mt-1.5"
        />
      )}
    </div>
  )
}
