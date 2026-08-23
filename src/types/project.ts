// ============================================================
// types/editor.ts
//
// Visual React Component Builder — Project Data Model
//
// SCHEMA STATUS: FROZEN v1.0
//
// This file is the source of truth for how a project is
// represented. Build the editor (state management, canvas,
// property panel, exporter) against this shape.
//
// Deliberately deferred to a later schema revision:
//   - Component SLOTS (arbitrary child trees inside a
//     component instance, not just primitive prop swaps)
//   - Component VARIANTS (grouped, conditional style/prop
//     sets across multiple internal nodes, à la CVA)
// These are additive — they will add new fields/capabilities,
// not change how existing nodes are interpreted. Everything
// else below was fixed now specifically because it would have
// required a data migration if left for later.
//
// PROJECT
//   Persistent document. Saved / loaded / exported.
//
// EDITOR STATE
//   Transient UI/session state. Never persisted as part of
//   the project document.
//
// GSAP is a runtime/export target. The project stores
// animation INTENT, not GSAP instances.
// ============================================================

// ============================================================
// Primitive Types
// ============================================================

export type ID = string;

export type CSSValue = string | number;

export type CSSVarRef = `var(--${string})`;

// ============================================================
// HTML TAGS
// ============================================================

export type HTMLTagName =
  // Structure
  | "div"
  | "section"
  | "article"
  | "aside"
  | "header"
  | "footer"
  | "main"
  | "nav"
  | "figure"
  | "figcaption"

  // Text
  | "p"
  | "span"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "blockquote"
  | "pre"
  | "code"
  | "strong"
  | "em"
  | "small"
  | "mark"
  | "sub"
  | "sup"
  | "br"
  | "hr"

  // Lists
  | "ul"
  | "ol"
  | "li"
  | "dl"
  | "dt"
  | "dd"

  // Media
  | "a"
  | "img"
  | "video"
  | "audio"
  | "source"
  | "picture"
  | "iframe"
  | "canvas"
  | "svg"

  // Forms
  | "form"
  | "input"
  | "textarea"
  | "select"
  | "option"
  | "optgroup"
  | "button"
  | "label"
  | "fieldset"
  | "legend"

  // Tables
  | "table"
  | "thead"
  | "tbody"
  | "tfoot"
  | "tr"
  | "th"
  | "td"

  // Misc
  | "details"
  | "summary"
  | "dialog"
  | "progress"
  | "meter";

/**
 * Tags that hold literal text content.
 *
 * Used below to decide, per-tag, whether a node requires
 * a `content: string` field. This is what keeps a <div> from
 * being able to carry `content` and a <p> from being allowed
 * to omit it.
 */
export type TextTagName =
  | "p"
  | "span"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "strong"
  | "em";

// ============================================================
// HTML ATTRIBUTES
// ============================================================

export interface GlobalHTMLAttributes {
  id?: string;
  className?: string;
  title?: string;
  lang?: string;
  dir?:
  | "ltr"
  | "rtl"
  | "auto";
  tabIndex?: number;
  hidden?: boolean;
  draggable?: boolean;
  contentEditable?: boolean;
  spellCheck?: boolean;
  role?: string;

  // Accessibility
  ariaLabel?: string;
  ariaHidden?: boolean;
  ariaExpanded?: boolean;
  ariaDisabled?: boolean;
  ariaCurrent?: string;
  ariaControls?: string;
  ariaDescribedBy?: string;
  ariaLabelledBy?: string;

  // Data attributes
  dataAttributes?: Record<string, string>;
}

export interface AnchorAttributes {
  href?: string;
  target?:
  | "_self"
  | "_blank"
  | "_parent"
  | "_top";
  rel?: string;
  download?: string | boolean;
}

export interface ImageAttributes {
  src: string;
  alt: string;
  loading?:
  | "lazy"
  | "eager";
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;

  /**
   * Points at Project.assets[assetId] when this image is a
   * user-uploaded file rather than a remote URL. Lets the
   * exporter tell "copy this file into the zip" apart from
   * "leave this URL as-is".
   */
  assetId?: ID;
}

