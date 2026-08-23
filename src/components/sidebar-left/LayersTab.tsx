"use client";

import React, { useState } from "react";
import {
  Square,
  Type,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Plus,
  Home,
  FileText,
  GripVertical,
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useEditorStore } from "@/hooks/use-editor-store";

interface StaticLayerNode {
  id: string;
  name: string;
  type: "box" | "text";
  tag: string;
  children?: StaticLayerNode[];
}

const SAMPLE_LAYERS: StaticLayerNode[] = [
  {
    id: "root-page",
    name: "Page Container",
    type: "box",
    tag: "div",
    children: [
      {
        id: "card-container",
        name: "Card Container",
        type: "box",
        tag: "div",
        children: [
          {
            id: "hero-heading",
            name: "Heading",
            type: "text",
            tag: "h1",
          },
          {
            id: "hero-desc",
            name: "Description",
            type: "text",
            tag: "p",
          },
          {
            id: "hero-buttons",
            name: "Button Group",
            type: "box",
            tag: "div",
          },
        ],
      },
    ],
  },
];

export const LayersTab: React.FC = () => {
  const { selectedElement, selectElementById } = useEditorStore();
  const [activePage, setActivePage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLayerNode = (node: StaticLayerNode, depth: number = 0) => {
    const isSelected = selectedElement.id === node.id;
    const hasChildren = node.children && node.children.length > 0;
    const isCollapsed = collapsedNodes[node.id];

    return (
      <div key={node.id} className="flex flex-col">
        <div
          onClick={() => selectElementById(node.id)}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className={`group flex items-center justify-between py-1.5 pr-1.5 rounded-md text-xs cursor-pointer select-none transition-all ${isSelected
              ? "bg-[#242428] text-white dark:bg-[#242428] dark:text-white bg-[#ebebed] text-zinc-950 font-medium shadow-2xs"
              : "text-muted-foreground hover:text-foreground hover:bg-white/6 dark:hover:bg-white/6 hover:bg-black/4"
            }`}
        >
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {hasChildren ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCollapse(node.id);
                }}
                className={`h-4 w-4 p-0 rounded-md cursor-pointer hover:bg-white/8 ${isSelected ? "text-white dark:text-white text-zinc-950" : "text-muted-foreground"
                  }`}
              >
                {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
              </Button>
            ) : (
              <span className="w-3" />
            )}

            <div
              className={`p-0.5 rounded-md ${isSelected ? "text-white dark:text-white text-zinc-950" : "text-muted-foreground"
                }`}
            >
              {node.type === "box" ? <Square className="size-3.5" /> : <Type className="size-3.5" />}
            </div>

            <span className="truncate text-xs">{node.name}</span>

            <span
              className={`text-[9px] font-mono uppercase px-1 py-0.2 rounded-md shrink-0 opacity-60 ${isSelected
                  ? "bg-white/12 dark:bg-white/12 bg-black/8 text-foreground font-semibold"
                  : "bg-secondary text-muted-foreground"
                }`}
            >
              {node.tag}
            </span>
          </div>

          {/* Action icons on hover */}
          <div
            className={`flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? "opacity-100 text-white dark:text-white text-zinc-950" : "text-muted-foreground"
              }`}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className={`h-5 w-5 p-0 rounded-md ${isSelected
                      ? "hover:bg-white/12 text-white dark:text-white text-zinc-950"
                      : "hover:text-foreground hover:bg-white/8"
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Copy className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className={`h-5 w-5 p-0 rounded-md ${isSelected
                      ? "hover:bg-white/12 text-white dark:text-white text-zinc-950"
                      : "hover:text-foreground hover:bg-white/8"
                    }`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>

            <GripVertical className="size-3 cursor-grab opacity-50 ml-0.5" />
          </div>
        </div>

        {/* Children */}
        {hasChildren && !isCollapsed && (
          <div className="flex flex-col">
            {node.children?.map((child) => renderLayerNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full divide-y divide-border">
      {/* Pages Section */}
      <div className="p-3 space-y-2.5">
        {/* Framer Search Bar */}
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search..."
            className="h-7 text-xs pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-foreground px-1 tracking-tight">
            Pages
          </span>
          <Button variant="ghost" size="icon-xs" className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground cursor-pointer">
            <Plus className="size-3.5" />
          </Button>
        </div>

        <div className="space-y-1">
          {[
            { id: "home", name: "Home", path: "/", icon: <Home className="size-3.5" /> },
            { id: "about", name: "About", path: "/about", icon: <FileText className="size-3.5" /> },
          ].map((page) => (
            <div
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-all ${activePage === page.id
                  ? "bg-[#242428] text-white dark:bg-[#242428] dark:text-white bg-[#ebebed] text-zinc-950 font-medium shadow-2xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/6 dark:hover:bg-white/6 hover:bg-black/4"
                }`}
            >
              <div className="flex items-center gap-2">
                <span className={activePage === page.id ? "text-white dark:text-white text-zinc-950" : "text-muted-foreground"}>
                  {page.icon}
                </span>
                <span>{page.name}</span>
              </div>
              <span className="text-[10px] font-mono opacity-60">
                {page.path}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer Tree */}
      <div className="p-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-foreground px-1 tracking-tight">
            Layer Tree
          </span>
          <span className="text-[10px] font-mono text-muted-foreground">4 Elements</span>
        </div>

        <ScrollArea className="flex-1 space-y-0.5">
          {SAMPLE_LAYERS.map((root) => renderLayerNode(root, 0))}
        </ScrollArea>
      </div>
    </div>
  );
};
