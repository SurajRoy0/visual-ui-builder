"use client";

import React, { useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Monitor, Tablet, Smartphone, Plus } from "lucide-react";

interface BreakpointItem {
  id: string;
  name: string;
  width: number;
}

const STATIC_BREAKPOINTS: BreakpointItem[] = [
  { id: "bp-desktop", name: "Desktop", width: 1200 },
  { id: "bp-tablet", name: "Tablet", width: 768 },
  { id: "bp-mobile", name: "Mobile", width: 480 },
];

export const BreakpointBar: React.FC = () => {
  const [activeBpId, setActiveBpId] = useState("bp-desktop");

  const getIcon = (width: number) => {
    if (width >= 1024) return <Monitor className="size-3.5" />;
    if (width >= 640) return <Tablet className="size-3.5" />;
    return <Smartphone className="size-3.5" />;
  };

  return (
    <div className="flex items-center gap-1">
      <Tabs
        value={activeBpId}
        onValueChange={(val) => {
          if (val) setActiveBpId(val);
        }}
      >
        <TabsList>
          {STATIC_BREAKPOINTS.map((bp) => (
            <TabsTrigger
              key={bp.id}
              value={bp.id}
            >
              <span>{getIcon(bp.width)}</span>
              <span>{bp.name}</span>
              <span className="font-mono text-[10px] opacity-70 font-normal">
                ({bp.width})
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Add Custom Breakpoint Button */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="secondary"
            size="icon-sm"
            className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/8 cursor-pointer"
          >
            <Plus className="size-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add Breakpoint</TooltipContent>
      </Tooltip>
    </div>
  );
};