export interface ButtonAttributes {
  type?:
  | "button"
  | "submit"
  | "reset";
  disabled?: boolean;
  form?: string;
  name?: string;
  value?: string;
}

export interface InputAttributes {
  type?:
  | "text"
  | "email"
  | "password"
  | "number"
  | "tel"
  | "url"
  | "search"
  | "date"
  | "time"
  | "datetime-local"
  | "month"
  | "week"
  | "checkbox"
  | "radio"
  | "range"
  | "file"
  | "hidden"
  | "color";

  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  min?: number | string;
  max?: number | string;
  step?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
}

export interface TextareaAttributes {
  name?: string;
  placeholder?: string;
  value?: string;
  rows?: number;
  cols?: number;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  maxLength?: number;
}

export interface SelectAttributes {
  name?: string;
  required?: boolean;
  disabled?: boolean;
  multiple?: boolean;
  value?: string;
}

export interface OptionAttributes {
  value: string;
  selected?: boolean;
  disabled?: boolean;
}

export interface FormAttributes {
  action?: string;
  method?:
  | "get"
  | "post";
  encType?: string;
  noValidate?: boolean;
}

export interface LabelAttributes {
  htmlFor?: string;
}

export interface VideoAttributes {
  src?: string;
  poster?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  preload?:
  | "none"
  | "metadata"
  | "auto";
  width?: number;
  height?: number;
  assetId?: ID;
}

export interface AudioAttributes {
  src?: string;
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?:
  | "none"
  | "metadata"
  | "auto";
  assetId?: ID;
}

export interface SourceAttributes {
  src: string;
  type?: string;
  media?: string;
  srcSet?: string;
  assetId?: ID;
}

export interface IframeAttributes {
  src: string;
  title: string;
  allow?: string;
  allowFullScreen?: boolean;
  loading?:
  | "lazy"
  | "eager";
  sandbox?: string;
  width?: number;
  height?: number;
}

// ============================================================
// TAG → ATTRIBUTE MAP
//
// Tags not listed here fall through to
// `Record<string, unknown> & GlobalHTMLAttributes` in
// TagAttributes<T> below (e.g. div, span, ul, li — tags with
// no attributes beyond the global set).
// ============================================================

export interface TagAttributesMap {
  a: AnchorAttributes;
  img: ImageAttributes;
  button: ButtonAttributes;
  input: InputAttributes;
  textarea: TextareaAttributes;
  select: SelectAttributes;
  option: OptionAttributes;
  form: FormAttributes;
  label: LabelAttributes;
  video: VideoAttributes;
  audio: AudioAttributes;
  source: SourceAttributes;
  iframe: IframeAttributes;
}

/**
 * Resolves the correct attribute shape for a given tag.
 *
 * NOTE: this is a naked-type-parameter conditional, so it
 * distributes when called with a union (e.g.
 * TagAttributes<HTMLTagName> yields a union of every tag's
 * attribute shape). That distributive behavior is what
 * ElementNode below relies on to bind `tag` and `attributes`
 * together per-node instead of loosely as `Record<string, unknown>`.
 */
export type TagAttributes<T extends HTMLTagName> =
  T extends keyof TagAttributesMap
  ? TagAttributesMap[T] & GlobalHTMLAttributes
  : Record<string, unknown> & GlobalHTMLAttributes;

// ============================================================
// ATTRIBUTE SCHEMA
//
// Drives the property panel UI. Kept separate from
// TagAttributes<T> on purpose: TagAttributes<T> is the
// compile-time shape a node's `attributes` must satisfy;
// TagAttributeSchema is the runtime description the property
// panel reads to know which fields to render, in what order,
// with what editor widget, for a given tag.
// ============================================================

export type AttributeEditorType =
  | "text"
  | "number"
  | "boolean"
  | "select"
  | "url"
  | "color"
  | "asset";

export interface AttributeDefinition {
  name: string;
  type: AttributeEditorType;
  label?: string;
  required?: boolean;
  options?: Array<{
    label: string;
    value: string;
  }>;
  description?: string;
}

export type TagAttributeSchema = Partial<
  Record<HTMLTagName, AttributeDefinition[]>
>;

