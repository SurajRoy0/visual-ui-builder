"use client";

import React, { useState } from "react";
import { Sliders, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface BoxShadowControlProps {
  value: string;
  onChange: (value: string) => void;
  shadowTokens?: Record<string, string>;
  colorTokens?: Record<string, string>;
  className?: string;
}

const PRESET_SHADOWS = [
  { id: "none", name: "None", value: "none" },
  { id: "sm", name: "Subtle (SM)", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)" },
  { id: "md", name: "Soft (MD)", value: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)" },
  { id: "lg", name: "Elevated (LG)", value: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)" },
  { id: "xl", name: "Dramatic (XL)", value: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" },
  { id: "2xl", name: "Floating 3D", value: "0 25px 50px -12px rgb(0 0 0 / 0.25)" },
  { id: "glow-blue", name: "Blue Glow", value: "0 0 16px 2px rgba(59, 130, 246, 0.5)" },
  { id: "glow-purple", name: "Purple Glow", value: "0 0 16px 2px rgba(168, 85, 247, 0.5)" },
  { id: "glow-pink", name: "Pink Glow", value: "0 0 16px 2px rgba(236, 72, 153, 0.5)" },
  { id: "inner-soft", name: "Inner Soft", value: "inset 0 2px 4px 0 rgb(0 0 0 / 0.06)" },
];

/**
 * Parses a single-layer box-shadow string into components
 */
function parseBoxShadow(str: string) {
  const isInset = str.includes("inset");
  const cleanStr = str.replace(/\binset\b/g, "").trim();

  let color = "rgba(0, 0, 0, 0.15)";
  const colorMatch = cleanStr.match(/(rgba?\([^)]+\)|#[0-9a-fA-F]{3,8}|var\(--[a-zA-Z0-9-]+\))/);
  if (colorMatch) {
    color = colorMatch[0];
  }

  const rest = cleanStr.replace(color, "").trim();
  const numMatches = rest.match(/-?\d+(?:\.\d+)?(?:px)?/g) || [];
  const numbers = numMatches.map((n) => parseFloat(n) || 0);

  const x = numbers[0] ?? 0;
  const y = numbers[1] ?? 4;
  const blur = numbers[2] ?? 8;
  const spread = numbers[3] ?? 0;

  // Parse opacity from rgba color
  let opacity = 15; // default 15%
  const rgbaMatch = color.match(/rgba?\([^)]*[,/]\s*([\d.]+)\s*\)/);
  if (rgbaMatch) {
    const a = parseFloat(rgbaMatch[1]);
    opacity = Math.round((a <= 1 ? a : a / 100) * 100);
  }

  return { isInset, x, y, blur, spread, color, opacity };
}

export const BoxShadowControl: React.FC<BoxShadowControlProps> = ({
  value,
  onChange,
  shadowTokens = {},
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"builder" | "presets" | "custom">("builder");

  const tokenMatch = value.match(/var\(--shadow-([^)]+)\)/);
  const activeTokenKey = tokenMatch ? tokenMatch[1] : null;

  // Derive parsed components reactively from value
  const parsed = React.useMemo(() => {
    if (!value || value === "none" || value.startsWith("var(")) {
      return { isInset: false, x: 0, y: 4, blur: 8, spread: 0, color: "rgba(0, 0, 0, 0.15)", opacity: 15 };
    }
    return parseBoxShadow(value);
  }, [value]);

  const assembleShadow = (opts: {
    x: number;
    y: number;
    blur: number;
    spread: number;
    isInset: boolean;
    color: string;
  }) => {
    const prefix = opts.isInset ? "inset " : "";
    return `${prefix}${opts.x}px ${opts.y}px ${opts.blur}px ${opts.spread}px ${opts.color}`;
  };

  const handleSliderChange = (
    param: "x" | "y" | "blur" | "spread",
    val: number
  ) => {
    const updated = {
      ...parsed,
      [param]: val,
    };
    onChange(assembleShadow(updated));
  };

  const handleInsetToggle = (checked: boolean) => {
    const updated = {
      ...parsed,
      isInset: checked,
    };
    onChange(assembleShadow(updated));
  };

  const handleOpacityChange = (opacityPercent: number) => {
    const a = (opacityPercent / 100).toFixed(2);
    const rgba = `rgba(0, 0, 0, ${a})`;
    const updated = {
      ...parsed,
      color: rgba,
    };
    onChange(assembleShadow(updated));
  };

  const handleSelectPreset = (presetVal: string) => {
    onChange(presetVal);
  };

  const handleSelectToken = (tokenKey: string) => {
    onChange(`var(--shadow-${tokenKey})`);
  };

  const handleClear = () => {
    onChange("none");
  };

  const displayLabel = !value || value === "none"
    ? "None"
    : activeTokenKey
    ? `Token: ${activeTokenKey}`
    : value.length > 24
    ? `${value.substring(0, 24)}...`
    : value;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium text-muted-foreground">Box Shadow</Label>
        {value && value !== "none" && (
          <button
            type="button"
            onClick={handleClear}
            className="text-[10px] text-muted-foreground hover:text-destructive cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger className="h-8 w-full px-2.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary/70 flex items-center justify-between text-xs transition-colors cursor-pointer text-left gap-2">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div
              className="size-4 rounded-xs border border-border/80 bg-card shrink-0"
              style={{ boxShadow: value && value !== "none" ? value : undefined }}
            />
            <span className="truncate font-mono text-[11px] text-foreground">
              {displayLabel}
            </span>
          </div>
          <Sliders className="size-3 text-muted-foreground shrink-0" />
        </PopoverTrigger>

        <PopoverContent className="w-80 p-3 space-y-3 bg-popover text-popover-foreground border-border shadow-2xl z-50" align="end">
          {/* Live Preview Box */}
          <div className="h-20 rounded-lg bg-secondary/40 border border-border/60 flex items-center justify-center">
            <div
              className="px-4 py-1.5 rounded bg-card border border-border text-[10px] font-medium text-foreground transition-all duration-150"
              style={{ boxShadow: value && value !== "none" ? value : undefined }}
            >
              Shadow Preview
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)} className="w-full flex-col">
            <TabsList className="w-full h-7 grid grid-cols-3 bg-secondary/60 p-0.5 rounded-md">
              <TabsTrigger value="builder" className="text-[10px] h-6">
                Visual
              </TabsTrigger>
              <TabsTrigger value="presets" className="text-[10px] h-6">
                Presets
              </TabsTrigger>
              <TabsTrigger value="custom" className="text-[10px] h-6">
                CSS Code
              </TabsTrigger>
            </TabsList>

            {/* TAB 1: Visual Builder */}
            <TabsContent value="builder" className="space-y-2.5 pt-2 outline-none">
              {/* X & Y Offsets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">X Offset</span>
                  <span className="font-mono text-foreground">{parsed.x}px</span>
                </div>
                <Slider
                  min={-50}
                  max={50}
                  step={1}
                  value={[parsed.x]}
                  onValueChange={(v) => handleSliderChange("x", Array.isArray(v) ? v[0] : (typeof v === "number" ? v : 0))}
                  className="py-1"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Y Offset</span>
                  <span className="font-mono text-foreground">{parsed.y}px</span>
                </div>
                <Slider
                  min={-50}
                  max={50}
                  step={1}
                  value={[parsed.y]}
                  onValueChange={(v) => handleSliderChange("y", Array.isArray(v) ? v[0] : (typeof v === "number" ? v : 0))}
                  className="py-1"
                />
              </div>

              {/* Blur & Spread */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Blur Radius</span>
                  <span className="font-mono text-foreground">{parsed.blur}px</span>
                </div>
                <Slider
                  min={0}
                  max={80}
                  step={1}
                  value={[parsed.blur]}
                  onValueChange={(v) => handleSliderChange("blur", Array.isArray(v) ? v[0] : (typeof v === "number" ? v : 0))}
                  className="py-1"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Spread Radius</span>
                  <span className="font-mono text-foreground">{parsed.spread}px</span>
                </div>
                <Slider
                  min={-30}
                  max={40}
                  step={1}
                  value={[parsed.spread]}
                  onValueChange={(v) => handleSliderChange("spread", Array.isArray(v) ? v[0] : (typeof v === "number" ? v : 0))}
                  className="py-1"
                />
              </div>

              {/* Inset Toggle */}
              <div className="flex items-center justify-between py-1 border-t border-border/50">
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium text-foreground">Inner Shadow (Inset)</span>
                  <span className="text-[9px] text-muted-foreground">Render inside element boundary</span>
                </div>
                <Switch checked={parsed.isInset} onCheckedChange={handleInsetToggle} />
              </div>

              {/* Shadow Opacity */}
              <div className="space-y-1.5 pt-1 border-t border-border/50">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-muted-foreground">Shadow Darkness</span>
                  <span className="font-mono text-foreground">{parsed.opacity}%</span>
                </div>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[parsed.opacity]}
                  onValueChange={(v) => handleOpacityChange(Array.isArray(v) ? v[0] : (typeof v === "number" ? v : 20))}
                  className="py-1"
                />
              </div>
            </TabsContent>

            {/* TAB 2: Presets & Tokens */}
            <TabsContent value="presets" className="space-y-2.5 pt-2 outline-none">
              {/* Global Project Shadow Tokens */}
              {Object.keys(shadowTokens).length > 0 && (
                <div className="space-y-1 pb-2 border-b border-border">
                  <div className="flex items-center gap-1 text-[10px] font-semibold text-amber-500">
                    <Sparkles className="size-2.5" />
                    <span>Project Shadow Tokens</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {Object.entries(shadowTokens).map(([name, val]) => {
                      const isSelected = value === `var(--shadow-${name})`;
                      return (
                        <button
                          key={name}
                          type="button"
                          onClick={() => handleSelectToken(name)}
                          className={`flex items-center justify-between p-1.5 rounded border text-xs cursor-pointer text-left transition-colors ${
                            isSelected ? "border-amber-500 bg-amber-500/10 text-amber-500" : "border-border/70 hover:bg-secondary/70"
                          }`}
                        >
                          <span className="truncate font-medium">{name}</span>
                          <div
                            className="size-3.5 rounded bg-card border border-border shrink-0"
                            style={{ boxShadow: val }}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Standard Presets */}
              <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Curated Presets
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  {PRESET_SHADOWS.map((preset) => {
                    const isSelected = value === preset.value;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset.value)}
                        className={`flex items-center justify-between p-1.5 rounded border text-xs cursor-pointer text-left transition-colors ${
                          isSelected ? "border-primary bg-primary/10 text-primary font-medium" : "border-border/70 hover:bg-secondary/70"
                        }`}
                      >
                        <span className="truncate text-[11px]">{preset.name}</span>
                        <div
                          className="size-3.5 rounded bg-card border border-border shrink-0"
                          style={{ boxShadow: preset.value !== "none" ? preset.value : undefined }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: Raw CSS Input */}
            <TabsContent value="custom" className="space-y-2 pt-2 outline-none">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Custom CSS box-shadow</Label>
                <Input
                  value={value || ""}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder="e.g. 0 10px 25px -5px rgba(0,0,0,0.2)"
                  className="h-8 text-xs font-mono"
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Supports multi-layer shadows separated by commas or CSS variables like <code>var(--shadow-lg)</code>.
              </p>
            </TabsContent>
          </Tabs>
        </PopoverContent>
      </Popover>
    </div>
  );
};
