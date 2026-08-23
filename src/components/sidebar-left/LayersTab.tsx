"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Square,
  Type,
  Trash2,
  Copy,
  ChevronDown,
  ChevronRight,
  Plus,
  FileText,
  Search,
  Layout,
  MousePointerClick,
  Image as ImageIcon,
  FormInput,
  List,
  Table as TableIcon,
  Layers as LayersIcon,
  ArrowUp,
  ArrowDown,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { useProjectStore } from "@/store/project";
import { useEditorStore } from "@/store/editor";
import type { ElementNode, ID, TreeNode } from "@/types/project";
import { isPageRoot, isDescendant } from "@/store/project/utils";

// Icon selector based on HTML tag
const getLayerIcon = (tag: string) => {
  switch (tag) {
    case "h1":
    case "h2":
    case "h3":
    case "h4":
    case "h5":
    case "h6":
    case "p":
    case "span":
    case "strong":
    case "em":
    case "blockquote":
      return <Type className="size-3.5 text-purple-400 shrink-0" />;
    case "button":
    case "a":
      return <MousePointerClick className="size-3.5 text-blue-400 shrink-0" />;
    case "img":
      return <ImageIcon className="size-3.5 text-emerald-400 shrink-0" />;
    case "form":
    case "input":
    case "textarea":
    case "select":
      return <FormInput className="size-3.5 text-amber-400 shrink-0" />;
    case "ul":
    case "ol":
    case "li":
      return <List className="size-3.5 text-indigo-400 shrink-0" />;
    case "table":
    case "tr":
    case "td":
    case "th":
      return <TableIcon className="size-3.5 text-teal-400 shrink-0" />;
    case "section":
    case "article":
    case "main":
    case "header":
    case "footer":
    case "nav":
      return <Layout className="size-3.5 text-sky-400 shrink-0" />;
    default:
      return <Square className="size-3.5 text-sky-400 shrink-0" />;
  }
};

interface LayerItemProps {
  nodeId: ID;
  depth: number;
  searchFilter: string;
  collapsedIds: Set<ID>;
  onToggleCollapse: (id: ID) => void;
}