// ============================================================
// CSS — LAYOUT
// ============================================================

export interface LayoutCSS {
  display?:
  | "block"
  | "inline"
  | "inline-block"
  | "flex"
  | "inline-flex"
  | "grid"
  | "inline-grid"
  | "none"
  | "contents";

  position?:
  | "static"
  | "relative"
  | "absolute"
  | "fixed"
  | "sticky";
  top?: CSSValue;
  right?: CSSValue;
  bottom?: CSSValue;
  left?: CSSValue;
  inset?: CSSValue;
  width?: CSSValue;
  height?: CSSValue;
  minWidth?: CSSValue;
  maxWidth?: CSSValue;
  minHeight?: CSSValue;
  maxHeight?: CSSValue;
  boxSizing?:
  | "border-box"
  | "content-box";
  overflow?:
  | "visible"
  | "hidden"
  | "scroll"
  | "auto";
  overflowX?:
  | "visible"
  | "hidden"
  | "scroll"
  | "auto";
  overflowY?:
  | "visible"
  | "hidden"
  | "scroll"
  | "auto";
  zIndex?: number;
  aspectRatio?: CSSValue;
  visibility?:
  | "visible"
  | "hidden"
  | "collapse";
  cursor?: string;
  pointerEvents?:
  | "auto"
  | "none";
  isolation?:
  | "auto"
  | "isolate";
}

// ============================================================
// CSS — SPACING
// ============================================================

export interface SpacingCSS {
  margin?: CSSValue;
  marginTop?: CSSValue;
  marginRight?: CSSValue;
  marginBottom?: CSSValue;
  marginLeft?: CSSValue;
  padding?: CSSValue;
  paddingTop?: CSSValue;
  paddingRight?: CSSValue;
  paddingBottom?: CSSValue;
  paddingLeft?: CSSValue;
}

// ============================================================
// CSS — FLEX
// ============================================================

export interface FlexCSS {
  flex?: CSSValue;
  flexGrow?: number;
  flexShrink?: number;
  flexBasis?: CSSValue;
  flexDirection?:
  | "row"
  | "column"
  | "row-reverse"
  | "column-reverse";
  flexWrap?:
  | "nowrap"
  | "wrap"
  | "wrap-reverse";
  alignItems?:
  | "stretch"
  | "center"
  | "flex-start"
  | "flex-end"
  | "baseline";
  alignSelf?:
  | "auto"
  | "stretch"
  | "center"
  | "flex-start"
  | "flex-end"
  | "baseline";
  alignContent?:
  | "stretch"
  | "center"
  | "flex-start"
  | "flex-end"
  | "space-between"
  | "space-around";
  justifyContent?:
  | "flex-start"
  | "flex-end"
  | "center"
  | "space-between"
  | "space-around"
  | "space-evenly";
  justifyItems?:
  | "start"
  | "end"
  | "center"
  | "stretch";
  justifySelf?:
  | "auto"
  | "start"
  | "end"
  | "center"
  | "stretch";
  gap?: CSSValue;
  rowGap?: CSSValue;
  columnGap?: CSSValue;
  order?: number;
}

// ============================================================
// CSS — GRID
// ============================================================

export interface GridCSS {
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  gridTemplateAreas?: string;
  gridAutoFlow?:
  | "row"
  | "column"
  | "row dense"
  | "column dense";
  gridAutoRows?: string;
  gridAutoColumns?: string;
  gridColumn?: string;
  gridRow?: string;
  gridArea?: string;
  placeItems?: string;
  placeContent?: string;
}

// ============================================================
// CSS — TRANSFORM
// ============================================================

export interface TransformCSS {
  translateX?: CSSValue;
  translateY?: CSSValue;
  translateZ?: CSSValue;
  rotate?: CSSValue;
  rotateX?: CSSValue;
  rotateY?: CSSValue;
  rotateZ?: CSSValue;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  skewX?: CSSValue;
  skewY?: CSSValue;
  transformOrigin?: string;
  perspective?: CSSValue;
  backfaceVisibility?:
  | "visible"
  | "hidden";
  transformRaw?: string;
}

