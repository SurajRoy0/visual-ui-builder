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
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Layers as LayersIcon,
  LayoutTemplate,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

interface DummyLayerNode {
  id: string;
  name: string;
  type: "box" | "text" | "button" | "section";
  tag: string;
  children?: DummyLayerNode[];
}

const DUMMY_PAGES = [
  { id: "home", name: "Home", path: "/", icon: <Home className="size-3.5" /> },
  { id: "about", name: "About", path: "/about", icon: <FileText className="size-3.5" /> },
  { id: "pricing", name: "Pricing", path: "/pricing", icon: <LayoutTemplate className="size-3.5" /> },
];

const DUMMY_LAYERS: DummyLayerNode[] = [
  {
    id: "root-page",
    name: "Page Container",
    type: "box",
    tag: "main",
    children: [
      {
        id: "nav-bar",
        name: "Navbar",
        type: "box",
        tag: "header",
        children: [
          {
            id: "brand-logo",
            name: "Brand Logo",
            type: "text",
            tag: "span",
          },
          {
            id: "nav-menu",
            name: "Navigation Links",
            type: "box",
            tag: "nav",
          },
        ],
      },
      {
        id: "hero-section",
        name: "Hero Section",
        type: "section",
        tag: "section",
        children: [
          {
            id: "hero-heading",
            name: "Main Headline",
            type: "text",
            tag: "h1",
          },
          {
            id: "hero-desc",
            name: "Subheading Paragraph",
            type: "text",
            tag: "p",
          },
          {
            id: "hero-buttons",
            name: "CTA Button Group",
            type: "box",
            tag: "div",
            children: [
              {
                id: "btn-primary",
                name: "Get Started Button",
                type: "button",
                tag: "button",
              },
              {
                id: "btn-secondary",
                name: "Learn More Link",
                type: "text",
                tag: "a",
              },
            ],
          },
        ],
      },
      {
        id: "features-grid",
        name: "Features Grid",
        type: "box",
        tag: "div",
        children: [
          {
            id: "card-1",
            name: "Feature Card 01",
            type: "box",
            tag: "article",
          },
          {
            id: "card-2",
            name: "Feature Card 02",
            type: "box",
            tag: "article",
          },
        ],
      },
    ],
  },
];

