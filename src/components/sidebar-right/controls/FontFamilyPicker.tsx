"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Check, ChevronDown, Sparkles, Type, Search } from "lucide-react";
import { POPULAR_FONTS, loadGoogleFont } from "@/lib/fontLoader";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface FontFamilyPickerProps {
  value: string;
  onChange: (family: string) => void;
  fontTokens?: Record<string, { family: string; fallback?: string }>;
  className?: string;
}

export const FontFamilyPicker: React.FC<FontFamilyPickerProps> = ({
  value,
  onChange,
  fontTokens = {},
  className = "",
}) => {
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup hover timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const handleFontHover = useCallback((family: string, isGoogleFont?: boolean) => {
    if (!isGoogleFont) return;
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    hoverTimerRef.current = setTimeout(() => {
      loadGoogleFont(family);
    }, 250);
  }, []);

  const handleFontLeave = useCallback(() => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
  }, []);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [customFont, setCustomFont] = useState("");

  const currentFamily = value || "Inter";

  // Check if current value is a CSS var token
  const tokenMatch = currentFamily.match(/var\(--font-([^)]+)\)/);
  const activeTokenKey = tokenMatch ? tokenMatch[1] : null;

  const handleSelectFont = (fontFamily: string) => {
    loadGoogleFont(fontFamily);
    onChange(fontFamily);
    setOpen(false);
  };

  const handleSelectToken = (tokenName: string, tokenFamily?: string) => {
    if (tokenFamily) loadGoogleFont(tokenFamily);
    onChange(`var(--font-${tokenName})`);
    setOpen(false);
  };

  const handleApplyCustom = () => {
    if (!customFont.trim()) return;
    loadGoogleFont(customFont.trim());
    onChange(customFont.trim());
    setCustomFont("");
    setOpen(false);
  };

  const q = searchQuery.toLowerCase().trim();
  const filteredFonts = POPULAR_FONTS.filter(
    (f) =>
      !q ||
      f.family.toLowerCase().includes(q) ||
      f.category.toLowerCase().includes(q)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={`h-8 w-full px-2.5 rounded-md border border-border bg-secondary/40 hover:bg-secondary/70 flex items-center justify-between text-xs transition-colors cursor-pointer text-left ${className}`}
      >
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <Type className="size-3 text-purple-400 shrink-0" />
          <span
            className="truncate font-medium text-foreground text-xs"
            style={{ fontFamily: currentFamily }}
          >
            {activeTokenKey ? `Token: ${activeTokenKey}` : currentFamily}
          </span>
        </div>
        <ChevronDown className="size-3 text-muted-foreground shrink-0 ml-1" />
      </PopoverTrigger>

      <PopoverContent className="w-64 p-2 space-y-2 bg-popover text-popover-foreground border-border shadow-xl z-50" align="start">
        {/* Search */}
        <div className="relative">
          <Search className="size-3 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fonts..."
            className="h-7 text-xs pl-7 bg-secondary/50"
            autoFocus
          />
        </div>

        {/* Global Project Font Tokens */}
        {Object.keys(fontTokens).length > 0 && !q && (
          <div className="space-y-1 pb-1.5 border-b border-border">
            <div className="flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-amber-500">
              <Sparkles className="size-2.5" />
              <span>Project Font Tokens</span>
            </div>
            {Object.entries(fontTokens).map(([name, token]) => {
              const isSelected = currentFamily === `var(--font-${name})`;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => handleSelectToken(name, token.family)}
                  className={`w-full flex items-center justify-between px-2 py-1 rounded text-xs cursor-pointer text-left transition-colors ${
                    isSelected ? "bg-amber-500/15 text-amber-500 font-semibold" : "hover:bg-secondary"
                  }`}
                  style={{ fontFamily: `var(--font-${name}), ${token.fallback || "sans-serif"}` }}
                >
                  <div className="flex flex-col min-w-0">
                    <span className="truncate">{name}</span>
                    <span className="text-[10px] text-muted-foreground truncate font-sans">{token.family}</span>
                  </div>
                  {isSelected && <Check className="size-3 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}

        {/* Popular Google Fonts & System Fonts */}
        <div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
          <div className="px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Web & Google Fonts
          </div>
          {filteredFonts.map((f) => {
            const isSelected = currentFamily.toLowerCase() === f.family.toLowerCase();
            return (
              <button
                key={f.family}
                type="button"
                onClick={() => handleSelectFont(f.family)}
                onMouseEnter={() => handleFontHover(f.family, f.isGoogleFont)}
                onMouseLeave={handleFontLeave}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs cursor-pointer text-left transition-colors ${
                  isSelected ? "bg-primary/15 text-primary font-semibold" : "hover:bg-secondary"
                }`}
              >
                <div className="flex flex-col min-w-0">
                  <span
                    className="truncate text-xs font-normal"
                    style={{ fontFamily: f.family }}
                  >
                    {f.family}
                  </span>
                  <span className="text-[9px] text-muted-foreground capitalize">
                    {f.category}
                  </span>
                </div>
                {isSelected && <Check className="size-3 shrink-0 text-primary" />}
              </button>
            );
          })}
        </div>

        {/* Custom font name input */}
        <div className="pt-1.5 border-t border-border flex items-center gap-1.5">
          <Input
            value={customFont}
            onChange={(e) => setCustomFont(e.target.value)}
            placeholder="Custom font name..."
            className="h-6 text-[11px] flex-1"
            onKeyDown={(e) => {
              if (e.key === "Enter") handleApplyCustom();
            }}
          />
          <Button
            size="xs"
            onClick={handleApplyCustom}
            className="h-6 text-[10px] px-2"
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
