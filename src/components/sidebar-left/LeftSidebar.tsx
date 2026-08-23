"use client";

import React, { useState } from "react";
import { ElementsTab } from "./ElementsTab";
import { LayersTab } from "./LayersTab";
import { ComponentsTab } from "./ComponentsTab";
import { AssetsTab } from "./AssetsTab";
import { IconsTab } from "./IconsTab";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Layers,
  PlusSquare,
  Component,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";

type LeftTab = "elements" | "layers" | "components" | "assets" | "icons";

export const LeftSidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<LeftTab>("elements");

  const tabs: { id: LeftTab; label: string; icon: React.ReactNode }[] = [
    { id: "elements", label: "Elements", icon: <PlusSquare className="size-4" /> },
    { id: "layers", label: "Layers", icon: <Layers className="size-4" /> },
    { id: "components", label: "Components", icon: <Component className="size-4" /> },
    { id: "assets", label: "Assets", icon: <ImageIcon className="size-4" /> },
    { id: "icons", label: "Icons", icon: <Sparkles className="size-4" /> },
  ];

  return (
    <aside className="w-76 h-full flex flex-col border-r border-border shrink-0 z-10 select-none bg-background text-foreground">
      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as LeftTab)}
        className="h-full flex flex-col gap-0"
      >
        {/* 5 Tabs Header Rail */}
        <TabsList className="w-full h-auto p-1 rounded-none border-b border-border bg-secondary/40 justify-between gap-1">
          {tabs.map((tab) => (
            <Tooltip key={tab.id}>
              <TooltipTrigger asChild>
                <TabsTrigger
                  value={tab.id}
                  className="flex-1 flex-col py-1.5 px-1 h-auto text-[10px] font-medium gap-1 rounded-md cursor-pointer"
                >
                  {tab.icon}
                  <span className="truncate max-w-12">{tab.label}</span>
                </TabsTrigger>
              </TooltipTrigger>
              <TooltipContent>{tab.label}</TooltipContent>
            </Tooltip>
          ))}
        </TabsList>

        {/* Tab Contents Area */}
        <ScrollArea className="flex-1">
          <TabsContent value="elements" className="mt-0 outline-none">
            <ElementsTab />
          </TabsContent>
          <TabsContent value="layers" className="mt-0 outline-none">
            <LayersTab />
          </TabsContent>
          <TabsContent value="components" className="mt-0 outline-none">
            <ComponentsTab />
          </TabsContent>
          <TabsContent value="assets" className="mt-0 outline-none">
            <AssetsTab />
          </TabsContent>
          <TabsContent value="icons" className="mt-0 outline-none">
            <IconsTab />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  );
};
