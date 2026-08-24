"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Palette,
  Type,
  Maximize,
  SlidersHorizontal,
  Plus,
  Search,
  Code2,
  Trash2,
  Check,
  RotateCcw,
  Sparkles,
  Copy,
  Layers,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { useProjectStore } from "@/store/project/projectStore";
import { DEFAULT_PROJECT_STYLES } from "@/store/project/createInitialProject";
import { loadGoogleFont } from "@/lib/fontLoader";
import { BoxShadowControl } from "./controls/BoxShadowControl";
import { FontFamilyPicker } from "./controls/FontFamilyPicker";

export const GlobalStylesInspector: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const projectStyles = useProjectStore((state) => state.project.styles) || DEFAULT_PROJECT_STYLES;

  // Store action creators
  const setColorToken = useProjectStore((state) => state.setColorToken);
  const removeColorToken = useProjectStore((state) => state.removeColorToken);
  const setTypographyToken = useProjectStore((state) => state.setTypographyToken);
  const removeTypographyToken = useProjectStore((state) => state.removeTypographyToken);
  const setSpacingToken = useProjectStore((state) => state.setSpacingToken);
  const removeSpacingToken = useProjectStore((state) => state.removeSpacingToken);
  const setRadiusToken = useProjectStore((state) => state.setRadiusToken);
  const removeRadiusToken = useProjectStore((state) => state.removeRadiusToken);
  const setShadowToken = useProjectStore((state) => state.setShadowToken);
  const removeShadowToken = useProjectStore((state) => state.removeShadowToken);
  const setFontToken = useProjectStore((state) => state.setFontToken);
  const removeFontToken = useProjectStore((state) => state.removeFontToken);
  const setVariableToken = useProjectStore((state) => state.setVariableToken);
  const removeVariableToken = useProjectStore((state) => state.removeVariableToken);
  const loadDefaultTokenPresets = useProjectStore((state) => state.loadDefaultTokenPresets);

  // 1. Color Adding State
  const [isAddingColor, setIsAddingColor] = useState(false);
  const [newColorKey, setNewColorKey] = useState("");
  const [newColorVal, setNewColorVal] = useState("#3b82f6");

  // 2. Typography Adding State
  const [isAddingTypo, setIsAddingTypo] = useState(false);
  const [newTypoKey, setNewTypoKey] = useState("");
  const [newTypoFamily, setNewTypoFamily] = useState("Inter, sans-serif");
  const [newTypoSize, setNewTypoSize] = useState("20px");
  const [newTypoWeight, setNewTypoWeight] = useState("600");
  const [newTypoLineHeight, setNewTypoLineHeight] = useState("1.3");

  // 3. Spacing Adding State
  const [isAddingSpacing, setIsAddingSpacing] = useState(false);
  const [newSpacingKey, setNewSpacingKey] = useState("");
  const [newSpacingVal, setNewSpacingVal] = useState("16px");

  // 4. Radius Adding State
  const [isAddingRadius, setIsAddingRadius] = useState(false);
  const [newRadiusKey, setNewRadiusKey] = useState("");
  const [newRadiusVal, setNewRadiusVal] = useState("8px");

  // 5. Shadow Adding State
  const [isAddingShadow, setIsAddingShadow] = useState(false);
  const [newShadowKey, setNewShadowKey] = useState("");
  const [newShadowVal, setNewShadowVal] = useState("0 10px 15px -3px rgb(0 0 0 / 0.1)");

  // 6. Font Adding State
  const [isAddingFont, setIsAddingFont] = useState(false);
  const [newFontKey, setNewFontKey] = useState("");
  const [newFontFamily, setNewFontFamily] = useState("Inter");
  const [newFontFallback, setNewFontFallback] = useState("sans-serif");

  // 7. Custom Var Adding State
  const [isAddingVar, setIsAddingVar] = useState(false);
  const [newVarKey, setNewVarKey] = useState("");
  const [newVarVal, setNewVarVal] = useState("");

  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup copy timer on unmount to prevent setState on unmounted component
  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  const copyToClipboard = useCallback((text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    copyTimerRef.current = setTimeout(() => setCopiedKey(null), 1500);
  }, []);

  const q = searchQuery.toLowerCase().trim();

  const matchesFilter = (label: string, value: string = "") => {
    if (!q) return true;
    return label.toLowerCase().includes(q) || String(value).toLowerCase().includes(q);
  };

  const colors = projectStyles.colors || {};
  const typography = projectStyles.typography || {};
  const spacing = projectStyles.spacing || {};
  const radii = projectStyles.radii || {};
  const shadows = projectStyles.shadows || {};
  const fonts = projectStyles.fonts || {};
  const variables = projectStyles.variables || {};

  const filteredColors = useMemo(() => Object.entries(colors).filter(([k, v]) => matchesFilter(k, v)), [colors, q]);
  const filteredTypography = useMemo(() => Object.entries(typography).filter(([k, v]) =>
    matchesFilter(k, `${v.fontFamily || ""} ${v.fontSize || ""} ${v.fontWeight || ""}`)
  ), [typography, q]);
  const filteredSpacing = useMemo(() => Object.entries(spacing).filter(([k, v]) => matchesFilter(k, String(v))), [spacing, q]);
  const filteredRadii = useMemo(() => Object.entries(radii).filter(([k, v]) => matchesFilter(k, String(v))), [radii, q]);
  const filteredShadows = useMemo(() => Object.entries(shadows).filter(([k, v]) => matchesFilter(k, String(v))), [shadows, q]);
  const filteredFonts = useMemo(() => Object.entries(fonts).filter(([k, v]) => matchesFilter(k, v.family)), [fonts, q]);
  const filteredVars = useMemo(() => Object.entries(variables).filter(([k, v]) => matchesFilter(k, String(v))), [variables, q]);

  // Handlers
  const handleAddColor = () => {
    if (!newColorKey.trim()) return;
    const cleanKey = newColorKey.trim().toLowerCase().replace(/\s+/g, "-");
    setColorToken(cleanKey, newColorVal);
    setNewColorKey("");
    setIsAddingColor(false);
  };

  const handleAddTypography = () => {
    if (!newTypoKey.trim()) return;
    const cleanKey = newTypoKey.trim().toLowerCase().replace(/\s+/g, "-");
    setTypographyToken(cleanKey, {
      fontFamily: newTypoFamily,
      fontSize: newTypoSize,
      fontWeight: newTypoWeight,
      lineHeight: newTypoLineHeight,
    });
    setNewTypoKey("");
    setIsAddingTypo(false);
  };

  const handleAddSpacing = () => {
    if (!newSpacingKey.trim()) return;
    const cleanKey = newSpacingKey.trim().toLowerCase().replace(/\s+/g, "-");
    setSpacingToken(cleanKey, newSpacingVal);
    setNewSpacingKey("");
    setIsAddingSpacing(false);
  };

  const handleAddRadius = () => {
    if (!newRadiusKey.trim()) return;
    const cleanKey = newRadiusKey.trim().toLowerCase().replace(/\s+/g, "-");
    setRadiusToken(cleanKey, newRadiusVal);
    setNewRadiusKey("");
    setIsAddingRadius(false);
  };

  const handleAddShadow = () => {
    if (!newShadowKey.trim()) return;
    const cleanKey = newShadowKey.trim().toLowerCase().replace(/\s+/g, "-");
    setShadowToken(cleanKey, newShadowVal);
    setNewShadowKey("");
    setIsAddingShadow(false);
  };

  const handleAddFont = () => {
    if (!newFontKey.trim()) return;
    const cleanKey = newFontKey.trim().toLowerCase().replace(/\s+/g, "-");
    loadGoogleFont(newFontFamily);
    setFontToken(cleanKey, {
      family: newFontFamily,
      fallback: newFontFallback,
      weights: [400, 500, 600, 700],
    });
    setNewFontKey("");
    setIsAddingFont(false);
  };

  const handleAddVar = () => {
    if (!newVarKey.trim()) return;
    const cleanKey = newVarKey.startsWith("--") ? newVarKey.trim() : `--${newVarKey.trim()}`;
    setVariableToken(cleanKey, newVarVal || "initial");
    setNewVarKey("");
    setNewVarVal("");
    setIsAddingVar(false);
  };

  return (
    <div className="flex flex-col text-foreground">
      {/* Sticky Header with Search & Reset */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs p-3 border-b border-border/50 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <Sparkles className="size-3.5 text-amber-500" />
            <span>Global Design Tokens</span>
          </div>
          <Button
            variant="ghost"
            size="xs"
            onClick={loadDefaultTokenPresets}
            className="h-6 text-[11px] text-muted-foreground hover:text-foreground px-2 cursor-pointer gap-1"
            title="Reset to default design system tokens"
          >
            <RotateCcw className="size-2.5" />
            <span>Reset Presets</span>
          </Button>
        </div>

        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tokens & variables..."
            className="h-8 text-xs font-normal pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["colors", "typography"]}
        className="w-full"
      >
        {/* 1. COLOR PALETTE */}
        {(filteredColors.length > 0 || !q) && (
          <AccordionItem value="colors" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Palette className="size-3.5 text-pink-500" />
                <span>Colors ({filteredColors.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Brand & UI colors</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsAddingColor(!isAddingColor)}
                  className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
                >
                  <Plus className="size-3 text-pink-500" /> Add Color
                </Button>
              </div>

              {isAddingColor && (
                <div className="p-2.5 rounded-lg border border-border bg-secondary/30 space-y-2 animate-in fade-in-0 duration-150">
                  <div className="flex items-center gap-2">
                    <Input
                      value={newColorKey}
                      onChange={(e) => setNewColorKey(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddColor(); }}
                      placeholder="token-name (e.g. brand-accent)"
                      className="h-7 text-xs flex-1"
                      autoFocus
                    />
                    <input
                      type="color"
                      value={newColorVal}
                      onChange={(e) => setNewColorVal(e.target.value)}
                      className="size-7 rounded border border-border cursor-pointer bg-transparent"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="xs" onClick={() => setIsAddingColor(false)} className="h-6 text-xs">
                      Cancel
                    </Button>
                    <Button size="xs" onClick={handleAddColor} className="h-6 text-xs bg-pink-600 hover:bg-pink-500 text-white">
                      Save
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {filteredColors.length === 0 && (
                  <p className="col-span-2 text-center text-[11px] text-muted-foreground py-3">
                    No color tokens yet. Click "Add Color" to create one.
                  </p>
                )}
                {filteredColors.map(([name, hex]) => (
                  <div
                    key={name}
                    className="group relative flex items-center justify-between p-1.5 rounded-md border border-border/80 bg-card/60 hover:bg-card text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="relative shrink-0 size-6 rounded border border-border overflow-hidden shadow-xs">
                        <input
                          type="color"
                          value={hex.startsWith("#") ? hex : "#3b82f6"}
                          onChange={(e) => setColorToken(name, e.target.value)}
                          className="absolute inset-0 size-full opacity-0 cursor-pointer"
                        />
                        <div className="size-full" style={{ backgroundColor: hex }} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[11px] font-medium text-foreground truncate">{name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground uppercase truncate">{hex}</span>
                      </div>
                    </div>

                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`var(--color-${name})`, `color-${name}`)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy CSS var"
                      >
                        {copiedKey === `color-${name}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeColorToken(name)}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete token"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 2. TYPOGRAPHY PRESETS */}
        {(filteredTypography.length > 0 || !q) && (
          <AccordionItem value="typography" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Type className="size-3.5 text-purple-500" />
                <span>Typography Presets ({filteredTypography.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Text hierarchy presets</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsAddingTypo(!isAddingTypo)}
                  className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
                >
                  <Plus className="size-3 text-purple-500" /> Add Preset
                </Button>
              </div>

              {isAddingTypo && (
                <div className="p-2.5 rounded-lg border border-border bg-secondary/30 space-y-2 animate-in fade-in-0 duration-150">
                  <Input
                    value={newTypoKey}
                    onChange={(e) => setNewTypoKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddTypography(); }}
                    placeholder="Preset name (e.g. hero-title)"
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <FontFamilyPicker
                    value={newTypoFamily}
                    onChange={setNewTypoFamily}
                    fontTokens={fonts}
                  />
                  <div className="grid grid-cols-3 gap-1.5">
                    <Input
                      value={newTypoSize}
                      onChange={(e) => setNewTypoSize(e.target.value)}
                      placeholder="Size (e.g. 24px)"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={newTypoWeight}
                      onChange={(e) => setNewTypoWeight(e.target.value)}
                      placeholder="Weight (600)"
                      className="h-7 text-xs"
                    />
                    <Input
                      value={newTypoLineHeight}
                      onChange={(e) => setNewTypoLineHeight(e.target.value)}
                      placeholder="Line Height (1.3)"
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="xs" onClick={() => setIsAddingTypo(false)} className="h-6 text-xs">
                      Cancel
                    </Button>
                    <Button size="xs" onClick={handleAddTypography} className="h-6 text-xs bg-purple-600 hover:bg-purple-500 text-white">
                      Save Preset
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {filteredTypography.length === 0 && (
                  <p className="text-center text-[11px] text-muted-foreground py-3">
                    No typography presets yet. Click "Add Preset" to create one.
                  </p>
                )}
                {filteredTypography.map(([name, token]) => (
                  <div
                    key={name}
                    className="group p-2.5 rounded-md border border-border/80 bg-card/60 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-semibold text-foreground">{name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-secondary font-mono text-muted-foreground">
                          {token.fontSize} / {token.fontWeight}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => removeTypographyToken(name)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-destructive cursor-pointer transition-opacity"
                          title="Delete token"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <Input
                        value={token.fontSize || "16px"}
                        onChange={(e) => setTypographyToken(name, { ...token, fontSize: e.target.value })}
                        placeholder="Size (e.g. 24px)"
                        className="h-6 text-[11px]"
                      />
                      <Input
                        value={token.fontWeight ? String(token.fontWeight) : "400"}
                        onChange={(e) => setTypographyToken(name, { ...token, fontWeight: e.target.value })}
                        placeholder="Weight (e.g. 600)"
                        className="h-6 text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 3. BORDER RADII (CORNERS) */}
        {(filteredRadii.length > 0 || !q) && (
          <AccordionItem value="radii" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <SlidersHorizontal className="size-3.5 text-blue-500" />
                <span>Border Radii ({filteredRadii.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Corner radius scale</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsAddingRadius(!isAddingRadius)}
                  className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
                >
                  <Plus className="size-3 text-blue-500" /> Add Radius
                </Button>
              </div>

              {isAddingRadius && (
                <div className="p-2.5 rounded-lg border border-border bg-secondary/30 space-y-2 animate-in fade-in-0 duration-150">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newRadiusKey}
                      onChange={(e) => setNewRadiusKey(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAddRadius(); }}
                      placeholder="Name (e.g. pill, 2xl)"
                      className="h-7 text-xs"
                      autoFocus
                    />
                    <Input
                      value={newRadiusVal}
                      onChange={(e) => setNewRadiusVal(e.target.value)}
                      placeholder="Value (e.g. 18px)"
                      className="h-7 text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="xs" onClick={() => setIsAddingRadius(false)} className="h-6 text-xs">
                      Cancel
                    </Button>
                    <Button size="xs" onClick={handleAddRadius} className="h-6 text-xs bg-blue-600 hover:bg-blue-500 text-white">
                      Save Radius
                    </Button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-1.5">
                {filteredRadii.length === 0 && (
                  <p className="col-span-3 text-center text-[11px] text-muted-foreground py-3">
                    No border radii yet. Click "Add Radius" to create one.
                  </p>
                )}
                {filteredRadii.map(([name, val]) => (
                  <div
                    key={name}
                    className="group relative flex flex-col items-center justify-center p-2 rounded-md border border-border/80 bg-card/60 text-center text-xs hover:bg-card transition-colors"
                  >
                    <div
                      className="size-6 border-2 border-blue-500 bg-blue-500/10 mb-1 transition-all"
                      style={{ borderRadius: String(val) }}
                    />
                    <span className="font-mono text-[11px] font-semibold text-foreground truncate w-full">{name}</span>
                    <Input
                      value={String(val)}
                      onChange={(e) => setRadiusToken(name, e.target.value)}
                      className="h-5 text-[10px] text-center font-mono px-1 mt-1 bg-secondary/50 border-transparent hover:border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeRadiusToken(name)}
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive cursor-pointer transition-opacity"
                      title="Delete radius token"
                    >
                      <Trash2 className="size-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 4. SHADOWS & ELEVATION */}
        {(filteredShadows.length > 0 || !q) && (
          <AccordionItem value="shadows" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Layers className="size-3.5 text-indigo-500" />
                <span>Shadows & Elevation ({filteredShadows.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Elevation & drop shadows</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsAddingShadow(!isAddingShadow)}
                  className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
                >
                  <Plus className="size-3 text-indigo-500" /> Add Shadow
                </Button>
              </div>

              {isAddingShadow && (
                <div className="p-2.5 rounded-lg border border-border bg-secondary/30 space-y-2.5 animate-in fade-in-0 duration-150">
                  <Input
                    value={newShadowKey}
                    onChange={(e) => setNewShadowKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddShadow(); }}
                    placeholder="Token name (e.g. card-hover, glow)"
                    className="h-7 text-xs font-medium"
                    autoFocus
                  />
                  <BoxShadowControl
                    value={newShadowVal}
                    onChange={setNewShadowVal}
                    colorTokens={colors}
                  />
                  <div className="flex justify-end gap-1.5 pt-1">
                    <Button variant="ghost" size="xs" onClick={() => setIsAddingShadow(false)} className="h-6 text-xs">
                      Cancel
                    </Button>
                    <Button size="xs" onClick={handleAddShadow} className="h-6 text-xs bg-indigo-600 hover:bg-indigo-500 text-white">
                      Save Shadow
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {filteredShadows.length === 0 && (
                  <p className="text-center text-[11px] text-muted-foreground py-3">
                    No shadow tokens yet. Click "Add Shadow" to create one.
                  </p>
                )}
                {filteredShadows.map(([name, val]) => (
                  <div
                    key={name}
                    className="group flex items-center justify-between p-2 rounded-md border border-border/80 bg-card/60 hover:bg-card text-xs transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div
                        className="size-7 rounded bg-card border border-border shrink-0"
                        style={{ boxShadow: String(val) }}
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-mono text-xs font-semibold text-foreground truncate">{name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground truncate">{String(val)}</span>
                      </div>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`var(--shadow-${name})`, `shadow-${name}`)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy CSS var"
                      >
                        {copiedKey === `shadow-${name}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeShadowToken(name)}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete token"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 5. PROJECT FONTS */}
        {(filteredFonts.length > 0 || !q) && (
          <AccordionItem value="fonts" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Type className="size-3.5 text-cyan-400" />
                <span>Project Fonts ({filteredFonts.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Web & Google font families</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsAddingFont(!isAddingFont)}
                  className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
                >
                  <Plus className="size-3 text-cyan-400" /> Add Font
                </Button>
              </div>

              {isAddingFont && (
                <div className="p-2.5 rounded-lg border border-border bg-secondary/30 space-y-2 animate-in fade-in-0 duration-150">
                  <Input
                    value={newFontKey}
                    onChange={(e) => setNewFontKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddFont(); }}
                    placeholder="Token key (e.g. heading, display)"
                    className="h-7 text-xs"
                    autoFocus
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <FontFamilyPicker
                      value={newFontFamily}
                      onChange={setNewFontFamily}
                    />
                    <select
                      value={newFontFallback}
                      onChange={(e) => setNewFontFallback(e.target.value)}
                      className="h-8 px-2 text-xs rounded-md border border-border bg-secondary/40 text-foreground"
                    >
                      <option value="sans-serif">sans-serif</option>
                      <option value="serif">serif</option>
                      <option value="monospace">monospace</option>
                      <option value="cursive">cursive</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="xs" onClick={() => setIsAddingFont(false)} className="h-6 text-xs">
                      Cancel
                    </Button>
                    <Button size="xs" onClick={handleAddFont} className="h-6 text-xs bg-cyan-600 hover:bg-cyan-500 text-white">
                      Save Font
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {filteredFonts.length === 0 && (
                  <p className="text-center text-[11px] text-muted-foreground py-3">
                    No project fonts yet. Click "Add Font" to create one.
                  </p>
                )}
                {filteredFonts.map(([name, token]) => (
                  <div
                    key={name}
                    className="group p-2 rounded-md border border-border/80 bg-card/60 flex items-center justify-between gap-2 text-xs hover:bg-card transition-colors"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-mono text-xs font-semibold text-foreground truncate">{name}</span>
                      <span
                        className="text-xs text-muted-foreground truncate"
                        style={{ fontFamily: token.family }}
                      >
                        {token.family}
                      </span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`var(--font-${name})`, `font-${name}`)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy CSS var"
                      >
                        {copiedKey === `font-${name}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFontToken(name)}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete token"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 6. SPACING SCALE */}
        {(filteredSpacing.length > 0 || !q) && (
          <AccordionItem value="spacing" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Maximize className="size-3.5 text-emerald-500" />
                <span>Spacing Scale ({filteredSpacing.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Padding, Margin & Gap scales</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsAddingSpacing(!isAddingSpacing)}
                  className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
                >
                  <Plus className="size-3 text-emerald-500" /> Add Step
                </Button>
              </div>

              {isAddingSpacing && (
                <div className="p-2 rounded-lg border border-border bg-secondary/30 flex items-center gap-2">
                  <Input
                    value={newSpacingKey}
                    onChange={(e) => setNewSpacingKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddSpacing(); }}
                    placeholder="Step (e.g. 4xl)"
                    className="h-7 text-xs flex-1"
                    autoFocus
                  />
                  <Input
                    value={newSpacingVal}
                    onChange={(e) => setNewSpacingVal(e.target.value)}
                    placeholder="Value (e.g. 64px)"
                    className="h-7 text-xs w-20"
                  />
                  <Button size="xs" onClick={handleAddSpacing} className="h-7 text-xs">
                    Save
                  </Button>
                </div>
              )}

              <div className="grid grid-cols-2 gap-1.5">
                {filteredSpacing.length === 0 && (
                  <p className="col-span-2 text-center text-[11px] text-muted-foreground py-3">
                    No spacing tokens yet. Click "Add Step" to create one.
                  </p>
                )}
                {filteredSpacing.map(([name, val]) => (
                  <div
                    key={name}
                    className="group flex items-center justify-between p-1.5 rounded-md border border-border/80 bg-card/60 text-xs"
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="font-mono text-xs font-semibold text-foreground">{name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{String(val)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => removeSpacingToken(name)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-2.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}

        {/* 7. CUSTOM CSS VARIABLES */}
        {(filteredVars.length > 0 || !q) && (
          <AccordionItem value="variables" className="border-b border-border/50">
            <AccordionTrigger className="px-3.5 py-2.5 hover:no-underline hover:bg-secondary/20">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Code2 className="size-3.5 text-cyan-400" />
                <span>CSS Variables ({filteredVars.length})</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-3.5 pt-1 pb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Custom project-wide variables</span>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => setIsAddingVar(!isAddingVar)}
                  className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
                >
                  <Plus className="size-3 text-cyan-400" /> Add Var
                </Button>
              </div>

              {isAddingVar && (
                <div className="p-2.5 rounded-lg border border-border bg-secondary/30 space-y-2">
                  <Input
                    value={newVarKey}
                    onChange={(e) => setNewVarKey(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") handleAddVar(); }}
                    placeholder="--var-name (e.g. --brand-glow)"
                    className="h-7 text-xs font-mono"
                    autoFocus
                  />
                  <Input
                    value={newVarVal}
                    onChange={(e) => setNewVarVal(e.target.value)}
                    placeholder="Value (e.g. 0 0 20px #3b82f6)"
                    className="h-7 text-xs font-mono"
                  />
                  <div className="flex justify-end gap-1.5">
                    <Button variant="ghost" size="xs" onClick={() => setIsAddingVar(false)} className="h-6 text-xs">
                      Cancel
                    </Button>
                    <Button size="xs" onClick={handleAddVar} className="h-6 text-xs bg-cyan-600 hover:bg-cyan-500 text-white">
                      Save
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                {filteredVars.length === 0 && (
                  <p className="text-center text-[11px] text-muted-foreground py-3">
                    No custom variables yet. Click "Add Var" to create one.
                  </p>
                )}
                {filteredVars.map(([name, val]) => (
                  <div
                    key={name}
                    className="group p-2 rounded-md border border-border/80 bg-card/60 flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-mono text-xs font-semibold text-foreground truncate">{name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground truncate">{String(val)}</span>
                    </div>
                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => copyToClipboard(`var(${name})`, `var-${name}`)}
                        className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Copy variable"
                      >
                        {copiedKey === `var-${name}` ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeVariableToken(name)}
                        className="p-1 text-muted-foreground hover:text-destructive cursor-pointer"
                        title="Delete variable"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        )}
      </Accordion>
    </div>
  );
};
