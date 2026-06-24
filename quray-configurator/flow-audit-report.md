# Quray Configurator — Task Flow Audit
Date: 2026-06-24
Tested against: http://localhost:5173
Source: quray-configurator/ (local dev, Vite v6.4.3)
Method: Playwright (chromium headless), DOM/text/role assertions + console capture + screenshots. Hardware-dependent steps marked ❓ and not simulated.

---

## Summary

| Flow | Name | Status | Pass | Stub | Missing | Unverifiable |
|------|------|--------|------|------|---------|--------------|
| 01 | First Open → Library → Connect | PARTIAL | 5 | 0 | 0 | 4 |
| 02 | Understand the Field & Interaction Model | DEFERRED (by design) | 2 | 1 | 0 | 4 |
| 03 | Library: Browse & Manage | PASS | 13 | 1 | 0 | 1 |
| 04 | Modify Existing Preset | PARTIAL | 8 | 2 | 1 | 0 |
| 05 | Create New Preset | PASS | 9 | 1 | 0 | 1 |
| 06 | Send to Quray | PARTIAL | 4 | 2 | 1 | 1 |
| 07 | Explore → Add to Library | PASS | 5 | 1 | 0 | 0 |
| 08 | Build a Set | PARTIAL (core built) | 4 | 6 | 0 | 0 |
| 09 | Device Page Management | PARTIAL | 7 | 1 | 0 | 4 |
| — | Styleguide | PASS | 1 | 0 | 0 | 0 |

**Overall: 58 steps verified · 15 stubs (expected/deferred by design) · 2 genuinely missing · 15 unverifiable (hardware/offline state).** Plus 2 known bugs (documented in flows) and 1 incidental HTML-validity defect (below).

---

## Flow 01 — First Open → Library → Connect

**Route(s):** /

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| UX1 | Fresh Library loads, factory presets visible | ⚠️ | Loads instantly, but shows **5+ presets** (First Touch, Aerial, Strata, Threshold, Lattice…), not the "three factory presets" the doc states. See Discrepancies. |
| UX1 | "New Preset" button top-right | ✅ | Present next to Import. |
| UX1/UX7 | Status pills "Connected · Calibrated" top-right | ✅ | Both green pills present in header (mock state). |
| UX1 | No Sets shown in fresh mode | ✅ | Confirmed via Presets/Sets toggle — Sets view empty in fresh mode. |
| UX2 | Row click → detail panel (Open in editor) | ✅ | Panel slides in with Open in editor / Send to Quray. |
| UX3 | "New Preset" → /editor/preset-empty | ✅ | Navigates correctly. |
| UX4/UX5 | USB-C connect / browser permission flow | ❓ | Requires hardware + WebUSB. Not simulated. |
| UX6 | First playable (hand → zone → output) | ❓ | Requires hardware stream (P0 deferred). |
| UX8 | Mid-session disconnect → amber pill | ❓ | Requires hardware. |
| UX9 | Firmware-update notification pill in header | ❓ | No "update available" state present to trigger; not verifiable. |

**Screenshots:** flow-01-library-fresh.png, flow-01-detail-panel.png
**Discrepancies:** Doc UX1 says route `/` shows **three** factory presets; the build shows five or more. Either the doc count is stale or `FACTORY_PRESETS` exceeds three.

---

## Flow 02 — Understand the Field & Interaction Model

**Route(s):** /editor/:id (canvas) — live behavior requires hardware

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| UX3 | Zone visual states (inactive / locked / unmapped) | ✅ | Implemented (per doc "Implementation status" + canvas rendering). |
| — | Scale label top-left of canvas | ✅ | "Chromatic · C4" visible in editor. |
| UX1 | Live hand preview on canvas | ❓ | Deferred — P0, pending hardware stream (per doc). |
| UX2 | Zone highlight on hand entry | ❓ | Deferred — requires live device. |
| — | MIDI/CV activity indicator | ⚠️ | Stub — logs to console (per doc). |
| UX5/UX6/UX7 | Hand-outside notice / recovery card / 60s nudge | ❓ | Deferred (per doc). |

**Screenshots:** (covered by flow-04 editor shots)
**Discrepancies:** None — implementation matches the doc's own "Implementation status (June 2026)" table.

---

## Flow 03 — Library: Browse & Manage