// ============================================================
// CSS — APPEARANCE
// ============================================================

export interface AppearanceCSS {
  background?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: string;
  backgroundPosition?: string;
  backgroundRepeat?: string;
  backgroundAttachment?:
  | "scroll"
  | "fixed"
  | "local";
  backgroundBlendMode?: string;
  border?: string;
  borderWidth?: CSSValue;
  borderStyle?:
  | "none"
  | "solid"
  | "dashed"
  | "dotted"
  | "double"
  | "groove"
  | "ridge";
  borderColor?: string;
  borderTop?: string;
  borderRight?: string;
  borderBottom?: string;
  borderLeft?: string;
  borderRadius?: CSSValue;
  borderTopLeftRadius?: CSSValue;
  borderTopRightRadius?: CSSValue;
  borderBottomRightRadius?: CSSValue;
  borderBottomLeftRadius?: CSSValue;
  boxShadow?: string;
  filter?: string;
  backdropFilter?: string;
  mixBlendMode?: string;
  opacity?: number;
  outline?: string;
  outlineOffset?: CSSValue;
  clipPath?: string;
  maskImage?: string;
  accentColor?: string;
  caretColor?: string;

  /**
   * Primarily meaningful on ::before / ::after
   * (see PseudoElementStyle.content).
   */
  content?: string;
  objectFit?:
  | "fill"
  | "contain"
  | "cover"
  | "none"
  | "scale-down";
  objectPosition?: string;
}

// ============================================================
// CSS — TYPOGRAPHY
// ============================================================

export interface TypographyCSS {
  fontFamily?: string;
  fontSize?: CSSValue;
  fontWeight?: string | number;
  fontStyle?:
  | "normal"
  | "italic"
  | "oblique";
  lineHeight?: CSSValue;
  letterSpacing?: CSSValue;
  wordSpacing?: CSSValue;
  textAlign?:
  | "left"
  | "center"
  | "right"
  | "justify"
  | "start"
  | "end";
  color?: string;
  textTransform?:
  | "none"
  | "capitalize"
  | "uppercase"
  | "lowercase";
  textDecoration?:
  | "none"
  | "underline"
  | "line-through"
  | "overline";
  textDecorationColor?: string;
  textDecorationStyle?:
  | "solid"
  | "double"
  | "dotted"
  | "dashed"
  | "wavy";
  textOverflow?:
  | "clip"
  | "ellipsis";
  whiteSpace?:
  | "normal"
  | "nowrap"
  | "pre"
  | "pre-wrap"
  | "pre-line";
  wordBreak?:
  | "normal"
  | "break-all"
  | "keep-all"
  | "break-word";
  textShadow?: string;
  textIndent?: CSSValue;
  verticalAlign?: string;
  writingMode?:
  | "horizontal-tb"
  | "vertical-rl"
  | "vertical-lr";
  webkitLineClamp?: number;
}

// ============================================================
// CSS — LIST
// ============================================================

export interface ListCSS {
  listStyleType?: string;
  listStylePosition?:
  | "inside"
  | "outside";
  listStyleImage?: string;
}

// ============================================================
// CSS — TABLE
// ============================================================

export interface TableCSS {
  borderCollapse?:
  | "collapse"
  | "separate";
  borderSpacing?: CSSValue;
  tableLayout?:
  | "auto"
  | "fixed";
}

// ============================================================
// CSS — TRANSITION
// ============================================================

export interface TransitionCSS {
  transitionProperty?: string;
  transitionDuration?: CSSValue;
  transitionTimingFunction?: string;
  transitionDelay?: CSSValue;
}

// ============================================================
// COMPLETE ELEMENT STYLE
// ============================================================

export type ElementStyle = LayoutCSS &
  SpacingCSS &
  FlexCSS &
  GridCSS &
  TransformCSS &
  AppearanceCSS &
  TypographyCSS &
  ListCSS &
  TableCSS &
  TransitionCSS & {
    /** CSS custom properties. */
    [customProperty: `--${string}`]: CSSValue | undefined;

    /** Escape hatch for CSS properties not explicitly modeled. */
    [unmodeledProperty: string]: CSSValue | undefined;
  };

