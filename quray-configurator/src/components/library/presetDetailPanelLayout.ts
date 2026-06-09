export function libraryPageWithDetailPanelClassName() {
  return 'flex h-full min-h-0 w-full max-w-full overflow-x-hidden'
}

export function libraryMainColumnClassName() {
  return 'min-h-0 min-w-0 w-full max-w-full flex-1 overflow-x-hidden overflow-y-auto transition-[flex-basis,width] duration-200 ease-out'
}

export function presetDetailPanelClassName() {
  return 'relative flex h-full w-[360px] shrink-0 flex-col border-l border-border bg-bg-surface'
}

export function presetDetailPanelCloseButtonClassName() {
  return 'absolute right-4 top-4 z-10 flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-bg-hover text-text-muted transition-colors duration-[120ms] hover:bg-bg-hover-strong hover:text-text-primary'
}

export function presetDetailPanelNameRowClassName() {
  return 'flex items-center gap-2 px-6 pb-4 pt-6'
}

export function presetDetailPanelTitleClassName() {
  return 'min-w-0 flex-1 line-clamp-2 text-lg font-light leading-snug text-text-primary'
}

export function presetDetailPanelBodyClassName() {
  return 'min-h-0 flex-1 overflow-y-auto'
}

export function presetDetailPanelSectionClassName() {
  return 'border-t border-border px-6 py-5 first:border-t-0'
}

export function presetDetailPanelSectionHeaderClassName() {
  return 'text-xs font-light uppercase tracking-widest text-text-muted'
}

export function presetDetailPanelAccordionHeaderClassName() {
  return 'flex w-full cursor-pointer items-center justify-between gap-3 text-left'
}

export function presetDetailPanelAccordionCaretClassName(expanded: boolean) {
  return `shrink-0 text-text-muted transition-transform duration-[120ms] ${
    expanded ? 'rotate-180' : ''
  }`
}

export function presetDetailPanelMetadataGridClassName() {
  return 'grid grid-cols-[auto_minmax(0,1fr)] gap-x-6 gap-y-3 text-sm font-light'
}

export function presetDetailPanelMetadataLabelClassName() {
  return 'text-text-muted'
}

export function presetDetailPanelMetadataValueClassName() {
  return 'min-w-0 text-text-primary'
}

export function presetDetailPanelStatusValueClassName() {
  return 'inline-flex min-w-0 items-center gap-2 text-sm font-light text-text-primary'
}

export function presetDetailPanelZoneRowClassName() {
  return 'flex items-start gap-3 py-2'
}

export function presetDetailPanelZoneDotClassName() {
  return 'mt-1.5 h-2 w-2 shrink-0 rounded-full'
}

export function presetDetailPanelZoneNameClassName() {
  return 'text-sm font-light text-text-primary'
}

export function presetDetailPanelZoneMetaClassName() {
  return 'text-xs font-light text-text-muted'
}

export function presetDetailPanelSetRowClassName() {
  return 'flex w-full cursor-pointer items-center justify-between gap-3 py-2 text-left transition-colors duration-[120ms] hover:text-text-secondary'
}

export function presetDetailPanelSetRowLabelClassName() {
  return 'min-w-0 truncate text-sm font-light text-text-primary'
}

export function presetDetailPanelEmptyStateClassName() {
  return 'text-sm font-light text-text-muted'
}

export function presetDetailPanelFooterClassName() {
  return 'mt-auto shrink-0 border-t border-border px-6 py-6'
}

export function presetDetailPanelFooterPrimaryActionsClassName() {
  return 'flex flex-col gap-3'
}

export function presetDetailPanelSendToQurayButtonClassName() {
  return 'inline-flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-border bg-bg-active px-4 text-lg font-normal text-text-secondary transition-colors duration-[120ms] hover:bg-bg-hover hover:text-text-primary'
}

export function presetDetailPanelFooterDividerClassName() {
  return 'my-4 border-t border-border'
}

export function presetDetailPanelFooterIconActionsClassName() {
  return 'flex items-center'
}

export function presetDetailPanelFooterIconGroupClassName() {
  return 'flex flex-1 items-center justify-between'
}

export function presetDetailPanelFooterIconDividerClassName() {
  return 'mx-3 h-6 w-px shrink-0 bg-border'
}

export function presetDetailPanelFooterIconButtonClassName() {
  return 'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-bg-hover text-text-muted transition-colors duration-[120ms] hover:bg-bg-hover-strong hover:text-text-primary'
}

export function presetDetailPanelFooterDeleteButtonClassName() {
  return 'flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg bg-bg-hover text-text-muted transition-colors duration-[120ms] hover:bg-status-error/10 hover:text-red-400'
}
