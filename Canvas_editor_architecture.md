# Visual Editor UI & Canvas Interaction Architecture

## Vision

The editor should let users visually create React components that would otherwise require writing HTML/CSS manually.

The first implementation should focus on one component at a time. Pages and larger compositions can be built later by combining reusable components.

Current MVP elements:

- Box
- Text

The architecture must allow more elements to be added later without redesigning the canvas interaction model.

---

# 1. Core Architecture

```text
Elements Panel
      ↓
Drag / Drop
      ↓
Canvas Document Tree
      ↓
Selection + Manipulation
      ↓
Realtime DOM Preview
      ↓
Commit to ProjectStore
```

Two stores have different responsibilities:

```text
ProjectStore
├── Persistent document
├── Elements
├── Pages
├── Components
├── Breakpoints
├── Viewports
├── Actions
├── GSAP timelines
├── Assets
└── Undo / Redo

EditorStore
├── Selection
├── Active page
├── Active breakpoint
├── Active viewport
├── Zoom
├── Grid
├── Editor mode
├── Active timeline
└── Playhead
```

High-frequency interaction state such as dragging, resizing, pointer positions, and scrubbing should not continuously mutate ProjectStore.

Use refs/local transient state/requestAnimationFrame/direct DOM or GSAP runtime updates during active interactions, then commit the final document change once.

---

# 2. Elements Panel

The Elements panel is a **toolbox**, not the project's element tree.

For the MVP:

```text
ELEMENTS

┌─────────────────────┐
│ + Box               │
│   □                 │
├─────────────────────┤
│ + Text              │
│   T                 │
└─────────────────────┘
```

Later:

```text
Layout
├── Box
├── Container
├── Section
└── Grid

Typography
├── Text
├── Heading
├── Paragraph
└── Button

Media
├── Image
├── Video
└── ...
```

A toolbox item is not an `ElementNode`.

Conceptually:

```text
ElementDefinition
├── type
├── label
├── icon
└── metadata
```

When dropped, it creates an actual `ElementNode` in the project.

---

# 3. Canvas

The canvas represents the website being edited and is constrained by the active viewport.

Example:

```text
Viewport = 1440 × 900
Zoom = 75%
```

The document remains:

```text
1440 × 900
```

while it is visually displayed at:

```text
1080 × 675
```

Zoom changes the visual representation, not the document dimensions.

---

# 4. Viewport vs Editor

The editor itself is not the website viewport.

```text
Browser / Editor
┌──────────────────────────────────────────────┐
│ Editor UI                                    │
│                                              │
│       ┌─────────────────────────────┐        │
│       │       Website Viewport      │        │
│       │       1440 × 900            │        │
│       └─────────────────────────────┘        │
│                                              │
└──────────────────────────────────────────────┘
```

CSS viewport units must resolve against the simulated website viewport.

For:

```css
height: 100vh;
```

with:

```text
Viewport = 1440 × 900
```

`100vh` should resolve to approximately `900px`, not the editor browser height.

Likewise `100vw` resolves against the simulated viewport width.

---

# 5. Drop Model

When an element is dragged from the Elements panel into the canvas, calculate a semantic drop result:

```text
DropResult

parentId
index
mode
```

Conceptual modes:

```text
inside
before
after
```

Example:

```text
Container
├── Heading
├── Button
└── Image
```

Dropping between Heading and Button:

```text
Container
├── Heading
├── Box
├── Button
└── Image
```

The result is:

```text
parentId = Container
index = position between Heading and Button
```

Do not rely only on absolute x/y coordinates to determine the document tree.

---

# 6. Semantic Tree First

The visual editor should preserve meaningful HTML/CSS structure.

Do not convert every drag into:

```css
left: 437px;
top: 193px;
```

If a container uses:

```css
display: flex;
flex-direction: row;
```

movement should generally use the layout model:

```text
order
gap
margin
align
justify
```

Absolute positioning should be used when the element's actual configuration is:

```css
position: absolute;
```

The editor must distinguish:

1. Tree reordering
2. Layout manipulation
3. Absolute positioning

---

# 7. Moving Existing Elements

There are two different operations.

## A. Reordering / Reparenting

```text
Container
├── A
├── B
└── C
```

Move B after C:

```text
Container
├── A
├── C
└── B
```

This is a document-tree operation.

Conceptually:

```text
moveNode({
    nodeId: B,
    newParentId: Container,
    index: 2
})
```

