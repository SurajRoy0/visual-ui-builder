"use client";

import React, { useState } from "react";
import { PageSection } from "./PageSection";
import { BoxInspector } from "./BoxInspector";
import { TextInspector } from "./TextInspector";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/hooks/use-editor-store";

type InspectorTab = "box" | "text" | "page";

export const RightSidebar: React.FC = () => {
  const selectedElement = useEditorStore((s) => s.selectedElement);
  const defaultTab: InspectorTab =
    selectedElement.type === "text"
      ? "text"
      : selectedElement.type === "page"
        ? "page"
        : "box";

  const [manualTab, setManualTab] = useState<{ id: string; tab: InspectorTab } | null>(null);
  const activeTab = manualTab?.id === selectedElement.id ? manualTab.tab : defaultTab;

  return (
    <aside className="w-[320px] h-full flex flex-col border-l border-border shrink-0 z-10 select-none bg-background text-foreground">
      <Tabs
        value={activeTab}
        onValueChange={(val) => {
          if (val) setManualTab({ id: selectedElement.id, tab: val as InspectorTab });
        }}
        className="h-full flex flex-col gap-0"
      >
        {/* Header Info & Element Name Indicator */}
        <div className="px-3.5 py-2 border-b border-border bg-secondary/40 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
            <span className="text-xs font-semibold text-foreground font-mono truncate">
              {selectedElement.name || (activeTab === "box" ? "Card Container" : activeTab === "text" ? "Hero Heading" : "Page Root")}
            </span>
            <Badge variant="secondary" className="uppercase font-mono text-[9px] shrink-0 rounded-md">
              {selectedElement.tag || (activeTab === "box" ? "div" : activeTab === "text" ? "h1" : "page")}
            </Badge>
          </div>
        </div>

        {/* Inspector Mode Switcher */}
        <TabsList className="w-full h-auto p-1 rounded-none border-b border-border bg-secondary/40 justify-between gap-1">
          {(["box", "text", "page"] as const).map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="flex-1 py-1 text-center text-xs font-medium capitalize rounded-md cursor-pointer"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Inspector Panel Components */}
        <ScrollArea className="flex-1 pb-10">
          <TabsContent value="box" className="mt-0 outline-none">
            <BoxInspector />
          </TabsContent>
          <TabsContent value="text" className="mt-0 outline-none">
            <TextInspector />
          </TabsContent>
          <TabsContent value="page" className="mt-0 outline-none">
            <PageSection />
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </aside>
  );
};