const LayerItem: React.FC<LayerItemProps> = ({
  nodeId,
  depth,
  searchFilter,
  collapsedIds,
  onToggleCollapse,
}) => {
  const node = useProjectStore((state) => state.project.elements[nodeId]) as
    | TreeNode
    | undefined;
  const elements = useProjectStore((state) => state.project.elements);
  const pages = useProjectStore((state) => state.project.pages);
  const renameNode = useProjectStore((state) => state.renameNode);
  const removeNode = useProjectStore((state) => state.removeNode);
  const moveNode = useProjectStore((state) => state.moveNode);
  const duplicateNode = useProjectStore((state) => state.duplicateNode);
  const addElementNode = useProjectStore((state) => state.addElementNode);

  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const isSelected = selectedNodeId === nodeId;
  const isRoot = isPageRoot(pages, nodeId);

  // Purely derived expanded state: auto-expanded if an ancestor of selectedNodeId
  const isAncestorOfSelected = Boolean(
    selectedNodeId &&
      selectedNodeId !== nodeId &&
      isDescendant(elements, nodeId, selectedNodeId)
  );
  const isExpanded = isAncestorOfSelected || !collapsedIds.has(nodeId);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!node) return null;

  const tag = (node.type === "element" ? (node as ElementNode).tag : "div") || "div";
  const children = node.type === "element" ? (node as ElementNode).children : [];
  const hasChildren = children.length > 0;
  const isContainer = [
    "div",
    "section",
    "article",
    "main",
    "header",
    "footer",
    "nav",
    "aside",
    "form",
  ].includes(tag);

  // Filter matching
  const matchesSearch =
    !searchFilter ||
    node.name.toLowerCase().includes(searchFilter) ||
    tag.toLowerCase().includes(searchFilter);

  const handleStartRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditName(node.name);
    setIsEditing(true);
  };

  const handleSaveRename = () => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== node.name) {
      renameNode(nodeId, trimmed);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSaveRename();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRoot) return;
    removeNode(nodeId);
    if (isSelected) {
      setSelectedNodeId(null);
    }
  };

  const handleDuplicate = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isRoot) return;
    const newId = duplicateNode(nodeId);
    if (newId) {
      setSelectedNodeId(newId);
    }
  };

  const handleAddChild = (e: React.MouseEvent, childTag: "div" | "h1") => {
    e.stopPropagation();
    const newId = addElementNode({
      tag: childTag,
      parentId: nodeId,
      name: childTag === "div" ? "Box Container" : "Heading Text",
    });
    if (newId) {
      if (collapsedIds.has(nodeId)) {
        onToggleCollapse(nodeId);
      }
      setSelectedNodeId(newId);
    }
  };

  const handleMove = (e: React.MouseEvent, direction: "up" | "down") => {
    e.stopPropagation();
    if (isRoot || !node.parentId) return;
    const parent = elements[node.parentId];
    if (!parent || parent.type !== "element") return;

    const currentIndex = parent.children.indexOf(nodeId);
    if (currentIndex === -1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= parent.children.length) return;

    moveNode({
      nodeId,
      newParentId: node.parentId,
      index: targetIndex,
    });
  };

  return (
    <div className="flex flex-col select-none">
      {/* Node Row */}
      {matchesSearch && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setSelectedNodeId(nodeId);
          }}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className={`group flex items-center justify-between h-8 pr-2 text-xs transition-colors cursor-pointer border-l-2 ${
            isSelected
              ? "bg-primary/15 text-foreground border-primary font-medium"
              : "border-transparent text-muted-foreground hover:bg-secondary/60 hover:text-foreground"
          }`}
        >
          {/* Left: Expand toggle + Icon + Name */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            {/* Expand / Collapse Chevron */}
            {hasChildren ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleCollapse(nodeId);
                }}
                className="w-4 h-4 flex items-center justify-center rounded hover:bg-black/10 dark:hover:bg-white/10 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
              >
                {isExpanded ? (
                  <ChevronDown className="size-3" />
                ) : (
                  <ChevronRight className="size-3" />
                )}
              </button>
            ) : (
              <span className="w-4 shrink-0" />
            )}

            {/* Layer Icon */}
            {getLayerIcon(tag)}

            {/* Layer Name / Inline Input */}
            {isEditing ? (
              <div className="flex items-center gap-1 flex-1 min-w-0 pr-1">
                <input
                  ref={inputRef}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={handleSaveRename}
                  onKeyDown={handleKeyDown}
                  className="h-5 text-xs px-1 bg-background border border-primary rounded text-foreground outline-none flex-1 min-w-0"
                />
                <button
                  type="button"
                  onClick={handleSaveRename}
                  className="w-4 h-4 flex items-center justify-center text-primary"
                >
                  <Check className="size-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-4 h-4 flex items-center justify-center text-muted-foreground"
                >
                  <X className="size-3" />
                </button>
              </div>
            ) : (
              <div
                onDoubleClick={handleStartRename}
                className="flex items-center gap-1.5 truncate flex-1"
              >
                <span className="truncate">{node.name}</span>
                <span className="text-[10px] font-mono opacity-50 px-1 py-0.2 rounded bg-secondary/80 shrink-0">
                  &lt;{tag}&gt;
                </span>
              </div>
            )}
          </div>

          {/* Right Action Icons (visible on hover / selected) */}
          {!isEditing && (
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              {/* Add child if container */}
              {isContainer && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={(e) => handleAddChild(e, "div")}
                      className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Plus className="size-3" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent>Add Child Box</TooltipContent>
                </Tooltip>
              )}

              {/* Move Up / Down */}
              {!isRoot && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => handleMove(e, "up")}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <ArrowUp className="size-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Move Up</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={(e) => handleMove(e, "down")}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <ArrowDown className="size-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Move Down</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleStartRename}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Edit2 className="size-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Rename Layer</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleDuplicate}
                        className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        <Copy className="size-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Duplicate</TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive cursor-pointer"
                      >
                        <Trash2 className="size-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Children Nodes */}
      {hasChildren && isExpanded && (
        <div className="flex flex-col">
          {children.map((childId) => (
            <LayerItem
              key={childId}
              nodeId={childId}
              depth={depth + 1}
              searchFilter={searchFilter}
              collapsedIds={collapsedIds}
              onToggleCollapse={onToggleCollapse}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const LayersTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [collapsedIds, setCollapsedIds] = useState<Set<ID>>(new Set());

  const pages = useProjectStore((state) => state.project.pages);
  const elements = useProjectStore((state) => state.project.elements);
  const activePageId = useEditorStore((state) => state.activePageId);
  const setActivePageId = useEditorStore((state) => state.setActivePageId);

  const activePage = pages[activePageId] || Object.values(pages)[0];
  const rootElementId = activePage?.rootElementId || "root";

  const totalElementsCount = Object.keys(elements).length;

  const handleToggleCollapse = (id: ID) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <div className="flex flex-col h-full bg-background select-none">
      {/* Top Search & Active Page Bar */}
      <div className="p-3 border-b border-border/60 space-y-2.5 bg-card/40">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <LayersIcon className="size-3.5 text-primary" />
            <span>Document Layers</span>
          </div>
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
            {totalElementsCount} node{totalElementsCount !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Page Switcher */}
        {Object.keys(pages).length > 1 && (
          <div className="flex flex-wrap gap-1">
            {Object.values(pages).map((p) => (
              <Button
                key={p.id}
                variant={p.id === activePage?.id ? "default" : "outline"}
                size="xs"
                onClick={() => setActivePageId(p.id)}
                className="h-6 text-[11px] gap-1 px-2 cursor-pointer"
              >
                <FileText className="size-3" />
                <span>{p.name}</span>
              </Button>
            ))}
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter layers by name or <tag>..."
            className="h-7 text-xs font-normal pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Layer Tree Scroll Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1.5">
        {elements[rootElementId] ? (
          <LayerItem
            nodeId={rootElementId}
            depth={0}
            searchFilter={searchQuery.toLowerCase().trim()}
            collapsedIds={collapsedIds}
            onToggleCollapse={handleToggleCollapse}
          />
        ) : (
          <div className="p-6 text-center text-xs text-muted-foreground">
            No elements found in current document.
          </div>
        )}
      </div>
    </div>
  );
};