## B. Visual Positioning

If an element is configured for direct positioning, dragging can change its position.

For example:

```text
position: absolute
```

may update:

```text
left
top
```

These are style mutations, not tree mutations.

---

# 8. Selection Overlay

The actual website DOM should remain clean.

Selection UI should be a separate editor overlay:

```text
Canvas DOM
     +
Selection Overlay
```

The overlay can contain:

- Selection border
- Resize handles
- Drag indicators
- Measurement labels
- Drop indicators

Example:

```text
┌──────────────────────────────┐
│   ┌──────────────────────┐   │
│   │        TEXT          │   │
│   └──────────────────────┘   │
│      ●                  ●     │
└──────────────────────────────┘
```

The overlay must never be exported.

---

# 9. Realtime Dragging

Do not continuously update ProjectStore during pointer movement.

Avoid:

```text
pointermove
    ↓
Zustand
    ↓
Immer
    ↓
Project update
    ↓
React render
```

Preferred:

```text
pointerdown
    ↓
Capture initial state
    ↓
pointermove
    ↓
Transient refs / interaction state
    ↓
DOM or GSAP runtime update
    ↓
60fps visual feedback
    ↓
pointerup
    ↓
Calculate final value
    ↓
ProjectStore mutation
    ↓
ONE undo entry
```

A drag gesture should normally produce one logical undo operation.

---

# 10. Resize

Resize follows the same pattern:

```text
pointerdown on resize handle
        ↓
capture initial bounds
        ↓
pointermove
        ↓
calculate new bounds
        ↓
transient DOM update
        ↓
pointerup
        ↓
commit final width/height
        ↓
ProjectStore
        ↓
one history entry
```

The resize system must respect:

- Canvas zoom
- Active viewport
- Element positioning mode
- Existing styles
- Parent layout
- Minimum/maximum constraints
- Breakpoint-specific styles

---

# 11. Coordinate System

Create one centralized coordinate conversion system.

There are multiple coordinate spaces:

```text
Screen coordinates
        ↓
Editor coordinates
        ↓
Canvas coordinates
        ↓
Document / viewport coordinates
```

Example:

```text
Viewport width = 1440px
Zoom = 0.75
```

Visible canvas width:

```text
1440 × 0.75 = 1080px
```

Pointer calculations must convert screen coordinates back into document coordinates.

Do not scatter calculations such as `clientX / zoom` throughout components.

The coordinate abstraction should account for:

- Editor position
- Canvas offset
- Zoom
- Viewport size
- Scroll position
- Nested transforms where applicable

---

# 12. Drop Indicator

During drag/drop, always show where the element will be inserted.

Example:

```text
Container
├── Heading
├── ─────────────────
└── Button
```

For a container drop:

```text
┌───────────────────────────┐
│                           │
│       DROP INSIDE         │
│                           │
└───────────────────────────┘
```

The drop indicator is editor UI only and must not be exported.

---

# 13. Three Different Drag Systems

Do not combine these into one generic behavior.

### Toolbox Drag

```text
Elements Panel
      ↓
Canvas
```

Meaning:

```text
CREATE
```

### Existing Canvas Node Drag

```text
Existing Node
      ↓
Another location
```

Meaning:

```text
MOVE / REORDER / REPARENT
```

### Resize Handle Drag

```text
Resize Handle
      ↓
Pointer
```

Meaning:

```text
RESIZE
```

They can share low-level pointer utilities but should have separate interaction logic.

---

# 14. Effective Style

The canvas renderer should resolve the actual style to display:

```text
Base Style
    ↓
Breakpoint Style
    ↓
Interaction/Pseudo State
    ↓
Animation Runtime
    ↓
Rendered DOM
```

Animation runtime should remain separate from static effective-style resolution.

---

# 15. High-Frequency State Rule

Do not put every interaction value into Zustand.

Use ProjectStore for persistent document changes.

Use EditorStore for low-frequency editor/session state.

Use refs/local transient state for high-frequency interaction values.

Examples that should generally remain transient:

- Pointer coordinates during drag
- Pointer coordinates during resize
- Active hover tracking
- Drag preview
- Resize preview
- Selection rectangle during multi-select
- Timeline scrubbing frame-by-frame
- Animation preview values

Only commit the final meaningful document state to ProjectStore.

---

# 16. Timeline Compatibility

The same interaction architecture must work for the future timeline.

