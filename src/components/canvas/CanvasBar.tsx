"use client";

import React from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Undo2,
  Redo2,
  MousePointer2,
  Hand,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEditorStore } from "@/store/editor";
import { useProjectStore } from "@/store/project";

export const CanvasBar: React.FC = () => {
  const zoom = useEditorStore((state) => state.zoom);
  const setZoom = useEditorStore((state) => state.setZoom);
  const resetZoom = useEditorStore((state) => state.resetZoom);
  const activeViewportId = useEditorStore((state) => state.activeViewportId);
  const viewportWidth = useEditorStore((state) => state.viewportWidth);
  const canvasTool = useEditorStore((state) => state.canvasTool);
  const setCanvasTool = useEditorStore((state) => state.setCanvasTool);
  const isSpacePanning = useEditorStore((state) => state.isSpacePanning);

  const viewports = useProjectStore((state) => state.project.viewports);
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);
  const canUndo = useProjectStore((state) => state.past.length > 0);
  const canRedo = useProjectStore((state) => state.future.length > 0);

  const activeViewport =
    viewports.find((v) => v.id === activeViewportId) ||
    viewports[0] || { width: 1440, height: 900, name: "Desktop" };

  const displayWidth = viewportWidth ?? activeViewport.width;

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.25, Math.round((prev - 0.1) * 100) / 100));
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.0, Math.round((prev + 0.1) * 100) / 100));
  };

  const zoomPercent = Math.round(zoom * 100);

  const isPanningActive = canvasTool === "pan" || isSpacePanning;

  return (
    <div className="flex items-center justify-between px-3 py-1.5 text-xs border-b border-border z-20 bg-background/95 backdrop-blur-sm text-foreground select-none">
      {/* Left: Tool Switcher Tabs & Viewport Info */}
      <div className="flex items-center gap-2.5">
        {/* Select & Pan Tool Switcher Tabs */}
        <Tabs
          value={isPanningActive ? "pan" : "select"}
          onValueChange={(val) => {
            if (val === "select" || val === "pan") {
              setCanvasTool(val);
            }
          }}
        >
          <TabsList className="h-7.5 p-0.5 bg-secondary/50 border border-border">
            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="select" className="h-6.5 w-6.5 p-0 cursor-pointer">
                  <MousePointer2 className="size-3.5" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Select Tool (V)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <TabsTrigger value="pan" className="h-6.5 w-6.5 p-0 cursor-pointer">
                  <Hand className="size-3.5" />
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>Hand / Pan Tool (H or hold Space)</TooltipContent>
            </Tooltip>
          </TabsList>
        </Tabs>

        {/* Viewport Info */}
        <span className="font-mono text-xs font-semibold text-foreground px-1 hidden sm:inline">
          <span className="font-light text-muted-foreground">Viewport: </span>
          {displayWidth}px × {activeViewport.height}px
        </span>
      </div>

      {/* Right Controls: Undo/Redo & Zoom Controls */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 bg-secondary/50 p-0.5 rounded-md border border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={undo}
                disabled={!canUndo}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <Undo2 className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Undo (Ctrl+Z / ⌘Z)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={redo}
                disabled={!canRedo}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <Redo2 className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (Ctrl+Shift+Z / ⇧⌘Z)</TooltipContent>
          </Tooltip>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-0.5 bg-secondary/50 p-0.5 rounded-md border border-border">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomOut}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ZoomOut className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <span className="font-mono text-[11px] min-w-10 text-center font-medium text-foreground px-1 select-none">
            {zoomPercent}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleZoomIn}
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
                onClick={resetZoom}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <RotateCcw className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset Zoom (100%)</TooltipContent>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};
