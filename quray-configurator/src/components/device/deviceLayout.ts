export function deviceStatusBlockClassName() {
  return 'mt-8 px-8'
}

export function deviceStatusRowClassName() {
  return 'flex flex-wrap items-center gap-x-10 gap-y-4'
}

export function deviceStatusItemClassName() {
  return 'flex min-w-0 flex-col gap-1'
}

export function deviceStatusLabelClassName() {
  return 'text-sm font-light text-text-secondary'
}

export function deviceStatusValueClassName() {
  return 'text-sm font-light text-text-primary'
}

export function deviceStatusCapacityClassName() {
  return 'min-w-[12rem] flex-1'
}

export function deviceCapacityTrackClassName() {
  return 'h-1 w-full overflow-hidden rounded-sm bg-bg-hover'
}

export function deviceCapacityFillClassName(fillPercent: number) {
  if (fillPercent > 100) {
    return 'h-full rounded-sm bg-status-error transition-colors duration-[120ms]'
  }

  if (fillPercent >= 85) {
    return 'h-full rounded-sm bg-status-progress transition-colors duration-[120ms]'
  }

  return 'h-full rounded-sm bg-accent transition-colors duration-[120ms]'
}

export function deviceToolbarTitleClassName() {
  return 'inline-flex h-12 items-center text-xl font-light font-[300] leading-none text-text-primary [font-weight:300]'
}

export function deviceUpdateButtonClassName() {
  return 'inline-flex h-12 cursor-pointer items-center gap-2 rounded-lg bg-accent px-6 text-lg font-normal text-text-primary transition-[filter] duration-[120ms] hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100 font-light leading-none font-[300] [font-weight:300]'
}

export function deviceStagedChangesClassName() {
  return 'text-sm font-light text-text-secondary'
}

export function formatDeviceStagedChangesLabel(
  arrangementChangeCount: number,
  updateCount: number,
): string[] {
  const parts: string[] = []

  if (arrangementChangeCount > 0) {
    parts.push(
      `${arrangementChangeCount} change${arrangementChangeCount === 1 ? '' : 's'}`,
    )
  }

  if (updateCount > 0) {
    parts.push(`${updateCount} modified`)
  }

  return parts
}

export function deviceStagedChangesListClassName() {
  return `${deviceStagedChangesClassName()} inline-flex items-center gap-x-4`
}
