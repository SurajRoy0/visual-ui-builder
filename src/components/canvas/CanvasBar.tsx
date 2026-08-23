"use client";

import React, { useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Undo2,
  Redo2,
  Columns,
  Rows,
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Underline,
  Copy,
  Trash2,
  Plus,
  Palette,
  Sparkles,
  Grid3X3,
  CornerDownRight,
  Square,
  Type,
} from "lucide-react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEditorStore } from "@/hooks/use-editor-store";

export const CanvasBar: React.FC = () => {
  const {
    selectedElement,
    canvasScale,
    setCanvasScale,
    canvasWidth,
    gridSnap,
    setGridSnap,
    historyCanUndo,
    historyCanRedo,
  } = useEditorStore();

  // Local interactive states for quick actions
  const [flexDir, setFlexDir] = useState<"row" | "column">("column");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right">("center");
  const [isBold, setIsBold] = useState(true);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [quickRadiusIndex, setQuickRadiusIndex] = useState(2); // 0: 0px, 1: 8px, 2: 16px, 3: 9999px
  const [quickFontSize, setQuickFontSize] = useState("30");
  const [quickColor, setQuickColor] = useState(
    selectedElement.type === "text" ? "#111827" : "#ffffff"
  );
  const [copiedNotification, setCopiedNotification] = useState(false);

  const radiusPresets = ["0px", "8px", "16px", "9999px"];

  const handleCycleRadius = () => {
    setQuickRadiusIndex((prev) => (prev + 1) % radiusPresets.length);
  };

  const handleDuplicate = () => {
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 1500);
  };

  // Render element-specific frequent tools
  const renderFrequentTools = () => {
    const type = selectedElement.type;

    if (type === "text") {
      return (
        <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-md border border-border">
          {/* Quick Tag Switcher */}
          <Select defaultValue={selectedElement.tag || "h1"}>
            <SelectTrigger className="h-6.5 text-[11px] font-mono px-2 py-0 border-none bg-transparent hover:bg-black/5 dark:hover:bg-white/8 rounded-md shadow-none cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="min-w-24">
              <SelectItem value="h1" className="text-xs font-mono">H1</SelectItem>
              <SelectItem value="h2" className="text-xs font-mono">H2</SelectItem>
              <SelectItem value="h3" className="text-xs font-mono">H3</SelectItem>
              <SelectItem value="p" className="text-xs font-mono">Paragraph</SelectItem>
              <SelectItem value="span" className="text-xs font-mono">Span</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          {/* Quick Font Size Selector */}
          <Select value={quickFontSize} onValueChange={(val) => { if (val) setQuickFontSize(val); }}>
            <SelectTrigger className="h-6.5 text-[11px] font-mono px-1.5 py-0 border-none bg-transparent hover:bg-black/5 dark:hover:bg-white/8 rounded-md shadow-none cursor-pointer">
              <span>{quickFontSize}px</span>
            </SelectTrigger>
            <SelectContent className="min-w-20">
              {["12", "14", "16", "18", "20", "24", "30", "36", "48", "64"].map((size) => (
                <SelectItem key={size} value={size} className="text-xs font-mono">
                  {size}px
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          {/* Bold, Italic, Underline */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isBold ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setIsBold(!isBold)}
                className={`h-6.5 w-6.5 rounded-md cursor-pointer ${isBold ? "font-bold shadow-2xs" : "text-muted-foreground"}`}
              >
                <Bold className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Bold (⌘B)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isItalic ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setIsItalic(!isItalic)}
                className={`h-6.5 w-6.5 rounded-md cursor-pointer ${isItalic ? "shadow-2xs" : "text-muted-foreground"}`}
              >
                <Italic className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Italic (⌘I)</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={isUnderline ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setIsUnderline(!isUnderline)}
                className={`h-6.5 w-6.5 rounded-md cursor-pointer ${isUnderline ? "shadow-2xs" : "text-muted-foreground"}`}
              >
                <Underline className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Underline (⌘U)</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          {/* Quick Align */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={textAlign === "left" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setTextAlign("left")}
                className="h-6.5 w-6.5 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <AlignLeft className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Left</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={textAlign === "center" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setTextAlign("center")}
                className="h-6.5 w-6.5 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <AlignCenter className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Center</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={textAlign === "right" ? "secondary" : "ghost"}
                size="icon-xs"
                onClick={() => setTextAlign("right")}
                className="h-6.5 w-6.5 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <AlignRight className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Align Right</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          {/* Color Popover */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      className="h-6.5 w-6.5 rounded-md p-1 cursor-pointer"
                    >
                      <div
                        className="w-full h-full rounded-xs border border-border shadow-2xs"
                        style={{ backgroundColor: quickColor }}
                      />
                    </Button>
                  }
                />
              </TooltipTrigger>
              <TooltipContent>Text Color</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-48 p-2.5 space-y-2" align="end">
              <span className="text-[11px] font-semibold text-foreground">Text Color</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={quickColor}
                  onChange={(e) => setQuickColor(e.target.value)}
                  className="w-7 h-7 rounded-md cursor-pointer"
                />
                <span className="font-mono text-xs text-foreground">{quickColor}</span>
              </div>
            </PopoverContent>
          </Popover>

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          {/* Quick Duplicate & Delete */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={handleDuplicate}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Copy className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copiedNotification ? "Copied!" : "Duplicate (⌘D)"}</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-destructive cursor-pointer"
              >
                <Trash2 className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete (⌫)</TooltipContent>
          </Tooltip>
        </div>
      );
    }

    if (type === "page") {
      return (
        <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-md border border-border">
          {/* Grid Snap Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={gridSnap ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setGridSnap((s) => !s)}
                className="h-6.5 px-2 text-xs gap-1.5 rounded-md cursor-pointer"
              >
                <Grid3X3 className="size-3" />
                <span className="text-[11px]">Grid Snap: {gridSnap ? "ON" : "OFF"}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Canvas Grid Snapping</TooltipContent>
          </Tooltip>

          <div className="h-4 w-px bg-border/60 mx-0.5" />

          {/* Canvas Color */}
          <Popover>
            <Tooltip>
              <TooltipTrigger asChild>
                <PopoverTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6.5 px-2 text-xs gap-1.5 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <Palette className="size-3" />
                      <span className="text-[11px]">Background</span>
                    </Button>
                  }
                />
              </TooltipTrigger>
              <TooltipContent>Change Canvas Background</TooltipContent>
            </Tooltip>
            <PopoverContent className="w-48 p-2.5 space-y-2" align="end">
              <span className="text-[11px] font-semibold text-foreground">Canvas Background</span>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={quickColor}
                  onChange={(e) => setQuickColor(e.target.value)}
                  className="w-7 h-7 rounded-md cursor-pointer"
                />
                <span className="font-mono text-xs text-foreground">{quickColor}</span>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      );
    }

    // Default: Box / Container Element
    return (
      <div className="flex items-center gap-1 bg-secondary/50 p-0.5 rounded-md border border-border">
        {/* Quick Flex Direction Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={flexDir === "row" ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={() => setFlexDir("row")}
              className="h-6.5 w-6.5 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Columns className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Flex Row (Horizontal)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={flexDir === "column" ? "secondary" : "ghost"}
              size="icon-xs"
              onClick={() => setFlexDir("column")}
              className="h-6.5 w-6.5 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <Rows className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Flex Column (Vertical)</TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        {/* Quick Radius Preset Cycle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCycleRadius}
              className="h-6.5 px-2 text-[11px] font-mono gap-1 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
            >
              <CornerDownRight className="size-3 text-muted-foreground" />
              <span>R: {radiusPresets[quickRadiusIndex]}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Cycle Corner Radius Presets</TooltipContent>
        </Tooltip>

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        {/* Background Color Quick Picker */}
        <Popover>
          <Tooltip>
            <TooltipTrigger asChild>
              <PopoverTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    className="h-6.5 w-6.5 rounded-md p-1 cursor-pointer"
                  >
                    <div
                      className="w-full h-full rounded-xs border border-border shadow-2xs"
                      style={{ backgroundColor: quickColor }}
                    />
                  </Button>
                }
              />
            </TooltipTrigger>
            <TooltipContent>Background Color</TooltipContent>
          </Tooltip>
          <PopoverContent className="w-48 p-2.5 space-y-2" align="end">
            <span className="text-[11px] font-semibold text-foreground">Container Background</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={quickColor}
                onChange={(e) => setQuickColor(e.target.value)}
                className="w-7 h-7 rounded-md cursor-pointer"
              />
              <span className="font-mono text-xs text-foreground">{quickColor}</span>
            </div>
          </PopoverContent>
        </Popover>

        <div className="h-4 w-px bg-border/60 mx-0.5" />

        {/* Add Child / Insert */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Plus className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Add Child Element</TooltipContent>
        </Tooltip>

        {/* Duplicate */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              onClick={handleDuplicate}
              className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <Copy className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copiedNotification ? "Copied!" : "Duplicate Container (⌘D)"}</TooltipContent>
        </Tooltip>

        {/* Delete */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-destructive cursor-pointer"
            >
              <Trash2 className="size-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Delete Element (⌫)</TooltipContent>
        </Tooltip>
      </div>
    );
  };

  return (
    <div className="flex items-center justify-between px-3.5 py-1.5 text-xs border-b border-border z-20 bg-background/95 backdrop-blur-sm text-foreground">
      {/* Left: Viewport info + Zoom & Undo/Redo */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Viewport Width */}
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-xs font-semibold text-foreground px-1">
            {canvasWidth}px
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
                onClick={() => setCanvasScale((s) => Math.max(0.4, Math.round((s - 0.1) * 10) / 10))}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <ZoomOut className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>

          <span className="font-mono text-[11px] min-w-9 text-center font-medium text-foreground px-1 select-none">
            {Math.round(canvasScale * 100)}%
          </span>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setCanvasScale((s) => Math.min(2.0, Math.round((s + 0.1) * 10) / 10))}
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
                onClick={() => setCanvasScale(1)}
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
                disabled={!historyCanUndo}
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
                disabled={!historyCanRedo}
                className="h-6.5 w-6.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <Redo2 className="size-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Redo (⇧⌘Z)</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Center: Selected Element Indicator / Breadcrumb */}
      <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/40 border border-border/60 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1 text-foreground font-medium">
          {selectedElement.type === "text" ? (
            <Type className="size-3 text-blue" />
          ) : (
            <Square className="size-3 text-purple-500" />
          )}
          <span>{selectedElement.name}</span>
        </span>
        <Badge variant="outline" className="font-mono text-[9px] uppercase px-1 py-0 h-4 border-border">
          {selectedElement.tag}
        </Badge>
      </div>

      {/* Right: Element-Specific Frequent Tools */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden sm:flex items-center gap-1 text-[10px] uppercase font-mono text-muted-foreground tracking-wider mr-0.5">
          <Sparkles className="size-3 text-amber-500" />
          <span className="opacity-75">Quick Tools</span>
        </div>
        {renderFrequentTools()}
      </div>
    </div>
  );
};

