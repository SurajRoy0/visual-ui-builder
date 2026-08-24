"use client";

import React, { useState } from "react";
import {
  Maximize2,
  Layout,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Search,
  RotateCcw,
  Smartphone,
  Tablet,
  Laptop,
  Monitor,
  Sparkles,
  Sparkle,
  Tag,
  SlidersHorizontal,
  Italic,
  Underline,
  Strikethrough,
  Video,
  Volume2,
  FileCode,
  Square,
  Circle,
  Link as LinkIcon,
  Grid3x3,
  Move3d,
  Timer,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitInput } from "@/components/ui/unit-input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useEditorStore } from "@/store/editor/editorStore";
import { useProjectStore } from "@/store/project/projectStore";
import { DEFAULT_PROJECT_STYLES } from "@/store/project/createInitialProject";
import { isPageRoot } from "@/store/project/utils";
import { isDefaultBreakpoint as computeIsDefaultBreakpoint, resolveActiveBreakpoint } from "@/store/project/selectors";
import { resolveColorValue } from "@/lib/styleUtils";
import { FontFamilyPicker } from "./controls/FontFamilyPicker";
import { BoxShadowControl } from "./controls/BoxShadowControl";
import type { ElementNode, ElementStyle, TypographyToken } from "@/types/project";

/**
 * Native color-swatch picker. React's onChange maps to the native `input`
 * event, which fires continuously while the OS picker is open — so raw
 * changes stay local and only commit on blur (the picker closing).
 */
function ColorSwatchInput({
  displayHex,
  fallbackHex,
  onCommit,
}: {
  displayHex: string;
  fallbackHex: string;
  onCommit: (hex: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const swatchColor = draft ?? displayHex;
  const inputValue = (draft ?? (displayHex.startsWith("#") ? displayHex : fallbackHex));

  return (
    <div className="relative size-8 rounded border border-border shrink-0 overflow-hidden shadow-xs">
      <input
        type="color"
        value={inputValue}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (draft !== null) {
            onCommit(draft);
            setDraft(null);
          }
        }}
        className="absolute inset-0 size-full opacity-0 cursor-pointer z-10"
      />
      <div className="size-full transition-colors" style={{ backgroundColor: swatchColor }} />
    </div>
  );
}

/** Hex/token text field paired with a color swatch — commits on blur/Enter. */
function ColorHexInput({
  rawVal,
  fallbackHex,
  onCommit,
}: {
  rawVal: string;
  fallbackHex: string;
  onCommit: (val: string) => void;
}) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null) {
      onCommit(draft);
      setDraft(null);
    }
  };

  return (
    <Input
      value={draft ?? rawVal}
      placeholder={fallbackHex}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          commit();
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          setDraft(null);
          e.currentTarget.blur();
        }
      }}
      className="h-8 text-xs font-mono font-medium flex-1 rounded-md"
    />
  );
}

/** Text `<Input>` that commits on blur/Enter instead of every keystroke. */
function DeferredInput({
  value,
  onCommit,
  onKeyDown,
  ...rest
}: {
  value: string;
  onCommit: (val: string) => void;
} & Omit<React.ComponentProps<"input">, "value" | "onChange" | "onBlur">) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null) {
      onCommit(draft);
      setDraft(null);
    }
  };

  return (
    <Input
      {...rest}
      value={draft ?? value}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "Enter") {
          commit();
          e.currentTarget.blur();
        } else if (e.key === "Escape") {
          setDraft(null);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

/** Multi-line `<Textarea>` that commits on blur (Enter inserts a newline as usual). */
function DeferredTextarea({
  value,
  onCommit,
  onKeyDown,
  ...rest
}: {
  value: string;
  onCommit: (val: string) => void;
} & Omit<React.ComponentProps<"textarea">, "value" | "onChange" | "onBlur">) {
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null) {
      onCommit(draft);
      setDraft(null);
    }
  };

  return (
    <Textarea
      {...rest}
      value={draft ?? value}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        onKeyDown?.(e);
        if (e.defaultPrevented) return;
        if (e.key === "Escape") {
          setDraft(null);
          e.currentTarget.blur();
        }
      }}
    />
  );
}