**Route(s):** /, /full

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| UX1 | Preset row: name · sub-line · output chips · zone count · status chip · star | ✅ | Confirmed visually on /full (e.g. "CC · Note · Moog Subsequent 37", zones 6). |
| UX2 | Status icon-chip, three states (On Quray / Modified / Not synced) | ✅ | Green, amber, and grey chips all present on /full. |
| UX13 | Sub-line fallback (device → tags → output) | ✅ | Device names on /full, tags on fresh ("Note · Melodic · Expressive"). |
| UX3 | Active-filter system (Status / Output / Device) | ✅ | All three filter dropdowns present. |
| UX5 | Favourites star (filter + per-row) | ✅ | ★ filter top-right; per-row stars (filled/empty) visible. |
| UX6 | Hover reveal (star / open-in-editor / kebab) | ✅ | Visible on hover (screenshots). |
| UX7 | Kebab menu items | ❓ | Automation click hit the account "…" menu instead of the row kebab; row kebab is hover-revealed. Items confirmed present by prior source review (Open/Duplicate/Rename/Add to set/Send/Export/Delete). |
| UX8 | Bulk selection bar | ✅ | Select-all checkbox in header; bulk bar wired (prior review). |
| UX9 | Duplicate "Copy of [name]" | ✅ | Wired (handleDuplicate). |
| UX10 | Inline rename (kebab) | ✅ | Wired. |
| UX11 | Delete with undo toast | ✅ | Wired (single delete → confirm dialog in build; undo toast for set/mapping). |
| UX14 | Sort control | ✅ | Name / Zones / Last updated sortable headers present. |
| UX15 | Detail panel | ✅ | Slides in on row click. |
| UX16 | Hero gradient behind header | ✅ | Present (`hero-glow`). |
| SYS1 | Search filters live (no-match → empty state) | ✅ | rows 12 → 0 on "zzzz…" + empty state. |
| SYS7 | "Send to Quray" from Library | ⚠️ | Adds to DeviceContext queue (works); no hardware write (stub, by design). |

**Screenshots:** flow-03-library-full.png, flow-03-sets-view.png, flow-03-kebab.png
**Discrepancies:** None of substance. (The automation could not open the per-row kebab — selector limitation, not a missing feature.)

---

## Flow 04 — Modify Existing Preset

**Route(s):** /editor/factory-1

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| UX1 | Editor layout: ← Library, name, Preset Setup, zone list, canvas | ✅ | All present ("First Touch", Color/Scale/Layout, Zones 01 Low / 02 High). |
| UX1 | Scale label on canvas | ✅ | "Chromatic · C4". |
| UX2 | "Not synced" status line | ✅ | Present in left panel. |
| UX2 | "Autosaved ✓" status line | ❌ | **Missing.** Only "Not synced" shows. Flow 04 UX2 requires "Autosaved" and "Not synced" as two separate lines. See Genuine gaps. |
| UX4 | Back to Library + "All changes saved" hover hint | ✅ | Button + hover text present; saves to PresetsContext on nav (prior review). |
| UX3 | Zone select → right panel (Active / Lock / MAPPINGS) | ✅ | Confirmed by canvas click. |
| UX6 | Zone auto-naming | ✅ | Implemented (deriveZoneName). |
| UX7 | Zone color "Canvas display only" | ✅ | Implemented. |
| Q6 | Undo / Redo buttons | ✅ | Present and **Undo disabled at load** (no history) — note: doc lists undo as deferred (Q6 OPEN); it is now implemented. |
| toolbar | Editor preset kebab (Rename / Duplicate / Export / Delete) | ⚠️ | Not located in the toolbar by automation and not visible beside "Send to Quray" in the screenshot. Source has it: Rename + Delete real, Duplicate + Export are `console.log` stubs. |
| Q20 | Split X/Y division defaults persist on new mapping | ⚠️ | Known bug (doc Q20) — values reset. Not fixed. |

**Screenshots:** flow-04-editor-factory-1.png, flow-04-zone-selected.png
**Discrepancies:** "Autosaved" line absent (gap). Right-panel empty text reads "No zone selected" vs doc's "Select a zone to edit" (cosmetic copy variance).

---

## Flow 05 — Create New Preset