// ============================================================
// PSEUDO CLASSES
// ============================================================

export type PseudoState =
  | "hover"
  | "focus"
  | "active"
  | "visited"
  | "disabled"
  | "focus-visible"
  | "first-child"
  | "last-child";

// ============================================================
// PSEUDO ELEMENTS
// ============================================================

export type PseudoElement =
  | "before"
  | "after"
  | "placeholder"
  | "selection"
  | "marker"
  | "first-letter"
  | "first-line";

export interface PseudoElementStyle {
  style: Partial<ElementStyle>;
  /** Used by ::before / ::after. */
  content?: string;
}

// ============================================================
// INTERACTION STYLES (CSS pseudo-class rules)
//
// FIXED (dedupe): this is the ONLY place interaction styles
// live. They previously also appeared nested inside
// ElementAnimationConfig — that was two sources of truth for
// one concept and has been removed. See ElementAnimationConfig
// below.
// ============================================================

export interface InteractionStyleRule {
  id: ID;
  state: PseudoState;
  /** undefined = applies at every breakpoint. */
  breakpointId?: ID;
  style: Partial<ElementStyle>;
  transition?: {
    duration: CSSValue;
    easing: string;
    delay?: CSSValue;
    properties?: string[];
  };
}

// ============================================================
// ANIMATION — GSAP
// ============================================================

export type GSAPEase =
  | "none"
  | "power1.in"
  | "power1.out"
  | "power1.inOut"
  | "power2.in"
  | "power2.out"
  | "power2.inOut"
  | "power3.in"
  | "power3.out"
  | "power3.inOut"
  | "power4.in"
  | "power4.out"
  | "power4.inOut"
  | "back.in"
  | "back.out"
  | "back.inOut"
  | "elastic.in"
  | "elastic.out"
  | "elastic.inOut"
  | "bounce.in"
  | "bounce.out"
  | "bounce.inOut"
  | "circ.in"
  | "circ.out"
  | "circ.inOut"
  | "expo.in"
  | "expo.out"
  | "expo.inOut"
  | "sine.in"
  | "sine.out"
  | "sine.inOut"
  | (string & {});

/**
 * FIXED (trigger split): a timeline no longer knows how to
 * start itself for user-input events. Only autonomous starts
 * — page load and scroll position — are properties of the
 * timeline. Click/hover/etc. starts are expressed exclusively
 * through Action + ActionBinding (see ACTION SYSTEM below),
 * so there is exactly one path per trigger category instead
 * of two systems that could disagree about who starts what.
 */
export type GSAPTimelineTrigger =
  | "onLoad"
  | "onScroll";

// ============================================================
// GSAP KEYFRAME
//
// Represents only what changed at a point in time, not the
// full resolved style. Matches how a user thinks about it
// ("at 1s I moved this and changed its color"), not how
// GSAP's own tween API is shaped.
// ============================================================

export interface GSAPKeyframe {
  id: ID;
  time: number;
  properties: Partial<ElementStyle>;
  /** Easing from this keyframe toward the next keyframe. */
  ease?: GSAPEase;
}

// ============================================================
// GSAP ELEMENT TRACK
//
// One element = one track. The UI may render per-property
// sub-rows, but the persisted model stays element-centric.
// ============================================================

export interface GSAPElementTrack {
  id: ID;
  targetNodeId: ID;
  keyframes: GSAPKeyframe[];
  stagger?: number;
}

// ============================================================
// GSAP SCROLL TRIGGER
// ============================================================

export interface ScrollTriggerConfig {
  triggerNodeId?: ID;
  start: string;
  end?: string;
  scrub?: boolean | number;
  pin?: boolean;
  pinSpacing?: boolean;
  markers?: boolean;
  toggleActions?: string;
}

// ============================================================
// GSAP TIMELINE
// ============================================================

export interface GSAPTimeline {
  id: ID;
  name: string;
  trigger: GSAPTimelineTrigger;
  /** Required when trigger === "onScroll". */
  scrollTrigger?: ScrollTriggerConfig;
  tracks: GSAPElementTrack[];
  repeat?: number;
  yoyo?: boolean;
  delay?: number;
  labels?: Record<string, number>;
}

