"use client";

import React, { useState } from "react";
import {
  Palette,
  Type,
  Maximize,
  Sparkles,
  SlidersHorizontal,
  Plus,
  Search,
  Code2,
  Trash2,
  Check,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { ProjectStyles, TypographyToken, FontToken } from "@/types/project";

const DEFAULT_PROJECT_STYLES: ProjectStyles = {
  colors: {
    primary: "#3b82f6",
    secondary: "#64748b",
    accent: "#8b5cf6",
    background: "#09090b",
    foreground: "#fafafa",
    muted: "#71717a",
    border: "#27272a",
    card: "#18181b",
  },
  typography: {
    h1: { fontFamily: "Inter", fontSize: "36px", fontWeight: "700", lineHeight: "1.2", letterSpacing: "-0.02em" },
    h2: { fontFamily: "Inter", fontSize: "28px", fontWeight: "600", lineHeight: "1.25", letterSpacing: "-0.01em" },
    h3: { fontFamily: "Inter", fontSize: "20px", fontWeight: "600", lineHeight: "1.3" },
    body: { fontFamily: "Inter", fontSize: "14px", fontWeight: "400", lineHeight: "1.5" },
    caption: { fontFamily: "Inter", fontSize: "12px", fontWeight: "400", lineHeight: "1.4" },
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    "2xl": "48px",
  },
  radii: {
    none: "0px",
    sm: "4px",
    md: "8px",
    lg: "12px",
    xl: "16px",
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
    glow: "0 0 20px rgba(59, 130, 246, 0.35)",
  },
  fonts: {
    sans: { family: "Inter", fallback: "sans-serif", weights: [400, 500, 600, 700] },
    display: { family: "Outfit", fallback: "sans-serif", weights: [600, 700, 800] },
    mono: { family: "JetBrains Mono", fallback: "monospace", weights: [400, 500] },
  },
  variables: {
    "--brand-gradient": "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
    "--glass-backdrop": "blur(12px)",
    "--transition-smooth": "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
  },
};

export const GlobalStylesInspector: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [styles, setStyles] = useState<ProjectStyles>(DEFAULT_PROJECT_STYLES);
  const [newColorKey, setNewColorKey] = useState("");
  const [newColorVal, setNewColorVal] = useState("#10b981");
  const [isAddingColor, setIsAddingColor] = useState(false);

  const [newVarKey, setNewVarKey] = useState("");
  const [newVarVal, setNewVarVal] = useState("");
  const [isAddingVar, setIsAddingVar] = useState(false);

  const q = searchQuery.toLowerCase().trim();

  // Color actions
  const handleColorChange = (key: string, val: string) => {
    setStyles((prev) => ({
      ...prev,
      colors: { ...prev.colors, [key]: val },
    }));
  };

  const handleAddColor = () => {
    if (!newColorKey.trim()) return;
    const cleanKey = newColorKey.trim().toLowerCase().replace(/\s+/g, "-");
    setStyles((prev) => ({
      ...prev,
      colors: { ...prev.colors, [cleanKey]: newColorVal },
    }));
    setNewColorKey("");
    setIsAddingColor(false);
  };

  const handleDeleteColor = (key: string) => {
    setStyles((prev) => {
      const next = { ...prev.colors };
      delete next[key];
      return { ...prev, colors: next };
    });
  };

  // Variable actions
  const handleVarChange = (key: string, val: string) => {
    setStyles((prev) => ({
      ...prev,
      variables: { ...prev.variables, [key]: val },
    }));
  };

  const handleAddVar = () => {
    if (!newVarKey.trim()) return;
    const cleanKey = newVarKey.startsWith("--") ? newVarKey.trim() : `--${newVarKey.trim()}`;
    setStyles((prev) => ({
      ...prev,
      variables: { ...prev.variables, [cleanKey]: newVarVal || "initial" },
    }));
    setNewVarKey("");
    setNewVarVal("");
    setIsAddingVar(false);
  };

  const handleDeleteVar = (key: string) => {
    setStyles((prev) => {
      const next = { ...prev.variables };
      delete next[key];
      return { ...prev, variables: next };
    });
  };

  // Filter helpers
  const matchesFilter = (label: string, value: string = "") => {
    if (!q) return true;
    return label.toLowerCase().includes(q) || value.toLowerCase().includes(q);
  };

  const filteredColors = Object.entries(styles.colors).filter(([k, v]) => matchesFilter(k, v));
  const filteredTypography = Object.entries(styles.typography).filter(([k, v]) =>
    matchesFilter(k, `${v.fontFamily || ""} ${v.fontSize || ""}`)
  );
  const filteredSpacing = Object.entries(styles.spacing).filter(([k, v]) =>
    matchesFilter(k, String(v))
  );
  const filteredRadii = Object.entries(styles.radii).filter(([k, v]) =>
    matchesFilter(k, String(v))
  );
  const filteredShadows = Object.entries(styles.shadows).filter(([k, v]) => matchesFilter(k, v));
  const filteredVars = Object.entries(styles.variables).filter(([k, v]) =>
    matchesFilter(k, String(v))
  );

  return (
    <div className="flex flex-col divide-y divide-border">
      {/* Search Header */}
      <div className="p-3 bg-secondary/20">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search global styles & tokens..."
            className="h-7 text-xs pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* 1. Colors Palette */}
      {(filteredColors.length > 0 || !q) && (
        <section className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Palette className="size-3.5 text-blue" />
              <span>Color Palette Tokens</span>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsAddingColor(!isAddingColor)}
              className="h-5 text-[10px] gap-1 px-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="size-3" />
              Add
            </Button>
          </div>

          {/* New Color Token Form */}
          {isAddingColor && (
            <div className="p-2 rounded-md bg-secondary/50 border border-border space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  value={newColorKey}
                  onChange={(e) => setNewColorKey(e.target.value)}
                  placeholder="token-name (e.g. brand-accent)"
                  className="h-7 text-xs flex-1"
                />
                <input
                  type="color"
                  value={newColorVal}
                  onChange={(e) => setNewColorVal(e.target.value)}
                  className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                />
              </div>
              <div className="flex justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsAddingColor(false)}
                  className="h-6 text-[10px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={handleAddColor}
                  className="h-6 text-[10px] gap-1"
                >
                  <Check className="size-3" /> Save Token
                </Button>
              </div>
            </div>
          )}

          {/* Color Tokens List */}
          <div className="grid grid-cols-2 gap-2">
            {filteredColors.map(([key, val]) => (
              <div
                key={key}
                className="group flex items-center justify-between p-1.5 rounded-md border border-border bg-card/60 hover:bg-card text-xs transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="relative shrink-0">
                    <input
                      type="color"
                      value={val.startsWith("#") ? val : "#3b82f6"}
                      onChange={(e) => handleColorChange(key, e.target.value)}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <div
                      className="w-5 h-5 rounded border border-border shadow-2xs"
                      style={{ backgroundColor: val }}
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[11px] font-medium text-foreground truncate">{key}</span>
                    <span className="text-[9px] font-mono text-muted-foreground uppercase truncate">
                      {val}
                    </span>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDeleteColor(key)}
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 2. Typography & Fonts */}
      {(filteredTypography.length > 0 || !q) && (
        <section className="p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Type className="size-3.5 text-purple-500" />
            <span>Typography Hierarchy</span>
          </div>

          <div className="space-y-1.5">
            {filteredTypography.map(([tokenName, token]) => (
              <div
                key={tokenName}
                className="p-2 rounded-md border border-border bg-card/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-foreground uppercase w-12">
                    {tokenName}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {token.fontSize} / {token.fontWeight} / {token.lineHeight}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: token.fontSize ? `min(${token.fontSize}, 16px)` : "12px",
                    fontWeight: token.fontWeight || "normal",
                  }}
                  className="text-foreground truncate max-w-24 text-right"
                >
                  Aa
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 3. Spacing Scale */}
      {(filteredSpacing.length > 0 || !q) && (
        <section className="p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Maximize className="size-3.5 text-emerald-500" />
            <span>Spacing Scale</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {filteredSpacing.map(([key, val]) => (
              <div
                key={key}
                className="p-1.5 rounded-md border border-border bg-card/60 flex flex-col items-center justify-center text-center"
              >
                <span className="text-[10px] font-mono font-medium text-foreground">{key}</span>
                <span className="text-[10px] font-mono text-muted-foreground">{String(val)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Border Radius (Radii) */}
      {(filteredRadii.length > 0 || !q) && (
        <section className="p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <SlidersHorizontal className="size-3.5 text-amber-500" />
            <span>Border Radii</span>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {filteredRadii.map(([key, val]) => (
              <div
                key={key}
                className="p-1.5 rounded-md border border-border bg-card/60 flex flex-col items-center justify-center text-center"
              >
                <div
                  className="w-5 h-5 border border-foreground/40 bg-secondary/50 mb-1"
                  style={{ borderRadius: String(val) }}
                />
                <span className="text-[10px] font-mono font-medium text-foreground">{key}</span>
                <span className="text-[9px] font-mono text-muted-foreground">{String(val)}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Custom CSS Variables */}
      {(filteredVars.length > 0 || !q) && (
        <section className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Code2 className="size-3.5 text-blue" />
              <span>Project CSS Variables</span>
            </div>
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setIsAddingVar(!isAddingVar)}
              className="h-5 text-[10px] gap-1 px-1.5 text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="size-3" />
              Add
            </Button>
          </div>

          {/* New Variable Form */}
          {isAddingVar && (
            <div className="p-2 rounded-md bg-secondary/50 border border-border space-y-2">
              <Input
                value={newVarKey}
                onChange={(e) => setNewVarKey(e.target.value)}
                placeholder="--var-name (e.g. --brand-glow)"
                className="h-7 text-xs"
              />
              <Input
                value={newVarVal}
                onChange={(e) => setNewVarVal(e.target.value)}
                placeholder="CSS Value (e.g. 0 0 20px #3b82f6)"
                className="h-7 text-xs"
              />
              <div className="flex justify-end gap-1.5">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setIsAddingVar(false)}
                  className="h-6 text-[10px]"
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="xs"
                  onClick={handleAddVar}
                  className="h-6 text-[10px] gap-1"
                >
                  <Check className="size-3" /> Save Variable
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            {filteredVars.map(([key, val]) => (
              <div
                key={key}
                className="group p-2 rounded-md border border-border bg-card/60 flex items-center justify-between gap-2 text-xs"
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="font-mono text-[10px] font-semibold text-foreground truncate">
                    {key}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground truncate">
                    {String(val)}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => handleDeleteVar(key)}
                  className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive cursor-pointer shrink-0"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Empty Search Result */}
      {filteredColors.length === 0 &&
        filteredTypography.length === 0 &&
        filteredSpacing.length === 0 &&
        filteredRadii.length === 0 &&
        filteredVars.length === 0 && (
          <div className="text-center py-8 text-xs text-muted-foreground">
            No global styles or tokens matching &quot;{searchQuery}&quot;
          </div>
        )}
    </div>
  );
};