Timeline scrubbing:

```text
pointermove
    ↓
ref / requestAnimationFrame
    ↓
GSAP preview
    ↓
no ProjectStore mutation
```

On release:

```text
final playhead / keyframe value
    ↓
ProjectStore
    ↓
history
```

The canvas interaction system must remain independent from the timeline.

The timeline becomes another runtime that can control the canvas.

---

# 17. Recommended Rendering Architecture

```text
Editor
│
├── ElementsPanel
│
├── CanvasArea
│   │
│   ├── CanvasViewport
│   │   │
│   │   ├── CanvasDocument
│   │   │   └── ElementRenderer
│   │   │
│   │   └── EditorOverlay
│   │       ├── SelectionOverlay
│   │       ├── ResizeHandles
│   │       └── DropIndicator
│   │
│   └── CanvasControls
│
└── PropertyPanel
```

The website document and editor controls remain conceptually separate.

---

# 18. Project Lifecycle & Persistence

This sits logically **before** the interaction phases below — there is no
canvas to drag into until a project has been created or loaded.

## 18.1 Storage decision

**Autosave to IndexedDB.** Not localStorage — IndexedDB has no practical
size ceiling (localStorage caps around 5MB, which a real project with
several components and animation timelines can approach) and can later
store asset Blobs directly, which matters once file uploads exist.

## 18.2 Repository abstraction — do not call IndexedDB from components

Define one interface and code the rest of the app against it. This is
what makes "swap for a real backend later" a one-file change instead of
an app-wide search-and-replace:

```ts
interface ProjectSummary {
  id: ID;
  name: string;
  updatedAt: number;
  thumbnail?: string;
}

interface ProjectRepository {
  listProjects(): Promise<ProjectSummary[]>;
  createProject(details: { name: string; description?: string }): Promise<Project>;
  loadProject(id: ID): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: ID): Promise<void>;
}
```

`IndexedDBProjectRepository` implements this now. `ApiProjectRepository`
implements the same interface against a real backend later. Nothing in
`ProjectStore`, the home page, or the create-new modal should import
IndexedDB APIs directly — they only ever talk to `ProjectRepository`.

**Best practice:** resist the urge to optimize the summary list (e.g. a
separate lightweight "summaries" object store) before it's needed. For
an MVP-scale number of projects, `listProjects()` reading each full
record and projecting `{id, name, updatedAt}` is fine. Optimize when a
real user has enough projects for it to matter, not preemptively.

## 18.3 Home page flow

```text
Home Page
    ↓
repository.listProjects()
    ↓
Render project cards (name, last updated)
    ↓
"Create New" button
```

## 18.4 Create New flow

```text
Click "Create New"
    ↓
Modal: collect basic details (name required; description optional)
    ↓
Submit
    ↓
repository.createProject({ name, description })
  → internally: createInitialProject() + assign real id + persist immediately
    ↓
Redirect to /editor/[projectId]
```

**Best practice:** persist the newly created project immediately on
creation (don't wait for the first autosave tick) — if the user closes
the tab in the first second on the editor route, the project they just
named should still exist on the home page when they come back.

## 18.5 Loading a project into the editor

```text
Editor route /editor/[projectId] mounts
    ↓
repository.loadProject(projectId)
    ↓
useProjectStore.setState({ project: loaded, past: [], future: [] })
    ↓
Canvas renders from the loaded document
```

**Rule:** always reset `past`/`future` to empty on load. Undo history is
a record of *this session's* edits, not something that should let a user
"undo" past what was already saved from a previous session.

## 18.6 Autosave

```text
ProjectStore.project changes
    ↓
Debounce (settle window ~500-1000ms)
    ↓
repository.saveProject(project)
```

**Best practices:**

- Subscribe specifically to `state.project` reference changes, not the
  whole store — `EditorStore` changes (selection, zoom, playhead
  scrubbing) must never trigger a save. This is the same discipline as
  selector granularity elsewhere (Section 15), applied to persistence.
- Debounce, don't save on every `mutate()` call — a drag commit, a
  property-panel keystroke-commit, and a keyframe add happening in
  quick succession should collapse into one write, not three.
- Flush any pending debounced save on route change / `beforeunload` —
  otherwise a user who edits and immediately navigates away can lose
  the last few hundred milliseconds of work.
- Keep save status (`idle | saving | saved | error`) as ephemeral UI
  state (a ref or a tiny non-persisted store field), not part of
  `Project` or its undo history — it's exactly the kind of transient,
  non-document value Section 15's rule already covers.
- Single-tab is an acceptable MVP assumption. Multi-tab conflict
  resolution and real backend sync/merge are explicitly out of scope
  until the real-backend swap happens — don't build speculative
  conflict-resolution logic against IndexedDB now.

---

# 19. Implementation Phases

## Phase 0 — Project Lifecycle

**Goal:** A user can land on a home page, see existing projects, create a
new one, and land in the editor with autosave running.

**Best Practices:**

- Build `IndexedDBProjectRepository` behind the `ProjectRepository`
  interface from Section 18.2 from day one, even though there's only
  one implementation right now — retrofitting the abstraction after
  UI code has called IndexedDB directly is much more error-prone than
  starting with it.
- Keep the create-new modal's fields minimal (name, optional
  description) — every additional required field is friction between
  "I want to start a project" and actually starting one.