// ============================================================
// CSS KEYFRAMES
// ============================================================

export interface CSSKeyframeStep {
  id: ID;
  /** 0–100. */
  offsetPercent: number;
  style: Partial<ElementStyle>;
}

export interface CSSKeyframeAnimation {
  id: ID;
  name: string;
  steps: CSSKeyframeStep[];
  duration: CSSValue;
  timingFunction: string;
  delay?: CSSValue;
  iterationCount?: number | "infinite";
  direction?:
  | "normal"
  | "reverse"
  | "alternate"
  | "alternate-reverse";
  fillMode?:
  | "none"
  | "forwards"
  | "backwards"
  | "both";
  playState?:
  | "running"
  | "paused";
}

// ============================================================
// ELEMENT ANIMATION CONFIG
//
// FIXED (dedupe & single source of truth):
// - ElementAnimationConfig holds ONLY element-scoped CSS @keyframes.
// - GSAP timelines live globally on Project.gsapTimelines, where
//   GSAPTimeline.tracks[].targetNodeId is the single source of truth.
//   Reverse lookups are computed dynamically via derived selectors.
// ============================================================

export interface ElementAnimationConfig {
  cssKeyframeAnimations?: CSSKeyframeAnimation[];
}

// ============================================================
// ACTION SYSTEM
//
// The single mechanism for "when X happens, do Y" — covers
// both animation starts (playTimeline/pauseTimeline/
// restartTimeline) and non-animation behavior (navigate,
// toggle, modal, form submit) through one binding shape.
// ============================================================

export type ActionTrigger =
  | "click"
  | "submit"
  | "change"
  | "mouseenter"
  | "mouseleave";

export interface ActionBinding {
  id: ID;
  trigger: ActionTrigger;
  actionId: ID;
}

export interface NavigateActionConfig {
  url: string;
  target?:
  | "_self"
  | "_blank";
  replace?: boolean;
}

export interface ScrollToActionConfig {
  targetNodeId: ID;
  behavior?:
  | "auto"
  | "smooth";
  offset?: number;
}

export interface TimelineActionConfig {
  timelineId: ID;
}

export interface ToggleActionConfig {
  targetNodeId: ID;
  property: string;
  value?: unknown;
}

export interface ModalActionConfig {
  targetNodeId: ID;
}

export interface SubmitFormActionConfig {
  formNodeId: ID;
}

export interface ActionConfigMap {
  navigate: NavigateActionConfig;
  scrollTo: ScrollToActionConfig;
  playTimeline: TimelineActionConfig;
  pauseTimeline: TimelineActionConfig;
  restartTimeline: TimelineActionConfig;
  toggle: ToggleActionConfig;
  openModal: ModalActionConfig;
  closeModal: ModalActionConfig;
  submitForm: SubmitFormActionConfig;
}

export type ActionType = keyof ActionConfigMap;

export type Action = {
  [K in ActionType]: {
    id: ID;
    type: K;
    config: ActionConfigMap[K];
  };
}[ActionType];

// ============================================================
// ELEMENT NODES
//
// FIXED (#1 — tag/attribute binding): ElementNode is built as
// a distributive mapped type over HTMLTagName, so each concrete
// node's `tag` and `attributes` are correlated by TypeScript
// itself — an <img> node's `attributes` is ImageAttributes, a
// <div> node's is the generic fallback, and a <p>/<span>/etc.
// node is required to carry `content: string` while a <div>
// node is not allowed to.
//
// This is deliberately a discriminated UNION, not a single
// interface with a generic default — a generic default would
// have looked correct but silently collapsed `attributes` back
// into a loose union with no per-node correlation, which is the
// mistake being fixed here.
// ============================================================

interface ElementNodeBase<T extends HTMLTagName> {
  id: ID;
  type: "element";
  name: string;
  parentId: ID | null;
  children: ID[];
  tag: T;

  /**
   * HTML attributes. Compile-time shape is bound to `tag` via
   * TagAttributes<T>. TagAttributeSchema (above) separately
   * drives what the property panel renders.
   */
  attributes: TagAttributes<T>;
  style: ElementStyle;

