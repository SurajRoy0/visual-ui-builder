"use client";

import React, { useState } from "react";
import { ElementsTab } from "./ElementsTab";
import { LayersTab } from "./LayersTab";
import { ComponentsTab } from "./ComponentsTab";
import { AssetsTab } from "./AssetsTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Layers,
  PlusSquare,
  Component,
  Image as ImageIcon,
} from "lucide-react";

type LeftTab = "elements" | "layers" | "components" | "assets";

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeftTab>("elements");

  const tabs: { id: LeftTab; label: string; icon: React.ReactNode }[] = [
    { id: "elements", label: "Elements", icon: <PlusSquare className="size-4" /> },
    { id: "layers", label: "Layers", icon: <Layers className="size-4" /> },
    { id: "assets", label: "Assets", icon: <ImageIcon className="size-4" /> },
    { id: "components", label: "Components", icon: <Component className="size-4" /> },
  ];

  return (
    <aside className="w-76 h-full flex flex-col border-r border-border shrink-0 z-10 select-none bg-background text-foreground overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as LeftTab)}
        className="h-full flex flex-col min-h-0 gap-0"
      >
        {/* Tabs Header Rail */}
        <TabsList className="w-full h-auto p-1 rounded-none border-b border-border bg-secondary/40 justify-between gap-1 shrink-0">
          {tabs.map((tab) => (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={tab.id}
                  className="flex-1 flex-col py-1.5 px-1 h-auto text-[10px] font-medium gap-1 rounded-md cursor-pointer"
                >
                  {tab.icon}
                  <span className="truncate max-w-15">{tab.label}</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>{tab.label}</TooltipContent>
            </Tooltip>
          ))}
        </TabsList>

        {/* Tab Contents Area with reliable native scrolling */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          <TabsContent value="elements" className="mt-0 outline-none pb-12">
            <ElementsTab />
          </TabsContent>
          <TabsContent value="layers" className="mt-0 outline-none h-full pb-12">
            <LayersTab />
          </TabsContent>
          <TabsContent value="assets" className="mt-0 outline-none pb-12">
            <AssetsTab />
          </TabsContent>
          <TabsContent value="components" className="mt-0 outline-none pb-12">
            <ComponentsTab />
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
};