export const SelectedElementInspector: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  // Live-preview-only draft for the opacity slider — commits to the store
  // on release/blur, not on every drag tick (Section 15 high-frequency rule).
  const [opacityDraft, setOpacityDraft] = useState<number | null>(null);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const activeBreakpointId = useEditorStore((state) => state.activeBreakpointId);
  const activePageId = useEditorStore((state) => state.activePageId);

  // 1. Resolve Active Page + Root
  const activePage = useProjectStore((state) => {
    if (activePageId && state.project.pages[activePageId]) {
      return state.project.pages[activePageId];
    }
    return Object.values(state.project.pages)[0];
  });
  const activeRootId = activePage?.rootElementId || "root";
  const targetNodeId = selectedNodeId || activeRootId;

  // 2. Resolve Selected Node
  const selectedNode = useProjectStore((state) => state.project.elements[targetNodeId]);

  // 3. Resolve Active Breakpoint
  const activeBreakpoint = useProjectStore((state) =>
    resolveActiveBreakpoint(state.project.breakpoints, activeBreakpointId)
  );

  const projectStyles = useProjectStore((state) => state.project.styles) || DEFAULT_PROJECT_STYLES;
  
  // Store action creators
  const updateNodeStyle = useProjectStore((state) => state.updateNodeStyle);
  const updateBreakpointStyle = useProjectStore((state) => state.updateBreakpointStyle);
  const removeBreakpointStyleProperty = useProjectStore((state) => state.removeBreakpointStyleProperty);
  const clearBreakpointOverrides = useProjectStore((state) => state.clearBreakpointOverrides);
  const updateTextContent = useProjectStore((state) => state.updateTextContent);
  const updateNodeAttributes = useProjectStore((state) => state.updateNodeAttributes);

  const q = searchQuery.toLowerCase().trim();

  const matchesFilter = React.useCallback((...keywords: string[]) => {
    if (!q) return true;
    return keywords.some((kw) => kw.toLowerCase().includes(q));
  }, [q]);

  const elementOpt = selectedNode as ElementNode | undefined;
  // Effective style resolution (base + active breakpoint override)
  const baseStyle = elementOpt?.style || {};
  const currentBreakpointOverrides = (elementOpt?.breakpointStyles?.[activeBreakpointId] || {}) as Partial<ElementStyle>;
  
  const effectiveStyle = React.useMemo(() => {
    return { ...baseStyle, ...currentBreakpointOverrides };
  }, [baseStyle, currentBreakpointOverrides]);

  if (!selectedNode || selectedNode.type !== "element") {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="size-16 rounded-full bg-secondary/50 flex items-center justify-center border border-border/50">
          <Sparkle className="size-8 text-muted-foreground/50" />
        </div>
        <div className="space-y-1">
          <h3 className="font-medium text-sm text-foreground">No Element Selected</h3>
          <p className="text-xs text-muted-foreground max-w-[200px]">
            Select an element on the canvas or page tree to inspect and edit its styles.
          </p>
        </div>
      </div>
    );
  }

  const element = selectedNode as ElementNode;
  const isRoot = targetNodeId === activeRootId;
  const elementName = isRoot ? "Page Root" : (element.name || element.tag || "Element");
  const elementTag = element.tag || "div";

  const isDefaultBreakpoint = computeIsDefaultBreakpoint(activeBreakpoint);

  const attributes = (element.attributes || {}) as Record<string, unknown>;
  const textContent =
    (element as unknown as { content?: string }).content ??
    (attributes?.textContent as string) ??
    (element.children.length === 0 ? element.name : "");

  const isTextElement = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "blockquote", "strong", "em", "small"].includes(
    elementTag
  );
  const isButtonElement = elementTag === "button";
  const isImageElement = elementTag === "img";
  const isLinkElement = elementTag === "a";
  const isVideoElement = elementTag === "video";
  const isAudioElement = elementTag === "audio";
  const isIframeElement = elementTag === "iframe";
  const isInputElement = elementTag === "input";
  const isTextareaElement = elementTag === "textarea";
  const isSelectElement = elementTag === "select";
  const isFormElement = elementTag === "form";

  const activeOverrideCount = Object.keys(currentBreakpointOverrides).length;

  const colorTokens = projectStyles.colors || {};
  const typographyTokens = projectStyles.typography || {};
  const radiusTokens = projectStyles.radii || {};
  const shadowTokens = projectStyles.shadows || {};
  const spacingTokens = projectStyles.spacing || {};
  const fontTokens = projectStyles.fonts || {};

  const handleStyleChange = (patch: Partial<ElementStyle>) => {
    if (isDefaultBreakpoint) {
      updateNodeStyle(targetNodeId, patch);
    } else {
      updateBreakpointStyle(targetNodeId, activeBreakpointId, patch);
    }
  };

  const handleApplyTypographyPreset = (presetKey: string) => {
    const token: TypographyToken | undefined = typographyTokens[presetKey];
    if (!token) return;

    // Reference the token's CSS vars rather than baking in a snapshot of
    // its current values — editing the preset later then keeps propagating
    // to every node that applied it (same as color/radius tokens).
    handleStyleChange({
      fontFamily: token.fontFamily !== undefined ? `var(--typography-${presetKey}-font-family)` : undefined,
      fontSize: token.fontSize !== undefined ? `var(--typography-${presetKey}-font-size)` : undefined,
      fontWeight: token.fontWeight !== undefined ? `var(--typography-${presetKey}-font-weight)` : undefined,
      lineHeight: token.lineHeight !== undefined ? `var(--typography-${presetKey}-line-height)` : undefined,
      letterSpacing: token.letterSpacing !== undefined ? `var(--typography-${presetKey}-letter-spacing)` : undefined,
    });
  };

  const handleTextChange = (newText: string) => {
    if (isTextElement) {
      updateTextContent(targetNodeId, newText);
    } else {
      updateNodeAttributes(targetNodeId, { textContent: newText });
    }
  };

  const handleAttributeChange = (patch: Record<string, unknown>) => {
    updateNodeAttributes(targetNodeId, patch);
  };

  const getBreakpointIcon = (minWidth: number) => {
    if (minWidth >= 1200) return <Monitor className="size-3.5 text-sky-500" />;
    if (minWidth >= 992) return <Laptop className="size-3.5 text-blue-500" />;
    if (minWidth >= 640) return <Tablet className="size-3.5 text-indigo-500" />;
    return <Smartphone className="size-3.5 text-amber-500" />;
  };

  const renderOverrideIndicator = (propertyKey: keyof ElementStyle) => {
    if (isDefaultBreakpoint) return null;
    const isOverridden = propertyKey in currentBreakpointOverrides && currentBreakpointOverrides[propertyKey] !== undefined;

    if (!isOverridden) {
      return (
        <span
          className="size-1.5 rounded-full bg-muted-foreground/30 shrink-0"
          title="Inherited from Desktop base style"
        />
      );
    }

    return (
      <div className="flex items-center gap-1 shrink-0">
        <span
          className="size-1.5 rounded-full bg-amber-500 shrink-0"
          title={`Overridden specifically on ${activeBreakpoint.name}`}
        />
        <button
          type="button"
          onClick={() => removeBreakpointStyleProperty(targetNodeId, activeBreakpointId, propertyKey as string)}
          className="p-0.5 rounded text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 cursor-pointer transition-colors"
          title="Reset override (inherit from Desktop)"
        >
          <RotateCcw className="size-2.5" />
        </button>
      </div>
    );
  };

  /**
   * Helper component to render a color field with Project Token Swatches and proper hex resolution
   */
  const renderColorInput = (
    label: string,
    propertyKey: keyof ElementStyle,
    fallbackHex = "#3b82f6"
  ) => {
    const rawVal = String(effectiveStyle[propertyKey] || "");
    const { displayHex, tokenName } = resolveColorValue(rawVal, colorTokens, fallbackHex);

    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 min-w-0">
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            {tokenName && (
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-500 font-mono flex items-center gap-1">
                <span>{tokenName}</span>
                <button
                  type="button"
                  onClick={() => handleStyleChange({ [propertyKey]: displayHex })}
                  className="hover:text-foreground cursor-pointer"
                  title="Unlink token (keep hex)"
                >
                  ×
                </button>
              </span>
            )}
          </div>
          {renderOverrideIndicator(propertyKey)}
        </div>

        <div className="flex items-center gap-1.5">
          {/* Color swatch & native picker */}
          <ColorSwatchInput
            displayHex={displayHex}
            fallbackHex={fallbackHex}
            onCommit={(hex) => handleStyleChange({ [propertyKey]: hex })}
          />

          <ColorHexInput
            rawVal={rawVal}
            fallbackHex={fallbackHex}
            onCommit={(val) => handleStyleChange({ [propertyKey]: val })}
          />

          {/* Project Color Tokens Popover */}
          {Object.keys(colorTokens).length > 0 && (
            <Popover>
              <PopoverTrigger
                className="size-8 rounded-md border border-border bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
                title="Choose from project color tokens"
              >
                <Palette className="size-3.5 text-pink-500" />
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2 space-y-1.5 bg-popover border-border shadow-xl z-50" align="end">
                <div className="text-[11px] font-semibold text-foreground px-1 pb-1 border-b border-border">
                  Project Color Tokens
                </div>
                <div className="max-h-48 overflow-y-auto space-y-0.5">
                  {Object.entries(colorTokens).map(([name, hex]) => {
                    const isSelected = rawVal === `var(--color-${name})`;
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => handleStyleChange({ [propertyKey]: `var(--color-${name})` })}
                        className={`w-full flex items-center justify-between p-1.5 rounded text-xs transition-colors cursor-pointer text-left ${
                          isSelected ? "bg-primary/15 text-primary font-medium" : "hover:bg-secondary/80"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="size-4 rounded-xs border border-border/80 shrink-0"
                            style={{ backgroundColor: hex }}
                          />
                          <span className="truncate">{name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-muted-foreground">{hex}</span>
                      </button>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    );
  };
  return (
    <div className="flex flex-col text-foreground">
      {/* Sticky Fixed Search Bar & Element Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs p-3 border-b border-border/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold truncate">
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10px] uppercase">
              {isRoot ? "ROOT" : elementTag}
            </span>
            <span className="truncate">{elementName}</span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground truncate max-w-24">
            #{targetNodeId}
          </span>
        </div>

        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${elementName.toLowerCase()} properties...`}
            className="h-8 text-xs font-normal pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Responsive Breakpoint Context Banner */}
      {!isDefaultBreakpoint && (
        <div className="p-3 bg-amber-500/10 border-b border-amber-500/30 flex flex-col gap-1.5 animate-in fade-in-0 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              {getBreakpointIcon(activeBreakpoint.minWidth)}
              <span>Editing {activeBreakpoint.name} Overrides</span>
            </div>
            {activeOverrideCount > 0 ? (
              <button
                type="button"
                onClick={() => clearBreakpointOverrides(targetNodeId, activeBreakpointId)}
                className="text-[10px] font-medium text-amber-600 dark:text-amber-400 hover:underline cursor-pointer flex items-center gap-1"
                title="Remove all overrides on this element for this breakpoint"
              >
                <RotateCcw className="size-2.5" />
                <span>Clear all ({activeOverrideCount})</span>
              </button>
            ) : (
              <span className="text-[10px] text-muted-foreground font-normal">All inherited</span>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground leading-tight">
            Styles changed here apply specifically to <strong>{activeBreakpoint.name}</strong> (≥ {activeBreakpoint.minWidth}px).
          </p>
        </div>
      )}

      {/* Accordion Style Sections */}
      <Accordion
        defaultValue={["layout", "typography"]}
        className="w-full"
      >
        {/* ==================== 1. DIMENSIONS & POSITIONING ==================== */}
        {matchesFilter("dimension", "width", "height", "size", "position", "top", "left", "right", "bottom", "z-index", "overflow", "aspect", "display", "box-sizing") && (
          <AccordionItem value="layout" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Maximize2 className="size-3.5 text-blue-500" />
                <span>Dimensions & Layout</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
              {/* Width & Height */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Width</Label>
                    {renderOverrideIndicator("width")}
                  </div>
                  <UnitInput
                    value={effectiveStyle.width !== undefined ? String(effectiveStyle.width) : isRoot ? "100%" : "auto"}
                    onChange={(val) => handleStyleChange({ width: val })}
                    placeholder="auto / 100%"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Height</Label>
                    {renderOverrideIndicator("height")}
                  </div>
                  <UnitInput
                    value={effectiveStyle.height !== undefined ? String(effectiveStyle.height) : "auto"}
                    onChange={(val) => handleStyleChange({ height: val })}
                    placeholder="auto"
                    className="h-8"
                  />
                </div>
              </div>

              {/* Min/Max Dimensions */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Min Width</Label>
                  <UnitInput
                    value={effectiveStyle.minWidth !== undefined ? String(effectiveStyle.minWidth) : ""}
                    onChange={(val) => handleStyleChange({ minWidth: val })}
                    placeholder="0px"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Min Height</Label>
                  <UnitInput
                    value={effectiveStyle.minHeight !== undefined ? String(effectiveStyle.minHeight) : isRoot ? "100%" : ""}
                    onChange={(val) => handleStyleChange({ minHeight: val })}
                    placeholder="100% / 0px"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Max Width</Label>
                  <UnitInput
                    value={effectiveStyle.maxWidth !== undefined ? String(effectiveStyle.maxWidth) : ""}
                    onChange={(val) => handleStyleChange({ maxWidth: val })}
                    placeholder="none / 1200px"
                    className="h-7 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Max Height</Label>
                  <UnitInput
                    value={effectiveStyle.maxHeight !== undefined ? String(effectiveStyle.maxHeight) : ""}
                    onChange={(val) => handleStyleChange({ maxHeight: val })}
                    placeholder="none"
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Position</Label>
                  <Select
                    value={effectiveStyle.position || "static"}
                    onValueChange={(val) => val && handleStyleChange({ position: val as ElementStyle["position"] })}
                  >
                    <SelectTrigger className="h-8 text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="static">Static</SelectItem>
                      <SelectItem value="relative">Relative</SelectItem>
                      <SelectItem value="absolute">Absolute</SelectItem>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="sticky">Sticky</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Z-Index</Label>
                  <UnitInput
                    value={effectiveStyle.zIndex !== undefined ? String(effectiveStyle.zIndex) : "auto"}
                    onChange={(val) => {
                      const parsed = val === "auto" || val === "" ? NaN : parseInt(val, 10);
                      handleStyleChange({ zIndex: Number.isNaN(parsed) ? undefined : parsed });
                    }}
                    placeholder="auto"
                    className="h-8"
                  />
                </div>
              </div>

              {effectiveStyle.position && effectiveStyle.position !== "static" && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Top / Bottom</Label>
                    <div className="flex items-center gap-1">
                      <UnitInput
                        value={effectiveStyle.top !== undefined ? String(effectiveStyle.top) : ""}
                        onChange={(val) => handleStyleChange({ top: val })}
                        placeholder="Top"
                        className="h-7 text-xs flex-1"
                      />
                      <UnitInput
                        value={effectiveStyle.bottom !== undefined ? String(effectiveStyle.bottom) : ""}
                        onChange={(val) => handleStyleChange({ bottom: val })}
                        placeholder="Bottom"
                        className="h-7 text-xs flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Left / Right</Label>
                    <div className="flex items-center gap-1">
                      <UnitInput
                        value={effectiveStyle.left !== undefined ? String(effectiveStyle.left) : ""}
                        onChange={(val) => handleStyleChange({ left: val })}
                        placeholder="Left"
                        className="h-7 text-xs flex-1"
                      />
                      <UnitInput
                        value={effectiveStyle.right !== undefined ? String(effectiveStyle.right) : ""}
                        onChange={(val) => handleStyleChange({ right: val })}
                        placeholder="Right"
                        className="h-7 text-xs flex-1"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Display & Overflow */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Display</Label>
                  <Select
                    value={effectiveStyle.display || (isRoot ? "flex" : "block")}
                    onValueChange={(val) => val && handleStyleChange({ display: val as ElementStyle["display"] })}
                  >
                    <SelectTrigger className="h-8 text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="flex">Flex</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="inline-block">Inline Block</SelectItem>
                      <SelectItem value="inline">Inline</SelectItem>
                      <SelectItem value="none">Hidden (None)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Overflow</Label>
                  <Select
                    value={effectiveStyle.overflow || "visible"}
                    onValueChange={(val) => val && handleStyleChange({ overflow: val as ElementStyle["overflow"] })}
                  >
                    <SelectTrigger className="h-8 text-xs font-medium">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visible">Visible</SelectItem>
                      <SelectItem value="hidden">Hidden</SelectItem>
                      <SelectItem value="auto">Auto Scroll</SelectItem>
                      <SelectItem value="scroll">Scroll</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ==================== 2. FLEX & ALIGNMENT ==================== */}
        {(effectiveStyle.display === "flex" || (!effectiveStyle.display && isRoot)) &&
          matchesFilter("flex", "direction", "justify", "align", "gap", "wrap") && (
            <AccordionItem value="flex" className="border-b border-border/50">
              <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Layout className="size-3.5 text-sky-500" />
                  <span>Flex & Alignment</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
                {/* Direction */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Direction</Label>
                  <Tabs
                    value={effectiveStyle.flexDirection || (isRoot ? "column" : "row")}
                    onValueChange={(val) => val && handleStyleChange({ flexDirection: val as ElementStyle["flexDirection"] })}
                    className="w-full"
                  >
                    <TabsList className="w-full h-8 bg-secondary/80 p-0.5 rounded-md">
                      <TabsTrigger value="row" className="flex-1 h-7 text-xs">
                        Horizontal (Row)
                      </TabsTrigger>
                      <TabsTrigger value="column" className="flex-1 h-7 text-xs">
                        Vertical (Column)
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Justify Content & Align Items */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Justify (Main)</Label>
                    <Select
                      value={effectiveStyle.justifyContent || "flex-start"}
                      onValueChange={(val) => val && handleStyleChange({ justifyContent: val as ElementStyle["justifyContent"] })}
                    >
                      <SelectTrigger className="h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="space-between">Space Between</SelectItem>
                        <SelectItem value="space-around">Space Around</SelectItem>
                        <SelectItem value="space-evenly">Space Evenly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Align (Cross)</Label>
                    <Select
                      value={effectiveStyle.alignItems || "stretch"}
                      onValueChange={(val) => val && handleStyleChange({ alignItems: val as ElementStyle["alignItems"] })}
                    >
                      <SelectTrigger className="h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="stretch">Stretch</SelectItem>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="flex-start">Start</SelectItem>
                        <SelectItem value="flex-end">End</SelectItem>
                        <SelectItem value="baseline">Baseline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Gap & Flex Wrap */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Gap (Spacing)</Label>
                    <UnitInput
                      value={effectiveStyle.gap !== undefined ? String(effectiveStyle.gap) : "0px"}
                      onChange={(val) => handleStyleChange({ gap: val })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Wrap</Label>
                    <Select
                      value={effectiveStyle.flexWrap || "nowrap"}
                      onValueChange={(val) => val && handleStyleChange({ flexWrap: val as ElementStyle["flexWrap"] })}
                    >
                      <SelectTrigger className="h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="nowrap">No Wrap</SelectItem>
                        <SelectItem value="wrap">Wrap</SelectItem>
                        <SelectItem value="wrap-reverse">Wrap Reverse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

        {/* ==================== 2B. GRID & PLACEMENT ==================== */}
        {effectiveStyle.display === "grid" &&
          matchesFilter("grid", "template", "columns", "rows", "area", "placement") && (
            <AccordionItem value="grid" className="border-b border-border/50">
              <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <Grid3x3 className="size-3.5 text-sky-500" />
                  <span>Grid & Placement</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Template Columns</Label>
                  <DeferredInput
                    value={effectiveStyle.gridTemplateColumns || ""}
                    onCommit={(val) => handleStyleChange({ gridTemplateColumns: val })}
                    placeholder="1fr 1fr 1fr / repeat(3, 1fr)"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Template Rows</Label>
                  <DeferredInput
                    value={effectiveStyle.gridTemplateRows || ""}
                    onCommit={(val) => handleStyleChange({ gridTemplateRows: val })}
                    placeholder="auto 1fr auto"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Template Areas</Label>
                  <DeferredInput
                    value={effectiveStyle.gridTemplateAreas || ""}
                    onCommit={(val) => handleStyleChange({ gridTemplateAreas: val })}
                    placeholder='"header header" "nav main"'
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Auto Flow</Label>
                    <Select
                      value={effectiveStyle.gridAutoFlow || "row"}
                      onValueChange={(val) => val && handleStyleChange({ gridAutoFlow: val as ElementStyle["gridAutoFlow"] })}
                    >
                      <SelectTrigger className="h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="row">Row</SelectItem>
                        <SelectItem value="column">Column</SelectItem>
                        <SelectItem value="row dense">Row Dense</SelectItem>
                        <SelectItem value="column dense">Column Dense</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Gap (Spacing)</Label>
                    <UnitInput
                      value={effectiveStyle.gap !== undefined ? String(effectiveStyle.gap) : "0px"}
                      onChange={(val) => handleStyleChange({ gap: val })}
                      className="h-8"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Auto Rows</Label>
                    <DeferredInput
                      value={effectiveStyle.gridAutoRows || ""}
                      onCommit={(val) => handleStyleChange({ gridAutoRows: val })}
                      placeholder="minmax(100px, auto)"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Auto Columns</Label>
                    <DeferredInput
                      value={effectiveStyle.gridAutoColumns || ""}
                      onCommit={(val) => handleStyleChange({ gridAutoColumns: val })}
                      placeholder="minmax(100px, auto)"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Item: Column</Label>
                    <DeferredInput
                      value={effectiveStyle.gridColumn || ""}
                      onCommit={(val) => handleStyleChange({ gridColumn: val })}
                      placeholder="1 / 3"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Item: Row</Label>
                    <DeferredInput
                      value={effectiveStyle.gridRow || ""}
                      onCommit={(val) => handleStyleChange({ gridRow: val })}
                      placeholder="1 / 2"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Item: Area</Label>
                  <DeferredInput
                    value={effectiveStyle.gridArea || ""}
                    onCommit={(val) => handleStyleChange({ gridArea: val })}
                    placeholder="header"
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Place Items</Label>
                    <DeferredInput
                      value={effectiveStyle.placeItems || ""}
                      onCommit={(val) => handleStyleChange({ placeItems: val })}
                      placeholder="center stretch"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Place Content</Label>
                    <DeferredInput
                      value={effectiveStyle.placeContent || ""}
                      onCommit={(val) => handleStyleChange({ placeContent: val })}
                      placeholder="center stretch"
                      className="h-8 text-xs font-mono"
                    />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

        {/* ==================== 3. PADDING & MARGIN (SPACING) ==================== */}
        {matchesFilter("spacing", "padding", "margin", "inset") && (
          <AccordionItem value="spacing" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <SlidersHorizontal className="size-3.5 text-emerald-500" />
                <span>Padding & Margin</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
              {/* Padding */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Padding (Inner)</Label>
                  {Object.keys(spacingTokens).length > 0 && (
                    <Popover>
                      <PopoverTrigger className="text-[10px] text-emerald-500 hover:underline font-mono px-1 rounded cursor-pointer">
                        Tokens ({Object.keys(spacingTokens).length})
                      </PopoverTrigger>
                      <PopoverContent className="w-48 p-2 space-y-1 bg-popover border-border shadow-xl z-50" align="end">
                        <div className="text-[11px] font-semibold text-foreground px-1 pb-1 border-b border-border">
                          Spacing Tokens
                        </div>
                        {Object.entries(spacingTokens).map(([name, val]) => (
                          <button
                            key={name}
                            type="button"
                            onClick={() => handleStyleChange({ padding: `var(--spacing-${name})` })}
                            className="w-full flex items-center justify-between p-1 rounded hover:bg-secondary text-xs cursor-pointer text-left"
                          >
                            <span className="font-medium text-foreground">{name}</span>
                            <span className="text-[10px] font-mono text-muted-foreground">{String(val)}</span>
                          </button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <UnitInput
                    value={effectiveStyle.padding !== undefined ? String(effectiveStyle.padding) : "0px"}
                    onChange={(val) => handleStyleChange({ padding: val })}
                    placeholder="All (e.g. 16px)"
                    className="h-8"
                  />
                  <div className="grid grid-cols-2 gap-1">
                    <UnitInput
                      value={effectiveStyle.paddingLeft !== undefined ? String(effectiveStyle.paddingLeft) : ""}
                      onChange={(val) => handleStyleChange({ paddingLeft: val, paddingRight: val })}
                      placeholder="X-axis"
                      className="h-8 text-[11px]"
                    />
                    <UnitInput
                      value={effectiveStyle.paddingTop !== undefined ? String(effectiveStyle.paddingTop) : ""}
                      onChange={(val) => handleStyleChange({ paddingTop: val })}
                      placeholder="Top"
                      className="h-8 text-[11px]"
                    />
                    <UnitInput
                      value={effectiveStyle.paddingBottom !== undefined ? String(effectiveStyle.paddingBottom) : ""}
                      onChange={(val) => handleStyleChange({ paddingBottom: val })}
                      placeholder="Bottom"
                      className="h-8 text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Margin */}
              {!isRoot && (
                <div className="space-y-1.5 pt-1 border-t border-border/50">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Margin (Outer)</Label>
                    {Object.keys(spacingTokens).length > 0 && (
                      <Popover>
                        <PopoverTrigger className="text-[10px] text-emerald-500 hover:underline font-mono px-1 rounded cursor-pointer">
                          Tokens ({Object.keys(spacingTokens).length})
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 space-y-1 bg-popover border-border shadow-xl z-50" align="end">
                          <div className="text-[11px] font-semibold text-foreground px-1 pb-1 border-b border-border">
                            Spacing Tokens
                          </div>
                          {Object.entries(spacingTokens).map(([name, val]) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => handleStyleChange({ margin: `var(--spacing-${name})` })}
                              className="w-full flex items-center justify-between p-1 rounded hover:bg-secondary text-xs cursor-pointer text-left"
                            >
                              <span className="font-medium text-foreground">{name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{String(val)}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <UnitInput
                      value={effectiveStyle.margin !== undefined ? String(effectiveStyle.margin) : "0px"}
                      onChange={(val) => handleStyleChange({ margin: val })}
                      placeholder="All (e.g. 0px)"
                      className="h-8"
                    />
                    <div className="grid grid-cols-2 gap-1">
                      <UnitInput
                        value={effectiveStyle.marginLeft !== undefined ? String(effectiveStyle.marginLeft) : ""}
                        onChange={(val) => handleStyleChange({ marginLeft: val, marginRight: val })}
                        placeholder="X / auto"
                        className="h-8 text-[11px]"
                      />
                      <div className="flex flex-col gap-1">
                        <UnitInput
                          value={effectiveStyle.marginTop !== undefined ? String(effectiveStyle.marginTop) : ""}
                          onChange={(val) => handleStyleChange({ marginTop: val })}
                          placeholder="Top"
                          className="h-8 text-[11px]"
                        />
                        <UnitInput
                          value={effectiveStyle.marginBottom !== undefined ? String(effectiveStyle.marginBottom) : ""}
                          onChange={(val) => handleStyleChange({ marginBottom: val })}
                          placeholder="Bottom"
                          className="h-8 text-[11px]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ==================== 4. TYPOGRAPHY & FONT STYLES ==================== */}
        {matchesFilter("typography", "font", "size", "weight", "align", "color", "letter", "line", "content", "preset", "italic", "transform", "decoration") && (
          <AccordionItem value="typography" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Type className="size-3.5 text-purple-500" />
                <span>Typography & Font Styles</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
              {/* Text Content (if text element, button, or leaf) */}
              {!isRoot && (isTextElement || isButtonElement || element.children.length === 0) && (
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Text Content</Label>
                  <DeferredTextarea
                    rows={2}
                    value={textContent}
                    onCommit={handleTextChange}
                    placeholder="Enter element text..."
                    className="text-xs font-normal rounded-md"
                  />
                </div>
              )}

              {/* Apply Preset Dropdown */}
              {Object.keys(typographyTokens).length > 0 && (
                <div className="flex items-center justify-between p-2 rounded-md bg-secondary/30 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-medium">
                    <Sparkles className="size-3.5 text-amber-500" />
                    <span>Typography Preset</span>
                  </div>
                  <Select onValueChange={(val) => { if (typeof val === "string") handleApplyTypographyPreset(val); }}>
                    <SelectTrigger className="h-6 text-[10px] font-medium px-2 bg-secondary/50 rounded gap-1">
                      <SelectValue placeholder="Select preset" />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {Object.keys(typographyTokens).map((key) => (
                        <SelectItem key={key} value={key} className="text-xs capitalize">
                          {key}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Font Family (Curated Google Fonts & Tokens) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Font Family</Label>
                <FontFamilyPicker
                  value={effectiveStyle.fontFamily || "Inter"}
                  onChange={(val) => handleStyleChange({ fontFamily: val })}
                  fontTokens={fontTokens}
                />
              </div>

              {/* Font Size & Weight */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Font Size</Label>
                    {renderOverrideIndicator("fontSize")}
                  </div>
                  <UnitInput
                    value={effectiveStyle.fontSize !== undefined ? String(effectiveStyle.fontSize) : "16px"}
                    onChange={(val) => handleStyleChange({ fontSize: val })}
                    className="h-8"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Weight</Label>
                  <Select
                    value={effectiveStyle.fontWeight !== undefined ? String(effectiveStyle.fontWeight) : "400"}
                    onValueChange={(val) => val && handleStyleChange({ fontWeight: val })}
                  >
                    <SelectTrigger className="h-8 text-xs font-medium rounded-md w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="300">Light (300)</SelectItem>
                      <SelectItem value="400">Regular (400)</SelectItem>
                      <SelectItem value="500">Medium (500)</SelectItem>
                      <SelectItem value="600">Semibold (600)</SelectItem>
                      <SelectItem value="700">Bold (700)</SelectItem>
                      <SelectItem value="800">Extra Bold (800)</SelectItem>
                      <SelectItem value="900">Black (900)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Font Style Toggles (Italic, Underline, Strikethrough) */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Style & Decoration</Label>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      handleStyleChange({
                        fontStyle: effectiveStyle.fontStyle === "italic" ? "normal" : "italic",
                      })
                    }
                    className={`h-7 px-2.5 rounded border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                      effectiveStyle.fontStyle === "italic"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                    }`}
                    title="Italic"
                  >
                    <Italic className="size-3" />
                    <span>Italic</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleStyleChange({
                        textDecoration: effectiveStyle.textDecoration === "underline" ? "none" : "underline",
                      })
                    }
                    className={`h-7 px-2.5 rounded border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                      effectiveStyle.textDecoration === "underline"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                    }`}
                    title="Underline"
                  >
                    <Underline className="size-3" />
                    <span>Underline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleStyleChange({
                        textDecoration: effectiveStyle.textDecoration === "line-through" ? "none" : "line-through",
                      })
                    }
                    className={`h-7 px-2.5 rounded border text-xs font-medium flex items-center gap-1 cursor-pointer transition-colors ${
                      effectiveStyle.textDecoration === "line-through"
                        ? "bg-purple-600 text-white border-purple-600"
                        : "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                    }`}
                    title="Strikethrough"
                  >
                    <Strikethrough className="size-3" />
                    <span>Strike</span>
                  </button>
                </div>
              </div>

              {/* Text Transform Segmented Buttons */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Text Case (Transform)</Label>
                <Tabs
                  value={effectiveStyle.textTransform || "none"}
                  onValueChange={(val) => val && handleStyleChange({ textTransform: val as ElementStyle["textTransform"] })}
                  className="w-full"
                >
                  <TabsList className="w-full h-7 bg-secondary/80 p-0.5 rounded-md grid grid-cols-4">
                    <TabsTrigger value="none" className="text-[11px] h-6">
                      None
                    </TabsTrigger>
                    <TabsTrigger value="uppercase" className="text-[11px] h-6 font-semibold">
                      AA
                    </TabsTrigger>
                    <TabsTrigger value="lowercase" className="text-[11px] h-6 font-semibold">
                      aa
                    </TabsTrigger>
                    <TabsTrigger value="capitalize" className="text-[11px] h-6 font-semibold">
                      Aa
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Line Height & Letter Spacing */}
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Line Height</Label>
                  <DeferredInput
                    value={effectiveStyle.lineHeight !== undefined ? String(effectiveStyle.lineHeight) : "1.5"}
                    onCommit={(val) => handleStyleChange({ lineHeight: val })}
                    placeholder="1.5 / 24px"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Letter Spacing</Label>
                  <UnitInput
                    value={effectiveStyle.letterSpacing !== undefined ? String(effectiveStyle.letterSpacing) : "0px"}
                    onChange={(val) => handleStyleChange({ letterSpacing: val })}
                    placeholder="0px / -0.02em"
                    className="h-8"
                  />
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Alignment</Label>
                <Tabs
                  value={effectiveStyle.textAlign || "left"}
                  onValueChange={(val) => val && handleStyleChange({ textAlign: val as ElementStyle["textAlign"] })}
                  className="w-full"
                >
                  <TabsList className="w-full h-8 bg-secondary/80 p-0.5 rounded-md">
                    <TabsTrigger value="left" className="flex-1 h-7 p-0 rounded">
                      <AlignLeft className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="center" className="flex-1 h-7 p-0 rounded">
                      <AlignCenter className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="right" className="flex-1 h-7 p-0 rounded">
                      <AlignRight className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="justify" className="flex-1 h-7 p-0 rounded">
                      <AlignJustify className="size-3.5" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Text Color with Token Popover */}
              {renderColorInput("Text Color", "color", "#ffffff")}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ==================== 5. APPEARANCE & BACKGROUND ==================== */}
        {matchesFilter("appearance", "background", "color", "image", "gradient", "fill") && (
          <AccordionItem value="appearance" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Palette className="size-3.5 text-pink-500" />
                <span>Appearance & Background</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
              {renderColorInput("Background Color", "backgroundColor", "#09090b")}

              {/* Background Image & Settings */}
              <div className="space-y-1.5 pt-1 border-t border-border/50">
                <Label className="text-xs font-medium text-muted-foreground">Background Image (URL)</Label>
                <DeferredInput
                  value={effectiveStyle.backgroundImage || ""}
                  onCommit={(val) => handleStyleChange({ backgroundImage: val })}
                  placeholder="url('https://...')"
                  className="h-8 text-xs font-mono"
                />
              </div>

              {effectiveStyle.backgroundImage && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Size</Label>
                    <Select
                      value={effectiveStyle.backgroundSize || "cover"}
                      onValueChange={(val) => val && handleStyleChange({ backgroundSize: val })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cover">Cover</SelectItem>
                        <SelectItem value="contain">Contain</SelectItem>
                        <SelectItem value="auto">Auto</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[11px] text-muted-foreground">Position</Label>
                    <Select
                      value={effectiveStyle.backgroundPosition || "center"}
                      onValueChange={(val) => val && handleStyleChange({ backgroundPosition: val })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="center">Center</SelectItem>
                        <SelectItem value="top">Top</SelectItem>
                        <SelectItem value="bottom">Bottom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ==================== 6. BORDERS & CORNERS ==================== */}
        {!isRoot &&
          matchesFilter("border", "radius", "corner", "outline", "stroke") && (
            <AccordionItem value="borders" className="border-b border-border/50">
              <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
                <div className="flex items-center gap-2 text-xs font-semibold">
                  <SlidersHorizontal className="size-3.5 text-blue-500" />
                  <span>Borders & Corners</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
                {/* 1-Click Corner Presets */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Corner Presets</Label>
                    {renderOverrideIndicator("borderRadius")}
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {[
                      { label: "0", val: "0px", icon: <Square className="size-2.5" /> },
                      { label: "4", val: "4px" },
                      { label: "8", val: "8px" },
                      { label: "12", val: "12px" },
                      { label: "16", val: "16px" },
                      { label: "Pill", val: "9999px", icon: <Circle className="size-2.5" /> },
                    ].map((preset) => {
                      const isSelected = String(effectiveStyle.borderRadius) === preset.val;
                      return (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => handleStyleChange({ borderRadius: preset.val })}
                          className={`h-6 rounded text-[10px] font-mono font-medium flex items-center justify-center gap-0.5 border cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-blue-600 text-white border-blue-600"
                              : "border-border bg-secondary/40 hover:bg-secondary text-foreground"
                          }`}
                        >
                          {preset.icon}
                          <span>{preset.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Border Radius with Token Popover */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-muted-foreground">Custom Radius</Label>
                    {Object.keys(radiusTokens).length > 0 && (
                      <Popover>
                        <PopoverTrigger
                          className="text-[10px] text-blue-500 hover:underline font-mono px-1 rounded cursor-pointer"
                        >
                          Tokens ({Object.keys(radiusTokens).length})
                        </PopoverTrigger>
                        <PopoverContent className="w-48 p-2 space-y-1 bg-popover border-border shadow-xl z-50" align="end">
                          <div className="text-[11px] font-semibold text-foreground px-1 pb-1 border-b border-border">
                            Radius Tokens
                          </div>
                          {Object.entries(radiusTokens).map(([name, val]) => (
                            <button
                              key={name}
                              type="button"
                              onClick={() => handleStyleChange({ borderRadius: `var(--radius-${name})` })}
                              className="w-full flex items-center justify-between p-1 rounded hover:bg-secondary text-xs cursor-pointer text-left"
                            >
                              <span className="font-medium text-foreground">{name}</span>
                              <span className="text-[10px] font-mono text-muted-foreground">{String(val)}</span>
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                  <UnitInput
                    value={effectiveStyle.borderRadius !== undefined ? String(effectiveStyle.borderRadius) : "0px"}
                    onChange={(val) => handleStyleChange({ borderRadius: val })}
                    className="h-8"
                  />
                </div>

                {/* Border Width & Style */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-border/50">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-medium text-muted-foreground">Border Width</Label>
                      {renderOverrideIndicator("borderWidth")}
                    </div>
                    <UnitInput
                      value={effectiveStyle.borderWidth !== undefined ? String(effectiveStyle.borderWidth) : "0px"}
                      onChange={(val) => handleStyleChange({ borderWidth: val, borderStyle: effectiveStyle.borderStyle || "solid" })}
                      className="h-8"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Style</Label>
                    <Select
                      value={effectiveStyle.borderStyle || "solid"}
                      onValueChange={(val) => val && handleStyleChange({ borderStyle: val as ElementStyle["borderStyle"] })}
                    >
                      <SelectTrigger className="h-8 text-xs font-medium">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solid">Solid</SelectItem>
                        <SelectItem value="dashed">Dashed</SelectItem>
                        <SelectItem value="dotted">Dotted</SelectItem>
                        <SelectItem value="none">None</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {renderColorInput("Border Color", "borderColor", "#27272a")}
              </AccordionContent>
            </AccordionItem>
          )}

        {/* ==================== 6B. TRANSFORM ==================== */}
        {matchesFilter("transform", "translate", "rotate", "scale", "skew", "perspective", "origin") && (
          <AccordionItem value="transform" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Move3d className="size-3.5 text-indigo-400" />
                <span>Transform</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Translate X</Label>
                  <UnitInput
                    value={effectiveStyle.translateX !== undefined ? String(effectiveStyle.translateX) : "0px"}
                    onChange={(val) => handleStyleChange({ translateX: val })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Translate Y</Label>
                  <UnitInput
                    value={effectiveStyle.translateY !== undefined ? String(effectiveStyle.translateY) : "0px"}
                    onChange={(val) => handleStyleChange({ translateY: val })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Translate Z</Label>
                  <UnitInput
                    value={effectiveStyle.translateZ !== undefined ? String(effectiveStyle.translateZ) : "0px"}
                    onChange={(val) => handleStyleChange({ translateZ: val })}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Rotate</Label>
                  <UnitInput
                    value={effectiveStyle.rotate !== undefined ? String(effectiveStyle.rotate) : "0deg"}
                    unit="deg"
                    units={["deg"]}
                    onChange={(val) => handleStyleChange({ rotate: val })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Rotate X</Label>
                  <UnitInput
                    value={effectiveStyle.rotateX !== undefined ? String(effectiveStyle.rotateX) : "0deg"}
                    unit="deg"
                    units={["deg"]}
                    onChange={(val) => handleStyleChange({ rotateX: val })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Rotate Y</Label>
                  <UnitInput
                    value={effectiveStyle.rotateY !== undefined ? String(effectiveStyle.rotateY) : "0deg"}
                    unit="deg"
                    units={["deg"]}
                    onChange={(val) => handleStyleChange({ rotateY: val })}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Scale</Label>
                  <DeferredInput
                    value={effectiveStyle.scale !== undefined ? String(effectiveStyle.scale) : "1"}
                    onCommit={(val) => handleStyleChange({ scale: parseFloat(val) || 1 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Scale X</Label>
                  <DeferredInput
                    value={effectiveStyle.scaleX !== undefined ? String(effectiveStyle.scaleX) : "1"}
                    onCommit={(val) => handleStyleChange({ scaleX: parseFloat(val) || 1 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Scale Y</Label>
                  <DeferredInput
                    value={effectiveStyle.scaleY !== undefined ? String(effectiveStyle.scaleY) : "1"}
                    onCommit={(val) => handleStyleChange({ scaleY: parseFloat(val) || 1 })}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Skew X</Label>
                  <UnitInput
                    value={effectiveStyle.skewX !== undefined ? String(effectiveStyle.skewX) : "0deg"}
                    unit="deg"
                    units={["deg"]}
                    onChange={(val) => handleStyleChange({ skewX: val })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Skew Y</Label>
                  <UnitInput
                    value={effectiveStyle.skewY !== undefined ? String(effectiveStyle.skewY) : "0deg"}
                    unit="deg"
                    units={["deg"]}
                    onChange={(val) => handleStyleChange({ skewY: val })}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Transform Origin</Label>
                  <DeferredInput
                    value={effectiveStyle.transformOrigin || ""}
                    onCommit={(val) => handleStyleChange({ transformOrigin: val })}
                    placeholder="center / 0% 0%"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Perspective</Label>
                  <UnitInput
                    value={effectiveStyle.perspective !== undefined ? String(effectiveStyle.perspective) : "none"}
                    units={["px", "none"]}
                    onChange={(val) => handleStyleChange({ perspective: val })}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-border/50">
                <span className="text-xs text-foreground font-medium">Backface Visibility</span>
                <Tabs
                  value={effectiveStyle.backfaceVisibility || "visible"}
                  onValueChange={(val) => val && handleStyleChange({ backfaceVisibility: val as ElementStyle["backfaceVisibility"] })}
                >
                  <TabsList className="h-7 bg-secondary/80 p-0.5 rounded-md">
                    <TabsTrigger value="visible" className="text-[10px] h-6 px-2">
                      Visible
                    </TabsTrigger>
                    <TabsTrigger value="hidden" className="text-[10px] h-6 px-2">
                      Hidden
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-1.5 pt-1 border-t border-border/50">
                <Label className="text-xs font-medium text-muted-foreground">Raw Transform (advanced override)</Label>
                <DeferredInput
                  value={effectiveStyle.transformRaw || ""}
                  onCommit={(val) => handleStyleChange({ transformRaw: val || undefined })}
                  placeholder="matrix3d(...) — overrides the fields above"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ==================== 6C. TRANSITION ==================== */}
        {matchesFilter("transition", "duration", "easing", "delay", "animate") && (
          <AccordionItem value="transition" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Timer className="size-3.5 text-emerald-400" />
                <span>Transition</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Property</Label>
                <DeferredInput
                  value={effectiveStyle.transitionProperty || ""}
                  onCommit={(val) => handleStyleChange({ transitionProperty: val })}
                  placeholder="all / opacity, transform"
                  className="h-8 text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
                  <DeferredInput
                    value={effectiveStyle.transitionDuration !== undefined ? String(effectiveStyle.transitionDuration) : "0s"}
                    onCommit={(val) => handleStyleChange({ transitionDuration: val })}
                    placeholder="300ms / 0.3s"
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Delay</Label>
                  <DeferredInput
                    value={effectiveStyle.transitionDelay !== undefined ? String(effectiveStyle.transitionDelay) : "0s"}
                    onCommit={(val) => handleStyleChange({ transitionDelay: val })}
                    placeholder="0ms / 0s"
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Timing Function</Label>
                <Select
                  value={effectiveStyle.transitionTimingFunction || "ease"}
                  onValueChange={(val) => val && handleStyleChange({ transitionTimingFunction: val })}
                >
                  <SelectTrigger className="h-8 text-xs font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="ease">Ease</SelectItem>
                    <SelectItem value="ease-in">Ease In</SelectItem>
                    <SelectItem value="ease-out">Ease Out</SelectItem>
                    <SelectItem value="ease-in-out">Ease In Out</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ==================== 7. EFFECTS & SHADOWS ==================== */}
        {matchesFilter("effect", "shadow", "opacity", "blur", "backdrop", "filter") && (
          <AccordionItem value="effects" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Sparkle className="size-3.5 text-cyan-400" />
                <span>Effects & Glassmorphism</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
              {/* Box Shadow Visual Builder */}
              <BoxShadowControl
                value={effectiveStyle.boxShadow || "none"}
                onChange={(val) => handleStyleChange({ boxShadow: val })}
                shadowTokens={shadowTokens}
                colorTokens={colorTokens}
              />

              {/* Opacity */}
              <div className="space-y-1.5 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Opacity</Label>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {Math.round((opacityDraft ?? effectiveStyle.opacity ?? 1) * 100)}%
                  </span>
                </div>
                <Input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={opacityDraft ?? (effectiveStyle.opacity !== undefined ? effectiveStyle.opacity : 1)}
                  onChange={(e) => setOpacityDraft(parseFloat(e.target.value))}
                  onPointerUp={() => {
                    if (opacityDraft !== null) {
                      handleStyleChange({ opacity: opacityDraft });
                      setOpacityDraft(null);
                    }
                  }}
                  onKeyUp={() => {
                    if (opacityDraft !== null) {
                      handleStyleChange({ opacity: opacityDraft });
                      setOpacityDraft(null);
                    }
                  }}
                  onBlur={() => {
                    if (opacityDraft !== null) {
                      handleStyleChange({ opacity: opacityDraft });
                      setOpacityDraft(null);
                    }
                  }}
                  className="h-6 cursor-pointer"
                />
              </div>

              {/* Backdrop Filter (Glassmorphism) */}
              <div className="space-y-1.5 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground">Backdrop Blur (Glassmorphism)</Label>
                  <button
                    type="button"
                    onClick={() => handleStyleChange({ backdropFilter: "blur(16px)" })}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Preset Glass
                  </button>
                </div>
                <DeferredInput
                  value={effectiveStyle.backdropFilter || ""}
                  onCommit={(val) => handleStyleChange({ backdropFilter: val })}
                  placeholder="blur(16px) / saturate(180%)"
                  className="h-8 text-xs font-mono"
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* ==================== 8. ELEMENT ATTRIBUTES & NON-CODER TOGGLES ==================== */}
        {matchesFilter("attribute", "src", "href", "video", "audio", "input", "alt", "controls", "autoplay", "target", "loop") && (
          <AccordionItem value="attributes" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Tag className="size-3.5 text-violet-400" />
                <span>Element Properties & Toggles</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-3">
              {/* VIDEO SPECIFIC CONTROLS */}
              {isVideoElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Video className="size-3.5 text-pink-500" />
                    <span>Video Settings</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Video Source (URL / MP4)</Label>
                      <button
                        type="button"
                        onClick={() =>
                          handleAttributeChange({
                            src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
                          })
                        }
                        className="text-[10px] text-pink-500 hover:underline cursor-pointer"
                      >
                        Sample Video
                      </button>
                    </div>
                    <DeferredInput
                      value={(attributes.src as string) || ""}
                      onCommit={(val) => handleAttributeChange({ src: val })}
                      placeholder="https://...mp4"
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Poster Image URL</Label>
                    <DeferredInput
                      value={(attributes.poster as string) || ""}
                      onCommit={(val) => handleAttributeChange({ poster: val })}
                      placeholder="https://...jpg"
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Show Controls</span>
                      <Switch
                        checked={attributes.controls !== false}
                        onCheckedChange={(c) => handleAttributeChange({ controls: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Autoplay</span>
                      <Switch
                        checked={Boolean(attributes.autoPlay)}
                        onCheckedChange={(c) => handleAttributeChange({ autoPlay: c, muted: c ? true : attributes.muted })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Loop Playback</span>
                      <Switch
                        checked={Boolean(attributes.loop)}
                        onCheckedChange={(c) => handleAttributeChange({ loop: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Muted</span>
                      <Switch
                        checked={Boolean(attributes.muted)}
                        onCheckedChange={(c) => handleAttributeChange({ muted: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Plays Inline (Mobile)</span>
                      <Switch
                        checked={attributes.playsInline !== false}
                        onCheckedChange={(c) => handleAttributeChange({ playsInline: c })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* AUDIO SPECIFIC CONTROLS */}
              {isAudioElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Volume2 className="size-3.5 text-amber-500" />
                    <span>Audio Settings</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Audio Source URL</Label>
                      <button
                        type="button"
                        onClick={() =>
                          handleAttributeChange({
                            src: "https://actions.google.com/sounds/v1/ambiences/rain_heavy.ogg",
                          })
                        }
                        className="text-[10px] text-amber-500 hover:underline cursor-pointer"
                      >
                        Sample Audio
                      </button>
                    </div>
                    <DeferredInput
                      value={(attributes.src as string) || ""}
                      onCommit={(val) => handleAttributeChange({ src: val })}
                      placeholder="https://...mp3"
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Show Controls</span>
                      <Switch
                        checked={attributes.controls !== false}
                        onCheckedChange={(c) => handleAttributeChange({ controls: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Loop</span>
                      <Switch
                        checked={Boolean(attributes.loop)}
                        onCheckedChange={(c) => handleAttributeChange({ loop: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Autoplay</span>
                      <Switch
                        checked={Boolean(attributes.autoPlay)}
                        onCheckedChange={(c) => handleAttributeChange({ autoPlay: c })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* IFRAME SPECIFIC CONTROLS */}
              {isIframeElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <FileCode className="size-3.5 text-cyan-400" />
                    <span>Embed / Iframe Settings</span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Embed URL (src)</Label>
                    <DeferredInput
                      value={(attributes.src as string) || ""}
                      onCommit={(val) => handleAttributeChange({ src: val })}
                      placeholder="https://..."
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Frame Title</Label>
                    <DeferredInput
                      value={(attributes.title as string) || ""}
                      onCommit={(val) => handleAttributeChange({ title: val })}
                      placeholder="Embedded Content"
                      className="h-7 text-xs"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-xs text-foreground font-medium">Allow Fullscreen</span>
                    <Switch
                      checked={Boolean(attributes.allowFullScreen)}
                      onCheckedChange={(c) => handleAttributeChange({ allowFullScreen: c })}
                    />
                  </div>
                </div>
              )}

              {/* IMAGE SPECIFIC CONTROLS */}
              {isImageElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] text-muted-foreground">Image Source (src)</Label>
                      <button
                        type="button"
                        onClick={() =>
                          handleAttributeChange({
                            src: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
                          })
                        }
                        className="text-[10px] text-primary hover:underline cursor-pointer"
                      >
                        Unsplash Art
                      </button>
                    </div>
                    <DeferredInput
                      value={(attributes.src as string) || ""}
                      onCommit={(val) => handleAttributeChange({ src: val })}
                      placeholder="https://..."
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Alt Text (Accessibility & SEO)</Label>
                    <DeferredInput
                      value={(attributes.alt as string) || ""}
                      onCommit={(val) => handleAttributeChange({ alt: val })}
                      placeholder="Descriptive image summary"
                      className="h-7 text-xs"
                    />
                  </div>

                  <div className="space-y-1 pt-1 border-t border-border/50">
                    <Label className="text-[11px] text-muted-foreground">Object Fit (Scaling)</Label>
                    <Tabs
                      value={effectiveStyle.objectFit || "cover"}
                      onValueChange={(val) => val && handleStyleChange({ objectFit: val as ElementStyle["objectFit"] })}
                      className="w-full"
                    >
                      <TabsList className="w-full h-7 bg-secondary/80 p-0.5 rounded-md grid grid-cols-4">
                        <TabsTrigger value="cover" className="text-[10px] h-6">
                          Cover
                        </TabsTrigger>
                        <TabsTrigger value="contain" className="text-[10px] h-6">
                          Contain
                        </TabsTrigger>
                        <TabsTrigger value="fill" className="text-[10px] h-6">
                          Fill
                        </TabsTrigger>
                        <TabsTrigger value="none" className="text-[10px] h-6">
                          None
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              )}

              {/* LINK SPECIFIC CONTROLS */}
              {isLinkElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <LinkIcon className="size-3.5 text-blue-500" />
                    <span>Link Settings</span>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Destination URL (href)</Label>
                    <DeferredInput
                      value={(attributes.href as string) || "#"}
                      onCommit={(val) => handleAttributeChange({ href: val })}
                      placeholder="https://..."
                      className="h-7 text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <div className="flex flex-col">
                      <span className="text-xs text-foreground font-medium">Open in New Window</span>
                      <span className="text-[10px] text-muted-foreground">Opens link in new browser tab</span>
                    </div>
                    <Switch
                      checked={attributes.target === "_blank"}
                      onCheckedChange={(checked) =>
                        handleAttributeChange({
                          target: checked ? "_blank" : "_self",
                          rel: checked ? "noopener noreferrer" : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* BUTTON SPECIFIC CONTROLS */}
              {isButtonElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Button Action Type</Label>
                    <Select
                      value={(attributes.type as string) || "button"}
                      onValueChange={(val) => val && handleAttributeChange({ type: val })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="button">Standard Button</SelectItem>
                        <SelectItem value="submit">Submit Form</SelectItem>
                        <SelectItem value="reset">Reset Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-border/50">
                    <span className="text-xs text-foreground font-medium">Disabled State</span>
                    <Switch
                      checked={Boolean(attributes.disabled)}
                      onCheckedChange={(c) => handleAttributeChange({ disabled: c })}
                    />
                  </div>
                </div>
              )}

              {/* INPUT / FORM FIELD SPECIFIC CONTROLS */}
              {isInputElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Input Type</Label>
                    <Select
                      value={(attributes.type as string) || "text"}
                      onValueChange={(val) => val && handleAttributeChange({ type: val })}
                    >
                      <SelectTrigger className="h-7 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="password">Password</SelectItem>
                        <SelectItem value="number">Number</SelectItem>
                        <SelectItem value="tel">Phone (Tel)</SelectItem>
                        <SelectItem value="url">URL</SelectItem>
                        <SelectItem value="search">Search</SelectItem>
                        <SelectItem value="date">Date</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                        <SelectItem value="radio">Radio</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Placeholder Text</Label>
                    <DeferredInput
                      value={(attributes.placeholder as string) || ""}
                      onCommit={(val) => handleAttributeChange({ placeholder: val })}
                      placeholder="e.g. Enter your name..."
                      className="h-7 text-xs"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Required Field</span>
                      <Switch
                        checked={Boolean(attributes.required)}
                        onCheckedChange={(c) => handleAttributeChange({ required: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Disabled</span>
                      <Switch
                        checked={Boolean(attributes.disabled)}
                        onCheckedChange={(c) => handleAttributeChange({ disabled: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Read Only</span>
                      <Switch
                        checked={Boolean(attributes.readOnly)}
                        onCheckedChange={(c) => handleAttributeChange({ readOnly: c })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TEXTAREA SPECIFIC CONTROLS */}
              {isTextareaElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Placeholder Text</Label>
                    <DeferredInput
                      value={(attributes.placeholder as string) || ""}
                      onCommit={(val) => handleAttributeChange({ placeholder: val })}
                      placeholder="e.g. Type your message..."
                      className="h-7 text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Visible Rows</Label>
                    <DeferredInput
                      type="number"
                      min={1}
                      max={20}
                      value={String(typeof attributes.rows === "number" ? attributes.rows : 3)}
                      onCommit={(val) => handleAttributeChange({ rows: parseInt(val, 10) || 3 })}
                      className="h-7 text-xs"
                    />
                  </div>

                  <div className="space-y-2 pt-1 border-t border-border/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Required Field</span>
                      <Switch
                        checked={Boolean(attributes.required)}
                        onCheckedChange={(c) => handleAttributeChange({ required: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Disabled</span>
                      <Switch
                        checked={Boolean(attributes.disabled)}
                        onCheckedChange={(c) => handleAttributeChange({ disabled: c })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SELECT SPECIFIC CONTROLS */}
              {isSelectElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Disabled</span>
                      <Switch
                        checked={Boolean(attributes.disabled)}
                        onCheckedChange={(c) => handleAttributeChange({ disabled: c })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-foreground font-medium">Multiple Selection</span>
                      <Switch
                        checked={Boolean(attributes.multiple)}
                        onCheckedChange={(c) => handleAttributeChange({ multiple: c })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* FORM SPECIFIC CONTROLS */}
              {isFormElement && (
                <div className="space-y-2.5 p-2.5 rounded-lg bg-secondary/30 border border-border">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Form Action (URL)</Label>
                    <DeferredInput
                      value={(attributes.action as string) || ""}
                      onCommit={(val) => handleAttributeChange({ action: val })}
                      placeholder="/api/contact"
                      className="h-7 text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Method</Label>
                    <Tabs
                      value={(attributes.method as string) || "post"}
                      onValueChange={(val) => val && handleAttributeChange({ method: val })}
                      className="w-full"
                    >
                      <TabsList className="w-full h-7 bg-secondary/80 p-0.5 rounded-md grid grid-cols-2">
                        <TabsTrigger value="post" className="text-[11px] h-6 font-semibold">
                          POST
                        </TabsTrigger>
                        <TabsTrigger value="get" className="text-[11px] h-6 font-semibold">
                          GET
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              )}

              {/* UNIVERSAL HTML ID & CLASSES */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">HTML ID</Label>
                  <DeferredInput
                    value={(attributes.id as string) || ""}
                    onCommit={(val) => handleAttributeChange({ id: val })}
                    placeholder="e.g. hero-section"
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Custom CSS Classes</Label>
                  <DeferredInput
                    value={(attributes.className as string) || ""}
                    onCommit={(val) => handleAttributeChange({ className: val })}
                    placeholder="e.g. glass-card shadow-lg"
                    className="h-8 text-xs font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Aria Label (Accessibility)</Label>
                  <DeferredInput
                    value={(attributes["aria-label"] as string) || ""}
                    onCommit={(val) => handleAttributeChange({ "aria-label": val })}
                    placeholder="Accessible label description"
                    className="h-8 text-xs"
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
