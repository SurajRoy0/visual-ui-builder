"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Square,
  Type,
  Layout,
  MousePointer2,
  Plus,
  ArrowRight,
  Command,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const CanvasRenderer: React.FC = () => {
  const [elements, setElements] = useState<any[]>([]);

  const handleAddQuickElement = (type: "box" | "text" | "section") => {
    const newEl = {
      id: `element-${Date.now()}`,
      type,
      name: type === "box" ? "Box Container" : type === "text" ? "Headline Text" : "Hero Section",
      tag: type === "box" ? "div" : type === "text" ? "h1" : "section",
      content: type === "text" ? "Heading Text" : undefined,
    };
    setElements((prev) => [...prev, newEl]);
  };

  return (
    <div
      id="root-page"
      className="relative flex flex-col items-center justify-center w-full min-h-[750px] p-8 bg-background text-foreground select-none"
    >
      {elements.length === 0 ? (
        /* Empty State / Welcome Screen */
        <div className="relative flex flex-col items-center justify-center text-center max-w-md p-8 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xs shadow-xl space-y-6">
          {/* Glowing Aura & Icon */}
          <div className="relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-blue/20 via-purple-500/20 to-pink-500/20 rounded-full blur-md" />
            <div className="relative w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-foreground shadow-sm">
              <Sparkles className="size-6 text-blue animate-pulse" />
            </div>
          </div>

          {/* Welcome Titles */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary/80 border border-border text-[11px] font-medium text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Canvas Ready
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Welcome to Playfull
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Your visual design workspace is empty. Drop primitives from the left sidebar or select a quick starter block below to start crafting.
            </p>
          </div>

          {/* Quick Insert Actions */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddQuickElement("box")}
              className="h-8 text-xs gap-1.5 px-3 rounded-lg cursor-pointer hover:bg-secondary border-border hover:border-foreground/30 shadow-2xs"
            >
              <Square className="size-3.5 text-blue" />
              <span>Add Box</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddQuickElement("text")}
              className="h-8 text-xs gap-1.5 px-3 rounded-lg cursor-pointer hover:bg-secondary border-border hover:border-foreground/30 shadow-2xs"
            >
              <Type className="size-3.5 text-purple-500" />
              <span>Add Text</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAddQuickElement("section")}
              className="h-8 text-xs gap-1.5 px-3 rounded-lg cursor-pointer hover:bg-secondary border-border hover:border-foreground/30 shadow-2xs"
            >
              <Layout className="size-3.5 text-emerald-500" />
              <span>Add Section</span>
            </Button>
          </div>

          {/* Keyboard Shortcuts Pill Bar */}
          <div className="pt-2 border-t border-border/60 w-full flex items-center justify-center gap-4 text-[10px] text-muted-foreground font-mono">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-secondary border border-border text-foreground font-semibold">
                B
              </kbd>
              Box
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-secondary border border-border text-foreground font-semibold">
                T
              </kbd>
              Text
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded-md bg-secondary border border-border text-foreground font-semibold flex items-center gap-0.5">
                <Command className="size-2.5" /> K
              </kbd>
              Search
            </span>
          </div>
        </div>
      ) : (
        /* Rendered Elements */
        <div className="w-full space-y-4">
          {elements.map((el) => (
            <div
              key={el.id}
              className="p-6 rounded-xl border border-dashed border-border hover:border-blue/60 bg-card/40 transition-all flex flex-col items-center justify-center gap-2 group cursor-pointer"
            >
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                {el.name}
                <span className="text-[9px] font-mono text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-md">
                  &lt;{el.tag}&gt;
                </span>
              </span>
              {el.content && <p className="text-sm text-foreground">{el.content}</p>}
            </div>
          ))}

          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              size="xs"
              onClick={() => handleAddQuickElement("box")}
              className="h-7 text-xs gap-1 px-3 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="size-3" />
              Add Another Element
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