- Wire autosave (18.6) before building Phase 1 — every later phase's
  acceptance criteria implicitly assume "and it survives a refresh,"
  which is only true once this phase exists.

Tasks:

- Define `Project Repository` interface and IndexedDB implementation
- Home page: list projects, "Create New" entry point
- Create New modal → `createProject` → redirect to `/editor/[id]`
- Load project on editor mount, reset undo history
- Autosave subscription with debounce + flush-on-navigate
- Ephemeral save-status indicator

Acceptance:

Creating a project, refreshing the browser, and returning to the home
page shows the project with its current (not initial) content.

---

## Phase 1 — Elements Toolbox

**Goal:** Create the Elements panel with only Box and Text.

**Best Practices:**

- Model each toolbox entry as data (`ElementDefinition: { type, label,
  icon, defaultStyle? }`) in one array, not one hardcoded component per
  element — adding a third element later should mean adding one array
  entry, not touching drag logic.
- The drag payload should carry only the `ElementDefinition`'s type/id
  — never a pre-built `ElementNode`. The *only* place that decides what
  a freshly-created Box actually looks like is the `addElementNode`
  store action (informed by the element rules registry), so there is
  one source of truth for "what is a default Box," not one in the
  toolbox and another in the store.

Tasks:

- Create toolbox item definitions
- Render Box
- Render Text
- Make items draggable
- Define toolbox-to-canvas drag interface
- Do not implement complex layout logic yet

Acceptance:

- Box and Text are visible
- Both can start a drag

---

## Phase 2 — Canvas Drop

**Goal:** Drop Box/Text into the canvas and create actual ElementNodes.

**Best Practices:**

- Write drop-target resolution as a pure function —
  `computeDropResult(pointerPosition, candidateRects): DropResult` —
  completely separate from the pointer-event plumbing that calls it.
  Pure functions over DOM rects are unit-testable without simulating
  real drag events; the event plumbing around them usually isn't worth
  testing directly.
- Validate against the element rules registry (valid parent/child,
  void elements) *before* calling `addElementNode`, so an invalid drop
  is rejected visually — never insert-then-validate-then-undo.
- `addElementNode` is already one atomic `mutate()` call — one drop is
  one undo entry, with no extra work needed here.
- Select the newly created node immediately after creation so the
  property panel is populated without a second user action.

Tasks:

- Create canvas drop zone
- Detect valid drop target
- Calculate `parentId`
- Calculate insertion index
- Support inside/before/after
- Create ElementNode through ProjectStore
- Select newly created node

Acceptance:

Dragging Box into the canvas creates a Box node in the correct location.

---

## Phase 3 — Document Tree Rendering

**Goal:** Render Project.elements as an actual nested canvas.

**Best Practices:**

- One `ElementRenderer` component that dispatches by node
  type/tag — not a growing pile of `if (tag === "div") ... else if
  ...`.
- Each renderer subscribes to its **own** node via `useNode(nodeId)` /
  `useEffectiveStyle(nodeId)` — never receive the whole `elements`
  record as a prop. This is what keeps editing one node from
  re-rendering unrelated siblings (Section 15's principle, applied to
  render, not just to store writes).
- A renderer looks up its own children IDs and renders them
  recursively — it should never need to know about anything outside
  its own node's data.
- Guard against a corrupted tree at render time too (max depth check,
  or a visited-set during recursion) even though `isDescendant` should
  prevent cycles at write time — a rendering-layer crash from a bad
  document is worse than a rendering-layer warning.