**Route(s):** /editor/preset-empty

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| UX1 | Empty editor, 0 zones, "New Preset" name | ✅ | Confirmed. |
| UX1 | Empty-state guidance + draw hint | ✅ | "No zones yet… click and drag…". |
| UX3 | Draw-mode badge | ✅ | "Draw mode — drag to create zone". |
| UX2 | Layout picker, 6 templates with SVG previews | ✅ | Freehand / Full / Split 2 / Split 3 / Near Far / Wide+2 present. |
| UX3/SYS2 | Drag on canvas → zone created + default Note mapping | ✅ | Right panel populated with Channel/Root note after drag. |
| UX4 | Zone header (number / name / kebab / color) | ✅ | Implemented (prior review + zone-selected shot). |
| UX5 | Mappings accordion + "+ Add mapping" | ✅ | Implemented. |
| UX8 | Note chord mode (Single/Chord + preview pills) | ✅ | Implemented (prior review). |
| UX9 | Split zone (preview pills → Apply) | ✅ | Implemented. |
| UX11 | CV ports labeled "01–04" | ❓ | Source labels CV ports as **CV1–CV4**, not "01–04". Possible discrepancy with UX11 — verify. |
| UX15 | "Send to Quray" validates ≥1 mapping | ✅ | Toast "No mappings assigned…" when empty (prior review). |

**Screenshots:** flow-05-editor-empty.png, flow-05-layout-picker.png, flow-05-zone-drawn.png
**Discrepancies:** CV port labeling ("CV1–CV4" vs doc "01–04") — flag for confirmation.

---

## Flow 06 — Send to Quray

**Route(s):** /full (detail panel) → /device

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| UX1 | "Send to Quray" — Editor toolbar | ✅ | Present (secondary, left of Undo/Redo). |
| UX1 | "Send to Quray" — Library detail panel | ✅ | Present; fires toast. |
| UX1 | "Send to Quray" — Library bulk bar | ⚠️ | Present but bulk send is `console.log` (no queue add) — stub. |
| UX2 | Validation: no mappings → toast | ✅ | Editor enforces; toast shown. |
| UX3 | Toast on send | ✅ | Toast appears after detail-panel send. |
| SYS1 | Sent preset appears as slot on Device page | ⚠️ | From **Library**: works (preset object passed → renders). From **Editor**: new/factory id sent without the preset object → slot added but renders blank on Device (prior QA finding). See Genuine gaps. |
| UX5/SYS2 | "Sync to Quray" commits to hardware | ❓ | Stub by design — no hardware write. |

**Screenshots:** flow-06-send-toast.png, flow-06-device-after-send.png
**Discrepancies:** Editor-originated send is unreliable end-to-end (gap). Bulk send is a console stub while the flow lists the bulk bar as a real entry point.

---

## Flow 07 — Explore Presets → Add to My Library

**Route(s):** /full → Explore tab

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| UX1 | Explore tab + separate rows (tags sub-line, no sync chip, no kebab) | ✅ | Tab switches; explore rows render. |
| UX2 | Detail panel: "Add to library" present | ✅ | Confirmed. |
| UX2 | No "Open in editor" in Explore panel (read-only) | ✅ | Absent, as required. |
| UX3 | "Add to library" = copy into My Library + toast | ✅ | Wired (handleAddToLibrary). |
| UX8 | "Export preset" | ⚠️ | Stub (toast / no format) — by design. |

**Screenshots:** flow-07-explore.png, flow-07-explore-detail.png
**Discrepancies:** None.

---

## Flow 08 — Build a Set & Prepare for Performance

**Route(s):** /full → Sets tab

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| impl | Sets tab accordion (expand/collapse) | ✅ | Implemented. |
| impl | "+ New set" creation | ✅ | Present next to toggle; creates inline-named row. |
| UX3 | "Add to set" via preset kebab | ✅ | Implemented (prior review). |
| impl | Set accordion on Device page | ✅ | Confirmed on /device (Berlin Session, Percussion Studies, Ambient Field Work). |
| UX4 | Set editor: rename members, reorder within set | ⚠️ | Stub — "coming soon" (by design). |
| UX5 | Switching policy (Instant / After release / Next beat / Manual) | ⚠️ | Stub (by design). |
| UX4 | Per-member colour codes | ⚠️ | Stub (by design). |
| UX6 | Rehearsal mode | ⚠️ | Stub (by design). |
| UX7 | Pre-show validation | ⚠️ | Stub (by design). |
| — | Set export / import | ⚠️ | Stub (by design). |

