"use client";

import React from "react";
import { Square, Type, Plus } from "lucide-react";

export const ElementsTab: React.FC = () => {
  return (
    <div className="p-3 flex flex-col gap-3">
      <div>
        <h3 className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground mb-2 px-1">
          Core Primitives
        </h3>
        <div className="grid grid-cols-1 gap-2">
          {/* Box / Div Element */}
          <div className="group relative flex items-center justify-between p-2.5 rounded-md border border-border bg-card hover:bg-black/4 dark:hover:bg-white/6 hover:border-foreground/30 transition-all cursor-pointer shadow-2xs select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 group-hover:border-foreground/40">
                <Square className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  Box
                  <span className="text-[9px] font-mono font-normal text-muted-foreground bg-secondary/80 px-1 py-0.2 rounded-md">
                    &lt;div&gt;
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Flexible layout container
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity text-muted-foreground group-hover:text-foreground">
              <Plus className="size-3.5" />
            </div>
          </div>

          {/* Paragraph Element */}
          <div className="group relative flex items-center justify-between p-2.5 rounded-md border border-border bg-card hover:bg-black/4 dark:hover:bg-white/6 hover:border-foreground/30 transition-all cursor-pointer shadow-2xs select-none">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 group-hover:border-foreground/40">
                <Type className="size-3.5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  Paragraph
                  <span className="text-[9px] font-mono font-normal text-muted-foreground bg-secondary/80 px-1 py-0.2 rounded-md">
                    &lt;p&gt;
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Typography & text element
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity text-muted-foreground group-hover:text-foreground">
              <Plus className="size-3.5" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-2 p-2.5 rounded-md border border-border bg-secondary/30 text-[11px] text-muted-foreground flex flex-col gap-1">
        <span className="font-semibold text-foreground flex items-center gap-1">
          💡 Quick Tips:
        </span>
        <span>• Click an element to insert it into the active selection.</span>
        <span>• Drag and drop directly onto canvas or the layer tree.</span>
      </div>
    </div>
  );
};