Tasks:

- Start from active page root
- Recursively render children
- Create ElementRenderer
- Render Box
- Render Text
- Resolve effective styles
- Respect active breakpoint
- Respect active viewport

Acceptance:

Canvas visually represents the same tree stored in `Project.elements`.

---

## Phase 4 — Selection System

**Goal:** Click any canvas element and select it.

**Best Practices:**

- Compute selection bounds from the actual rendered DOM
  (`getBoundingClientRect`), not derived from style values — flex
  growth, auto margins, and text wrapping all affect final layout in
  ways a style object alone can't predict.
- Recompute the overlay's position on scroll, resize, and zoom change
  via `ResizeObserver` + a scroll listener — not only when selection
  changes. A stale overlay after the user scrolls is a common and
  jarring bug.
- The overlay is a separate absolutely-positioned layer, `pointer-
  events: none` by default, with `pointer-events: auto` only on the
  actual handles — it must never intercept clicks meant for the
  underlying canvas document.

Tasks:

- Click-to-select
- Store `selectedNodeId` in EditorStore
- Render selection overlay
- Calculate element bounds
- Keep overlay aligned with zoom
- Support deselection
- Keep editor overlay out of exported output

Acceptance:

Clicking an element produces an accurate selection rectangle.

---

## Phase 5 — Canvas Coordinate System

**Goal:** Create a single coordinate conversion layer.

**Best Practices:**

- Write it as one module of pure functions (`screenToCanvas`,
  `canvasToDocument`, etc.), each taking zoom/offset/scroll as
  explicit parameters — no function should reach into the DOM or the
  store itself. This is what makes the whole module testable with
  plain numbers instead of a real browser.
- Cache the canvas's bounding rect and scroll offset in a ref, updated
  via `ResizeObserver`/scroll listener — don't call
  `getBoundingClientRect()` fresh on every single pointermove.

Tasks:

- Screen → editor coordinates
- Editor → canvas coordinates
- Canvas → document coordinates
- Handle zoom
- Handle viewport size
- Handle canvas offset
- Handle scrolling
- Expose reusable coordinate helpers

Acceptance:

Pointer calculations remain correct at different zoom levels and viewport sizes.

---

## Phase 6 — Realtime Element Movement

**Goal:** Allow appropriate elements to move smoothly.

**Best Practices:**

- Use the Pointer Events API with `setPointerCapture` — the drag
  continues receiving events even if the pointer moves outside the
  element's bounds mid-gesture.
- Move the *visual* element via `transform: translate()` during the
  gesture — compositor-only, no layout reflow — and only write real
  `left`/`top` (or a flex `order` change) at commit time.
- The commit is exactly one `updateNodeStyle`/`moveNode` call
  (Section 9/15) — never called mid-drag, only once on pointerup.