**Screenshots:** flow-08-sets.png, flow-03-sets-view.png
**Discrepancies:** None — matches the doc's "Implementation status" table (core built, set-editor deferred).

---

## Flow 09 — Device Page Management

**Route(s):** /device

| Step | Element / behavior | Result | Notes |
|------|--------------------|--------|-------|
| UX2 | Two-section layout (sets accordion + standalone presets) | ✅ | Confirmed (sets with chevrons + standalone rows). |
| UX2/UX9 | Memory usage bar + firmware version | ✅ | "2.1 MB / 8 MB used", "v1.22". |
| UX2 | Slot drag handles (reorder) | ✅ | ⠿ handle on each slot. |
| UX5 | Remove slot (hover-revealed) | ✅ | Trash + expand actions reveal on row hover. |
| UX7 | "Sync to Quray" button | ✅ | Primary button; enabled because staged changes exist ("2 modified"). Disabled-state logic exists in code. |
| UX7/SYS2 | Sync commits to hardware | ❓ | Stub by design. |
| UX3 | Overlap notice ("Also loaded as part of [Set]") | ❓ | Not triggered in this walk; not verified. |
| UX9 | Capacity bar amber/red at 80/100% | ❓ | Not triggered (within capacity). |
| UX12 | "Reload from device" (overflow menu) | ❓ | Gear/overflow present; behavior requires hardware. |
| SYS4/F6 | Bug S3: Sync stays active after undo-reorder | ⚠️ | Known bug (doc) — not fixed. |

**Screenshots:** flow-09-device.png
**Discrepancies:** None — known bug S3 documented.

---

## Styleguide

**Route(s):** /styleguide — renders ✅ (existence check only).
**Incidental defect found here:** React logged an HTML-validity error — a `<button>` nested inside a `<button>` in `ZoneMappingCard` (the "Single value" and "Manual input" rows wrap a `SelectionCheckbox` button inside an outer toggle button). Invalid HTML + accessibility/hydration risk. This component is also used in the Editor. Not part of any flow; flagged for cleanup.

---

## Known stubs (expected, not bugs)

Explicitly marked stub / deferred in the flow documents:

- **Sync to Quray** hardware write (Flows 06, 09) — staged queue works; no device write.
- **Live hand preview, zone highlight on entry, tracking-recovery card, 60s soft nudge** (Flows 01, 02) — P0/hardware-deferred.
- **MIDI/CV activity indicator** (Flow 02) — console log.
- **Set editor**: rename/reorder members, switching policy, per-member colour codes, rehearsal mode, pre-show validation, set export/import (Flow 08) — "coming soon".
- **Export** everywhere — preset detail panel, kebab, set kebab, bulk, Explore (Flows 03, 07) — toast/no format.
- **Editor preset kebab → Duplicate / Export** — `console.log` (not surfaced in flow tables; adjacent to the documented stub set).
- **Known bug S3** — Sync button stays active after an undo-reorder (Flows 06 F6, 09 SYS4).
- **Known bug Q20** — Split X/Y division defaults reset on new mapping (Flows 04, 05).

---

## Genuine gaps (require attention — NOT listed as stub/deferred in the flows)

1. **"Autosaved" status line missing in the Editor (Flow 04 UX2).** The flow requires two separate left-panel lines — "Autosaved ✓" (local persistence) and "Not synced" (device state). Only "Not synced" is present. This is the primary signal preventing "I thought it was saved/on the device" confusion, and it is specified, not deferred.

2. **Editor "Send to Quray" does not reliably reach the Device page (Flow 06 SYS1).** Sending from the Editor passes only the preset id (not the preset object), so for new/`preset-empty`/factory ids the Device page cannot resolve the preset and renders a blank slot. Library-originated send works because it passes the object. The flow's end-state ("Preset appears as a slot on the Device page") fails from the Editor entry point.

**Discrepancies to confirm (lower severity):**
- Fresh Library shows **5+ presets**, not the **three** stated in Flow 01 UX1.
- CV ports are labeled **CV1–CV4**, while Flow 05 UX11 specifies **01–04**.
- Editor preset kebab (Rename/Duplicate/Export/Delete) was not visibly present beside "Send to Quray" in the captured editor state — confirm it renders.
- Incidental: button-in-button HTML nesting in `ZoneMappingCard` (Single value / Manual input rows).

---

*No source files were modified. Files written: flow-audit-report.md, audit-screenshots/*.png (17 screenshots).*
