"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Keyboard,
  BookOpen,
  Sparkles,
  MousePointer2,
  Move,
  RotateCcw,
  Maximize2,
  Layers,
  Palette,
} from "lucide-react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  label: string;
  keys: string[];
  description: string;
}

interface ShortcutCategory {
  title: string;
  icon: React.ReactNode;
  items: ShortcutItem[];
}

const SHORTCUT_CATEGORIES: ShortcutCategory[] = [
  {
    title: "Canvas & Navigation",
    icon: <Move className="size-4 text-blue-500" />,
    items: [
      {
        label: "Select Tool",
        keys: ["V"],
        description: "Switch to pointer selection tool",
      },
      {
        label: "Hand / Pan Tool",
        keys: ["H"],
        description: "Switch to pan mode to drag and move the canvas",
      },
      {
        label: "Temporary Pan",
        keys: ["Space (Hold)"],
        description: "Hold spacebar and drag to pan without switching tools",
      },
      {
        label: "Zoom In",
        keys: ["⌘ / Ctrl", "+"],
        description: "Zoom into the canvas (up to 200%) without browser zoom",
      },
      {
        label: "Zoom Out",
        keys: ["⌘ / Ctrl", "-"],
        description: "Zoom out of the canvas (down to 25%)",
      },
      {
        label: "Reset Zoom",
        keys: ["⌘ / Ctrl", "0"],
        description: "Reset canvas zoom to 100%",
      },
      {
        label: "Pinch / Wheel Zoom",
        keys: ["Ctrl / ⌘", "Scroll"],
        description: "Smoothly zoom canvas with mouse wheel or trackpad",
      },
    ],
  },
  {
    title: "Element Selection & Editing",
    icon: <MousePointer2 className="size-4 text-purple-500" />,
    items: [
      {
        label: "Nudge 1px",
        keys: ["↑", "↓", "←", "→"],
        description: "Move selected element by 1px with live 1px boundary preview",
      },
      {
        label: "Nudge 10px",
        keys: ["Shift", "↑ / ↓ / ← / →"],
        description: "Quickly move selected element by 10px increments",
      },
      {
        label: "Duplicate Element",
        keys: ["⌘ / Ctrl", "D"],
        description: "Clone selected element with all styles and children",
      },
      {
        label: "Delete Element",
        keys: ["Delete", "Backspace"],
        description: "Remove selected element from the canvas",
      },
      {
        label: "Deselect",
        keys: ["Esc"],
        description: "Clear active selection",
      },
    ],
  },
  {
    title: "History & Help",
    icon: <RotateCcw className="size-4 text-emerald-500" />,
    items: [
      {
        label: "Undo",
        keys: ["⌘ / Ctrl", "Z"],
        description: "Revert the last change or mutation",
      },
      {
        label: "Redo",
        keys: ["⌘ / Ctrl", "Shift", "Z"],
        description: "Re-apply the previously undone action (or Ctrl+Y)",
      },
      {
        label: "Open Help & Shortcuts",
        keys: ["?"],
        description: "Open this documentation dialog anytime (or ⌘ /)",
      },
    ],
  },
];

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"shortcuts" | "guide" | "tips">("shortcuts");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col rounded-lg p-0 gap-0 overflow-hidden border border-border bg-background shadow-2xl">
        {/* Modal Header */}
        <DialogHeader className="p-5 border-b border-border bg-secondary/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-2xs">
              <Keyboard className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold tracking-tight">
                Editor Documentation & Shortcuts
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Master the visual builder with keyboard shortcuts, tools, and workflow tips.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tab Navigation */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "shortcuts" | "guide" | "tips")}
          className="flex-1 flex flex-col min-h-0"
        >
          <div className="px-5 pt-3 border-b border-border bg-background">
            <TabsList className="h-8 p-0.5 bg-secondary/50 border border-border">
              <TabsTrigger value="shortcuts" className="text-xs gap-1.5 px-3 h-7">
                <Keyboard className="size-3.5" />
                <span>Shortcuts</span>
              </TabsTrigger>
              <TabsTrigger value="guide" className="text-xs gap-1.5 px-3 h-7">
                <BookOpen className="size-3.5" />
                <span>Feature Guide</span>
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-xs gap-1.5 px-3 h-7">
                <Sparkles className="size-3.5" />
                <span>Pro Tips</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab 1: Keyboard Shortcuts */}
          <TabsContent value="shortcuts" className="flex-1 overflow-y-auto p-5 space-y-6 m-0">
            {SHORTCUT_CATEGORIES.map((category) => (
              <div key={category.title} className="space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  {category.icon}
                  <span>{category.title}</span>
                </div>

                <div className="rounded-lg border border-border bg-card divide-y divide-border overflow-hidden">
                  {category.items.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs hover:bg-secondary/30 transition-colors"
                    >
                      <div className="space-y-0.5 pr-4">
                        <div className="font-medium text-foreground">{item.label}</div>
                        <div className="text-[11px] text-muted-foreground leading-tight">
                          {item.description}
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {item.keys.map((key) => (
                          <kbd
                            key={key}
                            className="px-2 py-0.5 text-[11px] font-mono font-semibold bg-secondary text-foreground rounded border border-border shadow-2xs select-none min-w-5 text-center"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Tab 2: Feature Guide */}
          <TabsContent value="guide" className="flex-1 overflow-y-auto p-5 space-y-4 m-0 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {/* Feature 1: Canvas & Viewports */}
              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Maximize2 className="size-4 text-blue-500" />
                  <span>Responsive Viewport</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Simulate any screen size dynamically. Drag the left/right handles on the canvas to resize the viewport width, and switch between Desktop, Tablet, and Mobile breakpoints.
                </p>
              </div>

              {/* Feature 2: 8-Handle Resizing */}
              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <MousePointer2 className="size-4 text-purple-500" />
                  <span>8-Way Interactive Resize</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Select any element to access 8 interactive handles. While dragging or nudging, handles hide and outline switches to 1px for exact pixel precision.
                </p>
              </div>

              {/* Feature 3: Drag and Drop */}
              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Layers className="size-4 text-emerald-500" />
                  <span>Smart Drag-and-Drop</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Drag elements from the left toolbox directly into containers or between siblings. Live orientation indicators show horizontal or vertical drop targets.
                </p>
              </div>

              {/* Feature 4: Style Inspector & Code */}
              <div className="p-3.5 rounded-lg border border-border bg-card space-y-2">
                <div className="flex items-center gap-2 font-bold text-foreground">
                  <Palette className="size-4 text-amber-500" />
                  <span>Visual Inspector & Export</span>
                </div>
                <p className="text-muted-foreground leading-relaxed text-[11px]">
                  Customize layout, typography, borders, and colors in the right sidebar. Export production-ready declarative JSON schemas and React code anytime.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Tab 3: Pro Tips */}
          <TabsContent value="tips" className="flex-1 overflow-y-auto p-5 space-y-3 m-0 text-xs">
            <div className="p-3.5 rounded-lg border border-blue-500/30 bg-blue-500/5 space-y-1.5">
              <div className="font-semibold text-blue-500 flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                <span>Hold Spacebar to Pan Fast</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                No need to manually switch tools — hold down <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary rounded border border-border font-mono">Space</kbd> at any time, click & drag to smoothly navigate your canvas, and release to resume editing.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-purple-500/30 bg-purple-500/5 space-y-1.5">
              <div className="font-semibold text-purple-400 flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                <span>Pixel-Perfect Arrow Nudging</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Press the arrow keys to adjust margin or position by exactly 1px. Hold <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary rounded border border-border font-mono">Shift</kbd> to jump in 10px grid increments.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-emerald-500/30 bg-emerald-500/5 space-y-1.5">
              <div className="font-semibold text-emerald-500 flex items-center gap-1.5">
                <Sparkles className="size-3.5" />
                <span>Non-Destructive Autosave</span>
              </div>
              <p className="text-muted-foreground leading-relaxed text-[11px]">
                Every single change is auto-saved locally and backed by complete Undo/Redo history (<kbd className="px-1.5 py-0.5 text-[10px] bg-secondary rounded border border-border font-mono">⌘Z</kbd> / <kbd className="px-1.5 py-0.5 text-[10px] bg-secondary rounded border border-border font-mono">⇧⌘Z</kbd>).
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