  /** breakpointId → style overrides. */
  breakpointStyles: Record<ID, Partial<ElementStyle>>;

  /** CSS pseudo-class rules. Single source of truth — see note above ElementAnimationConfig. */
  interactionStyles?: InteractionStyleRule[];

  /** CSS pseudo-elements. Single source of truth — see note above ElementAnimationConfig. */
  pseudoElements?: Partial<Record<PseudoElement, PseudoElementStyle>>;

  /** GSAP timeline references + CSS @keyframes only. */
  animation?: ElementAnimationConfig;

  /** User interactions (click/submit/change/hover → Action). */
  actions?: ActionBinding[];
}

type ElementNodeFor<T extends HTMLTagName> = T extends TextTagName
  ? ElementNodeBase<T> & { content: string }
  : ElementNodeBase<T> & { content?: never };

/**
 * Distributes over every tag so the union carries per-tag
 * correlation of tag ↔ attributes ↔ content requirement.
 */
export type ElementNode = {
  [K in HTMLTagName]: ElementNodeFor<K>;
}[HTMLTagName];

// ============================================================
// COMPONENT LIBRARIES
// ============================================================

export type ComponentLibrarySource =
  | "system"
  | "project";

export interface ComponentLibrary {
  id: ID;
  name: string;
  source: ComponentLibrarySource;
  isSharedAcrossProjects?: boolean;
  description?: string;
  icon?: string;
}

// ============================================================
// COMPONENT PROPERTIES
//
// NOTE: this is intentionally limited to primitive prop swaps
// on a single internal node. Arbitrary child content (slots)
// and grouped multi-node style sets (variants) are the two
// deliberately deferred items noted at the top of this file.
// ============================================================

export type ComponentPropertyType =
  | "text"
  | "number"
  | "boolean"
  | "color"
  | "select"
  | "image";

export interface ComponentProperty {
  id: ID;
  name: string;
  type: ComponentPropertyType;
  /** Internal component node that receives this property. */
  targetNodeId: ID;
  /** Property on the target node, e.g. "content", "color". */
  targetProp: string;
  defaultValue?: unknown;
  options?: Array<{
    label: string;
    value: string;
  }>;
}

// ============================================================
// COMPONENT DEFINITION
// ============================================================

export interface ComponentDefinition {
  id: ID;
  name: string;
  libraryId: ID;
  rootElementId: ID;
  /** Internal component tree. */
  elements: Record<ID, TreeNode>;
  properties: ComponentProperty[];
  thumbnail?: string;
  tags?: string[];
}

// ============================================================
// COMPONENT INSTANCE
// ============================================================

export interface ComponentInstanceNode {
  id: ID;
  type: "component-instance";
  name: string;
  parentId: ID | null;
  /**
   * Component internals belong to ComponentDefinition — they
   * are not duplicated into the page tree.
   */
  children: [];
  componentId: ID;
  /** Values supplied to exposed component properties. */
  props: Record<string, unknown>;
  /** internalNodeId → style overrides, scoped to this instance. */
  styleOverrides?: Record<ID, Partial<ElementStyle>>;
  /** breakpointId → internalNodeId → style overrides. */
  breakpointStyleOverrides?: Record<ID, Record<ID, Partial<ElementStyle>>>;
  /** internalNodeId → animation config overrides. */
  animationOverrides?: Record<ID, ElementAnimationConfig>;
}

// ============================================================
// TREE
// ============================================================

export type TreeNode = ElementNode | ComponentInstanceNode;

// ============================================================
// COMPONENT INSPECTION
//
// Transient editor state, not part of Project. Lets the
// editor drill Page → Instance → internal node without
// copying the component's internals into the page document.
// ============================================================

export interface ComponentInspectionContext {
  instanceId: ID;
  componentId: ID;
  internalNodeId: ID;
}

// ============================================================
// BREAKPOINT
//
// A responsive rule threshold, NOT a browser viewport. Only
// minWidth is persisted — the effective max width is derived
// from the next breakpoint up.
// ============================================================

export interface Breakpoint {
  id: ID;
  name: string;
  minWidth: number;
  isDefault?: boolean;
}