- If the node is in flex/grid flow (not `position: absolute`), prefer
  computing an `order`/index change over silently converting it to
  absolute positioning (Section 6's semantic-tree rule) — the user
  didn't ask for their layout model to change just because they
  dragged something.

Tasks:

- Pointer down
- Capture initial position
- Pointer move
- Update visual position without ProjectStore
- Use requestAnimationFrame where useful
- Pointer up
- Calculate final document value
- Commit one ProjectStore mutation
- Ensure one undo entry per drag

Acceptance:

Dragging feels smooth and Undo reverses the complete drag as one operation.

---

## Phase 7 — Resize

**Goal:** Resize selected elements.

**Best Practices:**

- Clamp to min/max constraints *during* the visual preview, not only
  at commit — a handle that visually allows an impossible size and
  then snaps back on release feels broken even if the final value is
  correct.
- Convert pointer delta to document-space delta through the Section 5
  coordinate module (`delta / zoom`) — never inline that division at
  the call site.
- Resize math must respect whichever box model is actually in effect
  (`border-box` vs `content-box`) for that node — "width" means a
  different thing depending on which one is set.

Tasks:

- Add resize handles
- Detect handle direction
- Calculate width/height changes
- Respect zoom
- Respect viewport coordinates
- Respect min/max constraints
- Preview without ProjectStore
- Commit once on pointerup
- Create one history entry

Acceptance:

Resize feels smooth and Undo reverses the complete resize.

---

## Phase 8 — Tree Reordering and Reparenting

**Goal:** Move existing nodes through the document tree.

**Best Practices:**

- Run `isDescendant` on every candidate drop target *while hovering*,
  not only at commit — grey out or otherwise visually reject invalid
  targets, don't let the user complete an invalid drop and find out
  afterward.
- During hover, only show a drop indicator (Section 12) — never
  actually move the node in the tree until drop. Hover-time tree
  mutation makes cancel-by-dragging-away hard to get right and
  produces spurious intermediate undo-relevant states if done wrong.
- Reparenting is a structural change only — it must never touch the
  node's own `style`/`breakpointStyles`. If a reparent visually
  "resets" a node's appearance, that's a bug in the move logic, not an
  acceptable side effect.

Tasks:

- Drag existing node
- Detect candidate parent
- Detect before/after/inside
- Display drop indicator
- Prevent dropping into descendants
- Prevent invalid parent relationships
- Call moveNode on release
- Preserve node styles

Acceptance:

Users can reorder and reparent elements without corrupting the tree.

---

## Phase 9 — Layout-Aware Movement

**Goal:** Make movement behave like CSS rather than a drawing application.

**Best Practices:**

- Decide reorder-vs-free-position with one small pure function —
  `resolveMovementMode(parentStyle, nodeStyle)` — rather than deciding
  ad hoc inside the pointer handler. A pure decision function is
  testable and keeps the rule consistent everywhere it's needed.
- Never silently inject `position: absolute` onto a node the user
  didn't explicitly set that way — that would change the exported CSS
  in a way the user never asked for, and would be very confusing to
  discover only at export time.

Tasks:

- Detect parent display mode
- Handle flex children correctly
- Avoid automatically converting normal layout into absolute positioning
- Support ordering/reordering
- Support margin/gap/alignment manipulation where appropriate
- Handle absolute positioning separately

Acceptance:

Generated structure remains clean and exportable React/CSS.

---

## Phase 10 — Responsive Canvas

**Goal:** Make viewport and breakpoint editing reliable.

**Best Practices:**

- Switching `activeViewportId` must immediately invalidate/recompute
  the Section 5 coordinate cache (zoom, offset). "Resize works fine
  until you change viewport, then breaks" is one of the most common
  bugs in this kind of editor, and it's almost always a stale
  coordinate cache.
- Test drop/selection/resize math at three actual viewport sizes
  (desktop/tablet/mobile), not just desktop, before calling this phase
  done — coordinate bugs at non-default viewports are easy to miss if
  you only ever test at 1440×900.

Tasks:

- Add viewport selector
- Add viewport size controls
- Switch `activeViewportId`
- Switch `activeBreakpointId`
- Render viewport dimensions correctly
- Resolve `vh`/`vw` against simulated viewport
- Apply breakpoint styles
- Verify selection and drag coordinates across viewport sizes

Acceptance:

The same component can be edited at desktop/tablet/mobile viewport sizes without coordinate bugs.

---

## Phase 11 — Property Editing

**Goal:** Connect the right-side property panel to the canvas.

**Best Practices:**

- Property inputs commit deliberately, not on every keystroke/drag
  tick: text fields commit on blur/Enter, sliders and color pickers
  batch/throttle their commits. A color picker drag alone can fire
  dozens of raw value changes a second — this is the exact same
  high-frequency rule as canvas dragging (Section 15), just triggered
  by a different kind of gesture.
- Group inputs by the same categories as `ElementStyle`'s own
  composition (Layout/Spacing/Flex/Grid/Transform/Appearance/
  Typography/Transition) so the panel's structure mirrors the schema
  instead of drifting from it over time.

Tasks:

- Width
- Height
- Display
- Position
- Margin
- Padding
- Background
- Border
- Border radius
- Typography for Text
- Breakpoint overrides
- Undo/redo integration

Acceptance:

Property changes update the canvas and create meaningful history entries.

---

## Phase 12 — Animation Runtime

**Goal:** Add animation only after the canvas interaction system is stable.

**Best Practices:**

- Keep the animation preview runtime (CSS class toggles / a live GSAP
  timeline instance) entirely separate from the static effective-style
  pipeline (Section 14). Animation should override the resolved style
  directly at the DOM level — GSAP setting inline styles/transforms
  itself — not by round-tripping preview frames through ProjectStore.
- Scrubbing writes only to a local ref or an EditorStore playhead
  value (Section 15). A keyframe's actual stored `time`/`properties`
  changes only when the user explicitly captures or edits that
  keyframe — never once per scrub frame.

Tasks:

- CSS animation preview
- GSAP timeline preview
- Timeline playhead
- Timeline scrubbing
- Animation runtime layer
- Avoid ProjectStore updates on every animation frame
- Commit keyframe edits deliberately

Acceptance:

Animation preview runs at interactive frame rates without polluting document history.

---

# 20. MVP Milestone

Before building complex animation features, these must work:

```text
Home Page
      ↓
Create / Open Project
      ↓
Elements Panel
      ↓
Drag Box/Text
      ↓
Canvas
      ↓
Create ElementNode
      ↓
Select
      ↓
Property Panel
      ↓
Style update
      ↓
Drag
      ↓
Realtime movement
      ↓
Resize
      ↓
Reorder
      ↓
Undo / Redo
      ↓
Responsive viewport
      ↓
Autosave verified
```

Only after this foundation is stable should the animation timeline become a primary implementation target.

---

# 21. Core Design Rule

> The canvas is a visual representation of the Project document, not the Project document itself.

During interaction, the canvas may temporarily display a preview that differs from the persisted Project state.

On completion of an interaction, the final state is committed back to ProjectStore.

This gives the editor:

- Smooth interaction
- Clean document state
- Correct undo/redo
- Clean React export
- Responsive editing
- A foundation for GSAP animation
- A foundation for reusable components

---

# 22. Keyboard Shortcuts (Planned — Final Phase)

Build this **after** every phase above is stable, per the project's own
sequencing (this is explicitly a late-stage, polish-level phase, not a
Phase-1 concern). Shipping shortcuts before the underlying actions
(move, delete, undo) are reliable just means debugging two things at
once.

## 22.1 Best Practices

- **One central keymap registry** — a single table mapping action name
  → key combination → handler — not `onKeyDown` handlers scattered
  across components. This is what makes conflicts visible (two actions
  fighting for the same combo shows up in one place) and makes the
  keymap remappable later without an app-wide search.
- **Abstract Cmd vs Ctrl once**, at the registry level, keyed off
  platform detection — individual actions should never re-implement
  "Mac uses Cmd, everyone else uses Ctrl."
- **Guard against hijacking normal typing.** While a text input or
  `contentEditable` element has focus, only an explicit allowlist of
  shortcuts should fire (e.g. `Escape` to blur). Without this guard,
  something like unscoped `Backspace → delete selected node` will also
  fire while a user is typing in the property panel's text field and
  delete their selected element out from under them.
- **Undo/redo shortcuts must route through the exact same `undo()`/
  `redo()` used elsewhere** (Section 3.2 of the store guide) — never a
  parallel keyboard-only implementation.
- Nudge-by-arrow-key movements (already anticipated in Section 15 as a
  transient-then-commit interaction) should commit as a single history
  entry per keypress, consistent with pointer-drag commits — holding an
  arrow key down should probably batch (Section 3.2's `batch()`) into
  one entry per continuous hold, not one entry per repeat event.

## 22.2 Planned Shortcuts

| Category   | Shortcut                          | Action                          |
|------------|------------------------------------|----------------------------------|
| Selection  | `Esc`                              | Deselect                        |
| Selection  | `Tab` / `Shift+Tab`                 | Select next / previous sibling  |
| Movement   | `Arrow keys`                       | Nudge selected node (1px)       |
| Movement   | `Shift + Arrow`                     | Nudge selected node (10px)      |
| Editing    | `Delete` / `Backspace`              | Delete selected node            |
| Editing    | `Cmd/Ctrl + D`                      | Duplicate selected node         |
| Editing    | `Cmd/Ctrl + C` / `Cmd/Ctrl + V`      | Copy / paste node subtree       |
| History    | `Cmd/Ctrl + Z`                      | Undo                             |
| History    | `Cmd/Ctrl + Shift + Z`              | Redo                             |
| View       | `Cmd/Ctrl + =` / `Cmd/Ctrl + -`      | Zoom in / out                    |
| View       | `Cmd/Ctrl + 0`                      | Reset zoom                       |
| Mode       | (TBD)                               | Toggle Preview mode              |
| Timeline   | `Space`                             | Play / pause (once timeline exists) |
| Timeline   | `Left` / `Right` arrow              | Scrub one frame (timeline focus only) |

This list is a starting point, not final — expect it to grow as
components/animation phases surface actions worth binding.