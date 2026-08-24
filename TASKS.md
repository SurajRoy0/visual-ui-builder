# AGENTS.md — Visual Website Builder: Development Guide

This file is the persistent source of truth for anyone (human or AI)
working on this codebase. It captures decisions already made so they
are not re-litigated or accidentally reversed, and lists the exact
remaining work to reach MVP.

**Rule for any AI session reading this file:** if a task conflicts
with something in Section 3 ("Established Architecture — Do Not
Re-Derive"), stop and flag the conflict instead of silently working
around it. These decisions were made deliberately, several after
finding and fixing real structural bugs — do not "helpfully" revert
them.

Items marked **VERIFY** below are assumptions based on partial file
sharing, not confirmed against the actual current code. Confirm
before relying on them.

---

## 1. Product Definition

A visual, drag-and-drop, framework-independent website builder. Users
build pages from HTML elements, style them responsively, create
reusable components, add interactions, author CSS and GSAP
animations, preview the result, and export either the raw project
JSON or a working React project as a ZIP.

The project **data model** stays framework-independent so additional
exporters (Next.js, React+Tailwind, etc.) can be added later as
separate exporter layers, without changing the schema.

---

## 2. Source of Truth

- `types/project.ts` — the frozen schema. **Version: 1.0.0.**
- The element rules registry (Phase 1, completed) — governs which
  tags can be inserted, valid parent/child relationships, void
  elements, and which attribute editors apply to which tag.

Both are load-bearing. Do not modify the frozen schema without
explicitly re-running the same fix-vs-defer analysis used to freeze
it (see Section 3.8) — most "quick fixes" to this schema are actually
migrations in disguise.

---

## 3. Established Architecture — Do Not Re-Derive

### 3.1 Store architecture

- `ProjectStore` is **one** Zustand store composed of slices:
  `DocumentSlice`, `ElementsSlice`, `AnimationSlice`, `ActionsSlice`,
  `ViewportSlice` — combined via `storeTypes.ts` / `projectStore.ts`.
- `ComponentsSlice` and `AssetsSlice` do **not exist yet** (see
  Section 7). Component and asset management are not implemented.
- `EditorStore` is a **separate**, independent store for transient
  UI/session state (selection, zoom, active breakpoint/viewport,
  grid, mode, timeline playhead). It is never persisted and never
  part of undo history.

**Rule:** never merge `EditorStore` state into `ProjectStore`, and
never give `ProjectStore` slices their own independent undo stacks.
There is exactly one document, one undo history, one transient state
store.

### 3.2 Undo/redo — patch-based, single shared history

- `DocumentSlice` owns `project`, `past`, `future`, and exposes
  `mutate(recipe)` and `batch(fn)`.
- History entries store Immer patches/inverse-patches, not full
  document snapshots.
- **Rule:** every slice action mutates project data exclusively
  through `get().mutate(recipe)`. Never call `set()` directly on
  project data from inside a slice — that bypasses undo entirely and
  will silently desync the history stack from the visible document.
- Use `batch(fn)` to group a multi-step operation (e.g. "delete this
  node and reindex its former siblings") into a single undo entry.
  One deliberate user action = one undo entry, always.

### 3.3 Tree mutation invariants

- `isDescendant(elements, nodeId, possibleDescendantId)` — **must**
  be checked before any reparent (`moveNode`) to prevent a node
  becoming its own ancestor.
- `isPageRoot(pages, nodeId)` — **must** be checked before deleting
  or reparenting a node, to prevent orphaning a page (a page whose
  `rootElementId` points at nothing).
- **CONFIRMED:** `elementsSlice.moveNode` calls `isDescendant` (rejects
  moving a node into its own descendant) and `isPageRoot` (rejects
  reparenting a page root); `removeNode`/`duplicateNode` also call
  `isPageRoot`. Verified by direct code read — the drag-and-drop
  reparent UI (Section 7/13, canvas-node drag-to-reorder) is built on
  top of this and additionally excludes the dragged node's own subtree
  from candidate drop targets at hover-time.

### 3.4 Style resolution precedence (computed at read time, never pre-baked into stored data)

For a plain element node, at render time:

```
base style
  → breakpointStyles[activeBreakpointId]
    → interactionStyles matching any active pseudo-state
      (rule applies if rule.breakpointId is undefined OR
       equals activeBreakpointId)
```

For a component instance's internal node, additionally layer on top:

```
... (definition-level resolution above, using the INTERNAL node)
  → instance.styleOverrides[internalNodeId]
    → instance.breakpointStyleOverrides[activeBreakpointId]?.[internalNodeId]
```

Instance-level overrides always win last — they represent "this
specific usage of the component," which is the most specific edit.

### 3.5 Animation model — two independent systems

- **CSS `@keyframes`** (`CSSKeyframeAnimation`): stored inline per
  node under `node.animation.cssKeyframeAnimations`.
- **GSAP timelines** (`GSAPTimeline`): stored globally in
  `project.gsapTimelines`, referenced by ID from
  `node.animation.gsapTimelineIds`. This is what lets one timeline
  coordinate multiple elements as tracks.
- **Rule:** `GSAPTimeline.trigger` supports **only** `"onLoad"` and
  `"onScroll"` — autonomous starts. Click/hover/other user-input
  starts go exclusively through the Action system (3.6). Do not add
  `onClick`/`onHover` back onto `GSAPTimeline.trigger` — that
  duplication was deliberately removed because it created two
  systems that could disagree about what starts a timeline.
- A keyframe (`GSAPKeyframe.properties`) stores only what changed at
  that point in time, not the full resolved style.

### 3.6 Action system

- `Action` = **what** happens (navigate, scrollTo, playTimeline,
  toggle, openModal, submitForm, ...) — stored globally in
  `project.actions`.
- `ActionBinding` = **when/where** it fires — stored on the node
  itself (`node.actions[]`), referencing an `Action` by ID via a
  trigger (`click`, `submit`, `change`, `mouseenter`, `mouseleave`).
- Kept as two steps deliberately so one `Action` config isn't
  duplicated if bound from multiple places.

### 3.7 Interaction styles & pseudo-elements — single source of truth

- `node.interactionStyles` (pseudo-*classes*: hover/focus/active/...)
  and `node.pseudoElements` (pseudo-*elements*: ::before/::after/...)
  live **only** on the node itself.
- **Rule:** never duplicate either of these inside
  `ElementAnimationConfig`. That duplication existed in an earlier
  draft of the schema and was deliberately removed — `animation`
  holds only `cssKeyframeAnimations` and `gsapTimelineIds`.

### 3.8 Deferred schema features — do not build around them

- **Component slots** (arbitrary child content inside a component
  instance) — not in the current schema.
- **Component variants** (grouped, conditional multi-node style/prop
  sets, à la CVA) — not in the current schema.

These were deliberately deferred because they're additive (they'll
add new fields/capabilities, not reinterpret existing data), unlike
the issues fixed before freezing v1.0.0, which were structural (would
have required a data migration if left for later). Do not hack
around their absence with workarounds baked into node data — when
they're needed, they get added as a schema revision.

### 3.9 Assets

- `assetId` on `src`-bearing attributes (`ImageAttributes`,
  `VideoAttributes`, `SourceAttributes`) links a node to
  `project.assets[assetId]`.
- This distinguishes an uploaded file (has `exportPath`, gets copied
  into the export ZIP) from a remote URL (left as-is at export time).
- **Status:** `AssetsSlice` does not exist yet — this linkage is
  schema-level only until the slice and upload UI are built.

### 3.10 Validation — two distinct systems, do not conflate

- **Load-time schema validation** (`isValidProject`/`migrateProject`
  pattern): "is this JSON actually a `Project` matching the current
  schema version" — runs on load/import.
- **Export-time referential validation** (Phase 24 below): "does
  every reference in *this specific* project actually resolve" —
  checks `componentId`, `assetId`, `timelineId`, `targetNodeId`,
  `rootElementId`, parent/child consistency, etc. Runs before ZIP
  generation and must fail with specific, actionable errors rather
  than producing a broken export silently.

These are separate functions with separate failure modes. Do not
build one as a stand-in for the other.

### 3.11 High-frequency interactions bypass the store

- Dragging, resizing, and timeline scrubbing must **not** call a
  store mutation per pointer-move/animation-frame.
- Pattern: update the DOM/visual layer directly during the gesture;
  commit exactly once (one `mutate()` call) when the gesture ends.
  This keeps one drag = one undo entry, and avoids Immer re-cloning
  the tree 60 times a second for a single conceptual edit.
- Local, per-node, high-frequency visual state (e.g. "is this node
  currently hovered, for interaction-style preview") belongs in local
  component state or a ref, never in `EditorStore` or `ProjectStore`.

### 3.12 Coding conventions

- IDs: always via `makeId(prefix)` (nanoid-backed). Never hand-roll
  an ID.
- Cross-cutting reads that span multiple records (e.g. "which
  timelines target this node") go in `selectors.ts` as a pure
  function + a thin hook wrapper (see `selectTimelinesForNode` /
  `useNodeTimelines`). Never inline this kind of derivation inside a
  slice's action list — slices are for mutations, selectors are for
  reads.
- Selector discipline in components: subscribe to the narrowest
  slice of state possible — `state.project.elements[nodeId]`, not
  `state.project.elements` or `state.project` as a whole. Zustand
  only re-renders on reference change, and Immer's structural sharing
  only keeps that cheap if selectors stay this granular.

---

## 4. Open Decisions & Confirmed Architecture

- ✅ **Persistence strategy (IMPLEMENTED):** Autosave to IndexedDB behind a `ProjectRepository` interface. Project Dashboard at `/editor`, Create Project modal, dynamic `/editor/[projectId]` routing, delete confirmation modal, and debounced autosave with unmount flush.
- ✅ **`isDescendant`/`isPageRoot` wiring status (CONFIRMED)** — see 3.3.
- ✅ **Canvas-to-store wiring status (CONFIRMED & IMPLEMENTED):** Canvas dynamically renders the live `project.elements` tree using recursive `ElementRenderer` with granular subscriptions, effective style resolution, interactive selection, and simulated viewport sizing.

---

## 5. Status Snapshot

### Completed
- ✅ Schema frozen at v1.0.0
- ✅ Element-to-HTML mapping + element rules registry (Phase 1)
- ✅ Editor UI shell (layers panel, canvas frame, property panel)
- ✅ `ProjectStore`: Document, Elements, Animation, Actions, Viewport slices
- ✅ `EditorStore` (transient state)
- ✅ Patch-based undo/redo core (`mutate`/`batch`/`undo`/`redo`) with Immer patches plugin
- ✅ Tree-safety helpers written (`isDescendant`, `isPageRoot`, `collectDescendantIds`)
- ✅ Persistence implementation (`ProjectRepository` + `IndexedDBProjectRepository`, debounced autosave, flush on unmount/unload, project switcher/creation modal, and project deletion with confirmation)
- ✅ Canvas Renderer wired to live `ProjectStore` data (Phase 2)
- ✅ Simulated Viewport CSS Units (`vh`, `vw`, `vmin`, `vmax` calculated against active simulated canvas dimensions) (Phase 2 / Phase 7)
- ✅ Selection & Element Tree (Layers Panel) (Phase 3)
- ✅ Drag & Drop from Elements Toolbox to Canvas with Live Indicators & Semantic Validation (Phase 4)
- ✅ Real-Time 8-Point Resize, Selection Overlay, Transient 60fps Previews & Keyboard Nudge (Phase 5)
- ✅ Viewport drag-to-resize handles & Custom Breakpoints (Phase 7)
- ✅ Responsive Editing: Breakpoint Overrides, Override Badges & Inheritance Reset (Phase 7)
- ✅ Project Styles & Design Tokens: Styles Slice, Styles Tab, Token Pickers & Canvas CSS Variables (Phase 8)

### Not Yet Started / Pending
- ⏳ `Phase 9` — Assets & Asset Library
- ⏳ `Phase 10` — Components (`ComponentsSlice`, definitions & instances)
- ⏳ `Phase 11` — Interactions & Micro-interactions
- ⏳ `Phase 12–27` — Full Timeline Animations, Export, CMS & Advanced Features

---

## 6. Remaining Phases to MVP

### Phase 2 — Canvas Renderer
**Status:** ✅ Completed

Render `Active Page → Page Root → Element Tree → HTML`, resolved
against the active page/breakpoint/viewport, using the precedence
order in Section 3.4. Viewport simulates a real browser (`vw`/`vh`
resolve against viewport dimensions, not the zoomed visual size or outer browser window).

```
Viewport = 1440 × 900, Zoom = 0.5
  → visual canvas renders at 720 × 450
  → CSS 100vh dynamically resolves to 900px, 95vh to 855px
  → CSS 100vw dynamically resolves to 1440px
```

### Phase 3 — Selection & Element Tree
**Status:** ✅ Completed

Layers panel: select, expand/collapse, rename, reorder, delete,
duplicate, move between valid parents (element rules registry gates
this), select from canvas or tree interchangeably. Selection stays
synchronized: `Canvas ↔ Element Tree ↔ Property Panel`.

### Phase 4 — Drag & Drop
**Status:** ✅ Completed

```
Library Element → Drag → Potential Parent → Validate (element rules
+ isDescendant guard) → Allowed? → Insert / Reject (visible feedback)
```

Blocks e.g. `<li>` outside a list, `<option>` outside
`<select>`/`<optgroup>`, children inside void elements, and any
reparent that would create a cycle. `computeDropResult` (pure — takes
pointer coords + pre-gathered candidate rects, no DOM access) and
`gatherDropContext` (the sole DOM-touching function, walks the
rendered viewport into plain-data rects) with live `inside`/`before`/`after`
visual indicators and atomic Immer `mutate`/`batch` history commits.
`draggedItem` accepts either an `ElementDefinitionItem` (toolbox
create) or a bare `HTMLTagName` (moving an existing node), and an
optional `excludeNodeIds` set lets a caller remove a subtree from
candidates — this is what Phase 5's existing-node drag reuses below.

### Phase 5 — Real-Time Move & Resize
**Status:** ✅ Completed

Follows Section 3.11 & 15 exactly: 8-directional interactive resize
handles (`nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`) with transient
60fps DOM preview bypassing `ProjectStore` during active gestures,
committing exactly one atomic `updateNodeStyle` on `pointerup`. Resize
respects the node's own `min/maxWidth/Height` style during the live
preview (not hardcoded 16px/4000px fallbacks), and dragging the
w/n/nw/ne/sw handles on an absolute/fixed-positioned node repositions
`left`/`top` from the dragged edge via `resizeMath`'s `leftDelta`/`topDelta`.
Includes live dimension tooltip badge, automatic ResizeObserver tracking,
and keyboard navigation/nudge (1px normal, 10px with Shift, Delete/Backspace,
and duplicate via `Cmd/Ctrl+D`).

Existing-canvas-node drag (reorder/reparent) is also implemented here
(`SelectionOverlay.tsx`'s selection-box body, distinct from the resize
handles) — hover-only preview via `gatherDropContext`/`computeDropResult`
(dragged node + its own descendants excluded from candidates), commits
exactly one `moveNode` call on drop, never touches the moved node's own
style. This was the architecture doc's "Existing Canvas Node Drag"
system (Section 7/13) — previously missing despite Phase 4 covering
only toolbox-create drag.

### Phase 6 — Property Panel
**Status:** ✅ Completed — Dimensions, Flexbox, Grid, Transform, Transition,
Typography, Appearance & Colors, Spacing, Attributes; all grouped to
match `ElementStyle`'s composition. Continuous inputs (text fields,
the native color picker, opacity slider, box-shadow sliders) commit on
blur/Enter/drag-release rather than on every keystroke/tick — verified
live: typing a 10-character HTML ID produces exactly one undo entry.

### Phase 7 — Responsive Editing
**Status:** ✅ Completed

Multi-device simulation with distinct Breakpoint vs. Viewport controls:
- **Base vs. Breakpoint Routing**: Desktop (`isDefault: true`) writes to `node.style`; Tablet/Mobile writes to `node.breakpointStyles[activeBreakpointId]`.
- **Property Inspector Responsive Context**: Header banner indicates active device/breakpoint with override counts.
- **Visual Inheritance & Override Indicators**: Amber/blue indicators on overridden properties with one-click "Reset override" (`removeBreakpointStyleProperty`) to restore inheritance from Desktop.
- **Breakpoint-Aware Canvas Interactions**: Canvas resize handles and keyboard arrow nudges automatically update the active breakpoint overrides without mutating Desktop base styles.
- **Simulated Viewport & Fluid Range**: Smooth drag handles on canvas edges with dynamic breakpoint tab matching and viewport sizing.
- **Viewport Unit Normalization**: Dynamic CSS unit resolution (`vh`, `vw`, `vmin`, `vmax`) against active simulated canvas dimensions + CSS variables `--vw`, `--vh` on simulated viewport wrapper.

### Phase 8 — Project Styles / Design Tokens
**Status:** ✅ Completed

Centralized design system engine under `project.styles`:
- **Styles Slice & Store Actions**: Full CRUD for colors, typography, spacing, radii, shadows, fonts, and custom variables (`stylesSlice.ts`).
- **Design Tokens Management Tab**: Comprehensive sidebar tab (`StylesTab.tsx`) to manage, edit, search, and reload curated default token presets.
- **Property Inspector Token Pickers**: Color palette swatch popovers, Typography preset selector, and Radius/Spacing token linkers in `SelectedElementInspector.tsx`. Typography presets write `var(--typography-[name]-*)` references (not a snapshot of the preset's current values), so editing a preset later keeps propagating to every node that applied it — same as color/radius tokens.
- **Live Canvas CSS Variable Cascade**: Automatic serialization and binding of all design tokens into `--color-*`, `--spacing-*`, `--radius-*`, `--shadow-*`, `--font-*`, `--typography-[name]-*` on the canvas viewport screen container (`generateTokenCssVars` in `styleUtils.ts` — the single source of truth; don't reimplement this inline elsewhere).
- **Delete-usage warning**: deleting a token first scans `project.elements` (`countElementsReferencingCssVar` in `selectors.ts`) for any node still referencing its CSS var, and confirms before deleting if usage > 0 — deleting an unused token still deletes immediately with no prompt.

### Phase 9 — Assets
**Status:** ⏳ — needs `AssetsSlice` first (Section 5)

Support image/video/audio/font/svg/file. Distinguish remote vs.
uploaded (Section 3.9). Uploaded assets need an `exportPath` for ZIP
placement (`assets/hero.webp`, etc.).

### Phase 10 — Components
**Status:** ⏳ — needs `ComponentsSlice` first (Section 5)

```
Select structure → Create Component → Expose properties →
Save Component → Insert ComponentInstanceNode into pages
```

Component inspection (`Page → Instance → Internal Node`) must not
copy internal nodes into the page tree — resolve them live from
`project.components[componentId]` (Section 3.4).

### Phase 11 — Component Properties
**Status:** ⏳

Primitive exposed props only: text, number, boolean, color, select,
image. **Do not** build slots or variants here (Section 3.8) — schema
doesn't support them yet.

### Phase 12 — CSS Interaction States
**Status:** ⏳

Hover/focus/active/visited/disabled/focus-visible/first-child/last-child,
optionally breakpoint-scoped (Section 3.4). Transient hover/focus
state stays local/visual (Section 3.11) — never pushed into the
document on every pointer event.

### Phase 13 — Pseudo-Elements
**Status:** ⏳

`::before`, `::after`, `::placeholder`, `::selection`, `::marker`,
`::first-letter`, `::first-line`, with `content` support where
relevant. Stored per Section 3.7.

### Phase 14 — Action System
**Status:** ⏳

Wire up UI for creating `Action`s and binding them via
`ActionBinding` (Section 3.6). Supported triggers: click, submit,
change, mouseenter, mouseleave.

### Phase 15 — CSS Animations
**Status:** ⏳

`@keyframes` authoring: 0% → 50% → 100% steps, each storing only
changed properties. Duration, timing function, delay, iteration
count, direction, fill mode, play state.

### Phase 16 — GSAP Timeline Editor
**Status:** ⏳

Video-editor-like UI. Persisted model stays `one element = one
track` (Section 3.5) even if the UI shows per-property sub-rows.

```
Timeline
 ├── Track → Element A → Keyframe, Keyframe
 ├── Track → Element B → Keyframe, Keyframe, Keyframe
 └── Track → Element C → Keyframe
```

### Phase 17 — Keyframe Authoring
**Status:** ⏳

```
Static design → Enable timeline → Move playhead → Change properties
→ Capture keyframe → repeat
```

Runtime/exporter derives actual GSAP tweens between stored keyframes.

### Phase 18 — Timeline Preview & Scrubbing
**Status:** ⏳

Play/pause/restart/scrub, current time, duration, keyframe selection.
Playhead movement follows Section 3.11 — no history entry per frame.

### Phase 19 — ScrollTrigger
**Status:** ⏳

Trigger node, start, end, scrub, pin, pin spacing, markers, toggle
actions. Timeline itself only supports `onLoad`/`onScroll` triggers
(Section 3.5) — click/hover-triggered playback goes through Actions.

### Phase 20 — Preview Mode
**Status:** ⏳

Same project data, no separate hidden representation:

```
Editor representation → same Project data → Preview runtime
```

Hides editor chrome, disables editing gestures, executes actions,
CSS animations, GSAP timelines, and ScrollTrigger for real.

### Phase 21 — Undo/Redo Hardening
**Status:** ⏳ (core exists — Section 5 — this phase is QA/edge-cases)

Confirm every entry point produces exactly one history entry per
deliberate user action, including multi-step operations (component
creation, multi-element move) via `batch()`.

### Phase 22 — JSON Export
**Status:** ⏳

Download the persistent `Project` document as-is. Framework-independent
by construction — must remain re-importable.

### Phase 23 — React ZIP Export
**Status:** ⏳

`Project → React project`: components, pages, HTML, CSS, responsive
rules, assets (via `exportPath`), CSS animations, GSAP + ScrollTrigger
setup, actions.

### Phase 24 — Export Validation
**Status:** ⏳

Referential integrity check (Section 3.10) before ZIP generation:
broken element/component/asset/action/timeline references, invalid
timeline target nodes, invalid page roots, invalid parent/child
relationships, invalid breakpoint/viewport config. Fail with specific
errors, not a silently broken export.

### Phase 25 — Performance Hardening
**Status:** ⏳

Enforce Section 3.11 (bypass pattern) and 3.12 (selector granularity)
codebase-wide. Audit for any component subscribing to `state.project`
or `state.elements` wholesale.

### Phase 26 — Editor UX Polish
**Status:** ⏳

Selection outlines, resize handles, drop indicators, invalid-drop
feedback, keyboard movement, snap/alignment guides, breadcrumbs,
timeline controls, empty/error states, tooltips, undo/redo feedback.

### Phase 27 — Final MVP Flow Confirmation
**Status:** ⏳

Full run-through: Create Project → Configure Page/Viewport/Breakpoint
→ Canvas → Elements → Style → Responsive → Project Styles → Assets →
Components → Interactions → CSS/GSAP Animation → Preview → Validate →
JSON Export → React ZIP Export, with no step relying on an
unconfirmed assumption from Section 4.

---

## 7. Post-MVP (explicitly out of scope for now)

- Component slots (Section 3.8)
- Component variants (Section 3.8)
- Additional exporters (Next.js, React+Tailwind, React+CSS Modules)
  as separate exporter layers — do not fold framework-specific
  concerns into the core schema
- Shared component libraries across projects
- Collaboration (multiplayer, comments, version history)