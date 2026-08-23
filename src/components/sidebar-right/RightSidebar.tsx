"use client";

import React, { useState } from "react";
import { SelectedElementInspector } from "./SelectedElementInspector";
import { GlobalStylesInspector } from "./GlobalStylesInspector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Sliders, Globe } from "lucide-react";
import { useEditorStore } from "@/store/editor/editorStore";
import { useProjectStore } from "@/store/project/projectStore";

type RightTab = "element" | "global";

export const RightSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RightTab>("element");
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const elements = useProjectStore((state) => state.project.elements);
  const selectedNode = selectedNodeId ? elements[selectedNodeId] : null;

  // Dynamic tab label: shows the currently selected element name (e.g. "Box", "Heading", "Button", etc.)
  const selectedItemLabel = selectedNode?.name || "Box";

  const tabs: { id: RightTab; label: string; icon: React.ReactNode }[] = [
    { id: "element", label: selectedItemLabel, icon: <Sliders className="size-4 text-indigo-400" /> },
    { id: "global", label: "Global", icon: <Globe className="size-4 text-amber-400" /> },
  ];

  return (
    <aside className="w-80 h-full flex flex-col border-l border-border shrink-0 z-10 select-none bg-background text-foreground overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as RightTab)}
        className="h-full flex flex-col min-h-0 gap-0"
      >
        {/* 2 Tabs Header Rail matching LeftSidebar */}
        <TabsList className="w-full h-auto p-1 rounded-none border-b border-border bg-secondary/40 justify-between gap-1 shrink-0">
          {tabs.map((tab) => (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={tab.id}
                  className="flex-1 flex-col py-1.5 px-1 h-auto text-xs font-medium gap-1 rounded-md cursor-pointer"
                >
                  {tab.icon}
                  <span className="truncate max-w-28">{tab.label}</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>
                {tab.id === "element"
                  ? `${selectedItemLabel} Inspector`
                  : "Global Project Styles & Tokens"}
              </TooltipContent>
            </Tooltip>
          ))}
        </TabsList>

        {/* Tab Contents Area with reliable native scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <TabsContent value="element" className="mt-0 outline-none pb-12">
            <SelectedElementInspector />
          </TabsContent>
          <TabsContent value="global" className="mt-0 outline-none pb-12">
            <GlobalStylesInspector />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
};
