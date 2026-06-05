# Process notes

Decisions that differ between this prototype and intended production behavior.

## Preset list scaling

The My Library preset list is a **simple scrollable list** — every row mounts in the DOM. That is appropriate for mock data and UX prototyping.

**Production:** the preset library is unlimited in size. Use **list virtualization** (e.g. `@tanstack/react-virtual`) so only visible rows render. Filtering, sorting, and bulk selection should operate on the full dataset while the viewport renders a window of rows.

This is a deliberate prototype-vs-production tradeoff: ship interaction and layout first; add virtualization when wiring real data volume.

## Library layout spacing

Hero glow ends **32px** below the search/filters row (`pb-8` on the glow cap in `LibraryHeroGlowLayout`); pills, toggle, and table sit on flat `bg-bg-base`. Preset list spacing: **32px** above toggle (glow cap when no pills, `pt-8` when pills visible), **32px** below toggle (`pb-8` on toolbar), **20px** from column headers to first row (`mt-5`). Sticky chrome on scroll is not implemented yet — everything scrolls normally for now.
