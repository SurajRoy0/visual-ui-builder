"use client";

import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, Laptop, Plus } from "lucide-react";
import { useEditorStore } from "@/store/editor";
import { useProjectStore } from "@/store/project";
import { AddBreakpointModal } from "@/components/modals/AddBreakpointModal";
import type { Breakpoint } from "@/types/project";

const DEFAULT_BREAKPOINTS: Breakpoint[] = [
  { id: "bp-desktop", name: "Desktop", minWidth: 1200, isDefault: true },
  { id: "bp-tablet", name: "Tablet", minWidth: 768 },
  { id: "bp-mobile", name: "Mobile", minWidth: 480 },
];

export const BreakpointBar: React.FC = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const activeBreakpointId = useEditorStore((state) => state.activeBreakpointId);
  const activeViewportId = useEditorStore((state) => state.activeViewportId);
  const viewportWidth = useEditorStore((state) => state.viewportWidth);
  const setActiveBreakpointId = useEditorStore((state) => state.setActiveBreakpointId);
  const setViewportWidth = useEditorStore((state) => state.setViewportWidth);

  const breakpoints = useProjectStore((state) => state.project.breakpoints);
  const viewports = useProjectStore((state) => state.project.viewports);
  const createBreakpoint = useProjectStore((state) => state.createBreakpoint);
  const updateViewport = useProjectStore((state) => state.updateViewport);

  const activeViewport =
    viewports.find((v) => v.id === activeViewportId) ||
    viewports[0] || { id: "vp-desktop", width: 1440, height: 900, name: "Desktop" };

  const currentWidth = viewportWidth ?? activeViewport.width;

  // Use project breakpoints or fallback to default Desktop, Tablet, Mobile
  const activeBreakpointsList = breakpoints.length > 0 ? breakpoints : DEFAULT_BREAKPOINTS;

  // Ensure Desktop (1200), Tablet (768), Mobile (480) ordering (descending by width)
  const displayBreakpoints = [...activeBreakpointsList].sort((a, b) => b.minWidth - a.minWidth);

  // Dynamic matching: find closest breakpoint threshold for currentWidth
  const sortedAscending = [...displayBreakpoints].sort((a, b) => a.minWidth - b.minWidth);
  const matchedBreakpoint =
    [...sortedAscending].reverse().find((bp) => currentWidth >= bp.minWidth) ||
    sortedAscending[0];

  const activeTabId = matchedBreakpoint?.id || activeBreakpointId || "bp-desktop";

  const getIcon = (width: number) => {
    if (width >= 1200) return <Monitor className="size-3.5" />;
    if (width >= 992) return <Laptop className="size-3.5" />;
    if (width >= 640) return <Tablet className="size-3.5" />;
    return <Smartphone className="size-3.5" />;
  };

  const handleTabChange = (selectedBpId: string) => {
    const targetBp = displayBreakpoints.find((bp) => bp.id === selectedBpId);
    if (!targetBp) return;

    setActiveBreakpointId(targetBp.id);

    // Pick target width for this breakpoint
    let targetWidth = targetBp.minWidth;
    if (targetBp.name.toLowerCase().includes("desktop") || targetBp.minWidth >= 1200) {
      targetWidth = 1440;
    } else if (targetBp.name.toLowerCase().includes("tablet") || targetBp.minWidth >= 768) {
      targetWidth = 768;
    } else if (targetBp.name.toLowerCase().includes("mobile") || targetBp.minWidth <= 480) {
      targetWidth = 480;
    }

    setViewportWidth(null);
    updateViewport(activeViewport.id, { width: targetWidth });
  };

  const handleAddBreakpoint = (name: string, minWidth: number) => {
    const newBpId = createBreakpoint({
      name,
      minWidth,
    });

    setActiveBreakpointId(newBpId);
    setViewportWidth(null);
    updateViewport(activeViewport.id, { width: Math.max(minWidth, 390) });
  };

  return (
    <div className="flex items-center gap-1.5">
      <Tabs
        value={activeBreakpointId || activeTabId}
        onValueChange={(val) => {
          if (val) handleTabChange(val);
        }}
      >
        <TabsList className="h-7.5 bg-secondary/60 p-0.5 rounded-lg border border-border">
          {displayBreakpoints.map((bp) => (
            <TabsTrigger
              key={bp.id}
              value={bp.id}
              className="gap-1.5 text-xs h-6 px-2.5 rounded-md cursor-pointer transition-all data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs"
            >
              <span>{getIcon(bp.minWidth)}</span>
              <span>{bp.name}</span>
              <span className="font-mono text-[10px] opacity-70 font-normal">
                ({bp.minWidth})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Add Custom Breakpoint Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => setIsAddModalOpen(true)}
            className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/70 cursor-pointer"
          >
            <Plus className="size-3.5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Custom Breakpoint</TooltipContent>
      </Tooltip>

      {/* Add Modal */}
      <AddBreakpointModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddBreakpoint}
        defaultWidth={currentWidth}
      />
    </div>
  );
};