// ============================================================
// VIEWPORT
//
// The simulated browser viewport that CSS viewport units
// (vw/vh) resolve against inside the editor canvas. Distinct
// from Breakpoint on purpose — the canvas can be showing a
// 1024px-wide viewport while the "tablet" breakpoint's rules
// (which might kick in at 768px) are the ones active.
// ============================================================

export interface Viewport {
  id: ID;
  name: string;
  width: number;
  height: number;
  isDefault?: boolean;
}

// ============================================================
// PAGE
// ============================================================

export interface PageConfig {
  id: ID;
  name: string;
  path: string;
  rootElementId: ID;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}

// ============================================================
// DESIGN SYSTEM
// ============================================================

export interface FontToken {
  family: string;
  fallback?: string;
  weights?: number[];
}

export interface TypographyToken {
  fontFamily?: string;
  fontSize?: CSSValue;
  fontWeight?: string | number;
  lineHeight?: CSSValue;
  letterSpacing?: CSSValue;
}

export interface ProjectStyles {
  colors: Record<string, string>;
  typography: Record<string, TypographyToken>;
  spacing: Record<string, CSSValue>;
  radii: Record<string, CSSValue>;
  shadows: Record<string, string>;
  fonts: Record<string, FontToken>;
  /** Project-wide CSS variables. */
  variables: Record<string, CSSValue>;
}

// ============================================================
// ASSETS
// ============================================================

export type AssetType =
  | "image"
  | "video"
  | "audio"
  | "font"
  | "svg"
  | "file";

export interface Asset {
  id: ID;
  name: string;
  type: AssetType;
  mimeType: string;
  originalName?: string;
  /** Set when the asset is externally hosted rather than uploaded. */
  url?: string;
  /** Path used during zip export, e.g. "assets/hero.webp". */
  exportPath?: string;
  width?: number;
  height?: number;
  duration?: number;
  size?: number;
}

// ============================================================
// EDITOR STATE
//
// Transient. Never part of the persisted Project document.
// ============================================================

export interface EditorState {
  selectedNodeId: ID | null;
  inspectedComponentInstanceId: ID | null;
  inspectedComponentNodeId: ID | null;
  activePageId: ID;
  activeBreakpointId: ID;
  activeViewportId: ID;

  /**
   * Visual zoom only — does NOT change the simulated viewport
   * dimensions. viewport 1440×900 at zoom 0.5 renders as a
   * 720×450 visual canvas, but CSS still resolves against
   * 1440×900.
   */
  zoom: number;
  grid: {
    visible: boolean;
    snap: boolean;
    size: number;
  };
  mode:
  | "edit"
  | "preview";
  activeTimelineId: ID | null;
  playheadSeconds: number;
}

// ============================================================
// PROJECT
//
// The persistent document: saved, loaded, exported, and
// converted into React + CSS/GSAP at export time.
// ============================================================

export interface Project {
  id: ID;
  name: string;
  description?: string;
  createdAt?: number;
  updatedAt?: number;
  /** Schema version. Bump on any future breaking change. */
  version: string;
  styles: ProjectStyles;
  /** Page-level tree. */
  elements: Record<ID, TreeNode>;
  pages: Record<ID, PageConfig>;
  components: Record<ID, ComponentDefinition>;
  componentLibraries: Record<ID, ComponentLibrary>;
  gsapTimelines: Record<ID, GSAPTimeline>;
  actions: Record<ID, Action>;
  assets: Record<ID, Asset>;
  breakpoints: Breakpoint[];
  viewports: Viewport[];
}

// ============================================================
// REPOSITORY INTERFACES
// ============================================================

export interface ProjectSummary {
  id: ID;
  name: string;
  description?: string;
  updatedAt: number;
  createdAt?: number;
  thumbnail?: string;
}

export interface ProjectRepository {
  listProjects(): Promise<ProjectSummary[]>;
  createProject(details: { name: string; description?: string }): Promise<Project>;
  loadProject(id: ID): Promise<Project | null>;
  saveProject(project: Project): Promise<void>;
  deleteProject(id: ID): Promise<void>;
}

