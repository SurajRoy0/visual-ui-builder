"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Undo2,
  Redo2,
  Sparkles
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export const CanvasBar: React.FC = () => {

  return (
    <div className="flex items-center justify-between px-3.5 py-1.5 text-xs border-b border-border z-20 bg-background/95 backdrop-blur-sm text-foreground">
      {/* Left: Viewport info + Zoom & Undo/Redo */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Viewport Width */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold text-foreground px-1">
            12OOpx
          </span>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-secondary/50 p-0.5 rounded-md border border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => { }}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ZoomOut className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <span className="font-mono text-[11px] min-w-9 text-center font-medium text-foreground px-1 select-none">
            100%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => { }}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ZoomIn className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => { }}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom (100%)</TooltipContent>
          </Tooltip>
        </div>

        <div className="h-4 w-px bg-border" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-secondary/50 p-0.5 rounded-md border border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Undo2 className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (⌘Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Redo2 className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (⇧⌘Z)</TooltipContent>
          </Tooltip>
        </div>
      </div>



      {/* Right: Element-Specific Frequent Tools */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-mono text-muted-foreground tracking-wider mr-0.5">
          <Sparkles className="size-3 text-amber-500" />
          <span className="opacity-75">Quick Tools</span>
        </div>
      </div>
    </div>
  );
};