export const LayersTab: React.FC = () => {
  const [activePage, setActivePage] = useState("home");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>("hero-heading");
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const [hiddenNodes, setHiddenNodes] = useState<Record<string, boolean>>({});
  const [lockedNodes, setLockedNodes] = useState<Record<string, boolean>>({});

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleHidden = (id: string) => {
    setHiddenNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLocked = (id: string) => {
    setLockedNodes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const countNodes = (nodes: DummyLayerNode[]): number => {
    return nodes.reduce((acc, node) => acc + 1 + (node.children ? countNodes(node.children) : 0), 0);
  };

  const filterNode = (node: DummyLayerNode, query: string): DummyLayerNode | null => {
    if (!query) return node;
    const matches =
      node.name.toLowerCase().includes(query.toLowerCase()) ||
      node.tag.toLowerCase().includes(query.toLowerCase());

    const filteredChildren = node.children
      ? node.children.map((child) => filterNode(child, query)).filter(Boolean) as DummyLayerNode[]
      : [];

    if (matches || filteredChildren.length > 0) {
      return {
        ...node,
        children: filteredChildren.length > 0 ? filteredChildren : node.children,
      };
    }
    return null;
  };

  const filteredLayers = DUMMY_LAYERS.map((node) => filterNode(node, searchQuery)).filter(
    Boolean
  ) as DummyLayerNode[];

  const getNodeIcon = (type: DummyLayerNode["type"]) => {
    switch (type) {
      case "text":
        return <Type className="size-3.5 text-purple-400" />;
      case "section":
        return <LayersIcon className="size-3.5 text-sky-400" />;
      case "button":
        return <Square className="size-3.5 text-amber-400" />;
      case "box":
      default:
        return <Square className="size-3.5 text-blue-400" />;
    }
  };

  const renderLayerNode = (node: DummyLayerNode, depth = 0) => {
    const isSelected = selectedLayerId === node.id;
    const hasChildren = Boolean(node.children && node.children.length > 0);
    const isCollapsed = collapsedNodes[node.id];
    const isHidden = hiddenNodes[node.id];
    const isLocked = lockedNodes[node.id];

    return (
      <div key={node.id} className="flex flex-col">
        <div
          onClick={() => setSelectedLayerId(node.id)}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className={`group flex items-center justify-between py-1.5 pr-2 rounded-md text-xs cursor-pointer select-none border transition-colors duration-150 ${
            isSelected
              ? "bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent border-blue-500/30 text-foreground font-medium shadow-2xs"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60"
          } ${isHidden ? "opacity-40" : ""}`}
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
                className="h-4 w-4 p-0 rounded-md cursor-pointer text-muted-foreground hover:text-foreground"
              >
                {isCollapsed ? <ChevronRight className="size-3" /> : <ChevronDown className="size-3" />}
              </Button>
            ) : (
              <span className="w-3" />
            )}

            <div className="p-0.5 rounded-md">
              {getNodeIcon(node.type)}
            </div>

            <span className="truncate text-xs font-medium text-foreground">{node.name}</span>

            <span
              className={`text-[10px] font-mono font-medium uppercase px-1.5 py-0.5 rounded-md shrink-0 opacity-70 ${
                isSelected
                  ? "bg-secondary text-foreground font-semibold"
                  : "bg-secondary/60 text-muted-foreground"
              }`}
            >
              {node.tag}
            </span>
          </div>

          {/* Action icons on hover / state */}
          <div
            className={`flex items-center gap-0.5 transition-opacity ${isSelected || isHidden || isLocked
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
              }`}
          >
            {/* Visibility Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-5 w-5 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleHidden(node.id);
                  }}
                >
                  {isHidden ? <EyeOff className="size-3 text-amber-500" /> : <Eye className="size-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isHidden ? "Show layer" : "Hide layer"}</TooltipContent>
            </Tooltip>

            {/* Lock Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-5 w-5 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLocked(node.id);
                  }}
                >
                  {isLocked ? <Lock className="size-3 text-amber-500" /> : <Unlock className="size-3" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isLocked ? "Unlock layer" : "Lock layer"}</TooltipContent>
            </Tooltip>

            {/* Duplicate Dummy */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-5 w-5 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Copy className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Duplicate</TooltipContent>
            </Tooltip>

            {/* Delete Dummy */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  className="h-5 w-5 p-0 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Trash2 className="size-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>

            <GripVertical className="size-3 cursor-grab opacity-40 ml-0.5" />
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
    <div className="flex flex-col h-full">
      {/* Sticky Fixed Search Bar */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs p-3 border-b border-border/50">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search layers & tags..."
            className="h-8 text-xs pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Pages Section */}
      <div className="p-3 space-y-2.5 border-b border-border">
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-xs font-semibold text-foreground px-1 tracking-tight">
            Pages
          </span>
          <Button
            variant="ghost"
            size="icon-xs"
            className="h-5 w-5 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <Plus className="size-3.5" />
          </Button>
        </div>

        <div className="space-y-1">
          {DUMMY_PAGES.map((page) => (
            <div
              key={page.id}
              onClick={() => setActivePage(page.id)}
              className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs cursor-pointer border transition-colors duration-150 ${
                activePage === page.id
                  ? "bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent border-blue-500/30 text-foreground font-medium shadow-2xs"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={
                    activePage === page.id
                      ? "text-blue-500"
                      : "text-muted-foreground"
                  }
                >
                  {page.icon}
                </span>
                <span className="font-medium">{page.name}</span>
              </div>
              <span className="text-[11px] font-mono opacity-70">{page.path}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Layer Tree */}
      <div className="p-3 flex-1 flex flex-col min-h-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[13px] font-semibold text-foreground px-1 tracking-tight">
            Layer Tree
          </span>
          <span className="text-[11px] font-mono text-muted-foreground font-medium">
            {countNodes(filteredLayers)} Elements
          </span>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto space-y-0.5">
          {filteredLayers.length > 0 ? (
            filteredLayers.map((root) => renderLayerNode(root, 0))
          ) : (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No matching layers found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
