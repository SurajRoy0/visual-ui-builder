"use client";

import React, { useState, useMemo } from "react";
import {
  Search,
  Plus,
  Sparkles,
  Layers,
  Check,
  AlertCircle,
  SlidersHorizontal,
  X,
  Ban,
  ChevronDown,
  ChevronRight,
  Layout,
  Type,
  Image as ImageIcon,
  FormInput,
  List,
  Table as TableIcon,
  MousePointerClick,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  ALL_ELEMENT_DEFINITIONS,
  ELEMENT_CATEGORIES,
  type ElementDefinitionItem,
  type ElementCategory,
} from "@/lib/elementDefinitions";
import { setGlobalDraggedDefinition } from "@/lib/dropTargetResolution";
import { canDropElementIntoParent } from "@/lib/elementRules";
import { useProjectStore } from "@/store/project";
import { useEditorStore } from "@/store/editor";

const CATEGORY_ICONS: Record<ElementCategory, React.ReactNode> = {
  structure: <Layout className="size-3.5 text-sky-500" />,
  typography: <Type className="size-3.5 text-emerald-500" />,
  media: <ImageIcon className="size-3.5 text-pink-500" />,
  forms: <FormInput className="size-3.5 text-amber-500" />,
  lists: <List className="size-3.5 text-indigo-500" />,
  tables: <TableIcon className="size-3.5 text-teal-500" />,
  interactive: <MousePointerClick className="size-3.5 text-violet-500" />,
};

export const ElementsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | "all">("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ id: string; tagName: string; reason: string } | null>(null);

  const addElementNode = useProjectStore((state) => state.addElementNode);
  const updateNodeStyle = useProjectStore((state) => state.updateNodeStyle);
  const updateTextContent = useProjectStore((state) => state.updateTextContent);
  const updateNodeAttributes = useProjectStore((state) => state.updateNodeAttributes);

  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const activePageId = useEditorStore((state) => state.activePageId);
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);

  // Find target parent ID (selected element if valid, otherwise active page root, or 'root')
  const activePage = useProjectStore((state) => state.project.pages[activePageId]);
  const defaultParentId = activePage?.rootElementId ?? "root";
  const targetParentNode = useProjectStore((state) =>
    selectedNodeId ? state.project.elements[selectedNodeId] : null
  );
  const effectiveParentId = targetParentNode ? targetParentNode.id : defaultParentId;

  const handleAddElement = (item: ElementDefinitionItem) => {
    // Validate drop compatibility with current target parent
    const validation = canDropElementIntoParent(item, targetParentNode);

    if (!validation.allowed) {
      setErrorMessage({
        id: item.id,
        tagName: item.tag,
        reason: validation.reason || "Invalid parent element",
      });
      return;
    }

    // Clear any previous error message on valid click
    setErrorMessage(null);

    const newId = addElementNode({
      tag: item.tag,
      parentId: effectiveParentId,
      name: item.name,
    });

    if (newId) {
      if (item.defaultStyle) {
        updateNodeStyle(newId, item.defaultStyle);
      }
      if (item.defaultContent) {
        updateTextContent(newId, item.defaultContent);
      }
      if (item.defaultAttributes) {
        updateNodeAttributes(newId, item.defaultAttributes);
      }

      setSelectedNodeId(newId);
      setJustAddedId(item.id);
      setTimeout(() => setJustAddedId(null), 1200);
    }
  };

  const toggleCategoryCollapse = (categoryId: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const visibleElements = useMemo(() => {
    return ALL_ELEMENT_DEFINITIONS.filter((item) => showAdvanced || !item.isAdvanced);
  }, [showAdvanced]);

  const groupedCategories = useMemo(() => {
    const categoriesToInclude =
      selectedCategory === "all"
        ? ELEMENT_CATEGORIES
        : ELEMENT_CATEGORIES.filter((c) => c.id === selectedCategory);

    return categoriesToInclude
      .map((cat) => ({
        ...cat,
        items: ALL_ELEMENT_DEFINITIONS.filter((item) => {
          if (item.category !== cat.id) return false;

          // Advanced flag filtering
          if (!showAdvanced && item.isAdvanced) {
            return false;
          }

          // Search query filtering
          if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
              item.name.toLowerCase().includes(query) ||
              item.tag.toLowerCase().includes(query) ||
              item.description.toLowerCase().includes(query);
            if (!matchesSearch) return false;
          }

          return true;
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [searchQuery, selectedCategory, showAdvanced]);

  const totalMatchingItems = useMemo(() => {
    return groupedCategories.reduce((acc, group) => acc + group.items.length, 0);
  }, [groupedCategories]);

  return (
    <div className="flex flex-col select-none">
      {/* Sticky Fixed Search & Filter Rail */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/60 p-3 space-y-2.5">
        <div className="relative">
          <Search className="size-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags (<p>, <div>, <input>)..."
            className="h-8.5 text-xs pl-8.5 bg-secondary/50 border-border/70 placeholder:text-muted-foreground focus-visible:ring-1"
          />
        </div>

        {/* Category Filter Chips & Advanced Toggle */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 pb-2">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
              selectedCategory === "all"
                ? "bg-foreground text-background font-semibold"
                : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({visibleElements.length})
          </button>
          {ELEMENT_CATEGORIES.map((cat) => {
            const count = visibleElements.filter((i) => i.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors cursor-pointer shrink-0 ${
                  isSelected
                    ? "bg-foreground text-background font-semibold"
                    : "bg-secondary text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Insertion Context & Advanced Toggle Bar */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 pb-2">
        <span className="flex items-center gap-1.5 truncate max-w-[60%]">
          <Layers className="size-3.5 text-sky-500 shrink-0" />
          Target: <strong className="text-foreground font-semibold truncate">{targetParentNode ? targetParentNode.name : "Page Root"}</strong>
        </span>

        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors border cursor-pointer shrink-0 ${
            showAdvanced
              ? "bg-foreground text-background border-foreground font-semibold shadow-xs"
              : "text-muted-foreground hover:text-foreground border-border/70 hover:border-border bg-secondary/50"
          }`}
          title={showAdvanced ? "Showing all tags (including advanced/specialized)" : "Showing core tags only (click to show advanced)"}
        >
          <SlidersHorizontal className="size-3" />
          {showAdvanced ? "All Tags" : "Core Tags"}
        </button>
      </div>

      {/* Persistent Error / Warning Alert Banner */}
      {errorMessage && (
        <div className="mx-3 mt-2.5 p-3 rounded-lg border border-amber-500/40 bg-amber-500/10 text-foreground flex items-start justify-between gap-2.5 shadow-sm animate-in fade-in-0 zoom-in-95">
          <div className="flex items-start gap-2 min-w-0 flex-1">
            <AlertCircle className="size-4 shrink-0 mt-0.5 text-amber-500" />
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-foreground">
                Cannot insert &lt;{errorMessage.tagName}&gt;
              </span>
              <span className="text-xs text-amber-700 dark:text-amber-300 font-medium leading-relaxed break-words mt-0.5">
                {errorMessage.reason}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="p-1 rounded-md hover:bg-amber-500/20 text-muted-foreground hover:text-foreground transition-colors cursor-pointer shrink-0"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}

      {/* Grouped Category Elements List */}
      <div className="p-3 pt-2.5 flex flex-col gap-4">
        {groupedCategories.length > 0 ? (
          groupedCategories.map((group) => {
            const isCollapsed = Boolean(collapsedCategories[group.id]);

            return (
              <div key={group.id} className="flex flex-col gap-2">
                {/* Category Heading */}
                <button
                  type="button"
                  onClick={() => toggleCategoryCollapse(group.id)}
                  className="flex items-center justify-between px-1 py-1 rounded-md text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-secondary/40 transition-colors cursor-pointer group/cat border-b border-border/40 pb-1.5"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="shrink-0">{CATEGORY_ICONS[group.id]}</span>
                    <span className="font-semibold text-foreground text-xs tracking-tight">
                      {group.label}
                    </span>
                    <span className="text-[10px] font-mono font-medium text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded-full border border-border/50">
                      {group.items.length}
                    </span>
                  </div>
                  <div className="text-muted-foreground group-hover/cat:text-foreground transition-transform">
                    {isCollapsed ? (
                      <ChevronRight className="size-3.5" />
                    ) : (
                      <ChevronDown className="size-3.5" />
                    )}
                  </div>
                </button>

                {/* Category Items */}
                {!isCollapsed && (
                  <div className="flex flex-col gap-2 pt-0.5">
                    {group.items.map((item) => {
                      const isJustAdded = justAddedId === item.id;
                      const validation = canDropElementIntoParent(item, targetParentNode);
                      const isItemInError = errorMessage?.id === item.id;
                      const isAllowed = validation.allowed;

                      return (
                        <div
                          key={item.id}
                          draggable={true}
                          onDragStart={(e) => {
                            setGlobalDraggedDefinition(item);
                            const { icon: _icon, ...serializableItem } = item;
                            e.dataTransfer.setData(
                              "application/x-playfull-element",
                              JSON.stringify(serializableItem)
                            );
                            e.dataTransfer.effectAllowed = "copy";
                          }}
                          onDragEnd={() => {
                            setGlobalDraggedDefinition(null);
                          }}
                          onClick={() => handleAddElement(item)}
                          className={`group relative flex flex-col p-2.5 rounded-lg border transition-all select-none cursor-grab active:cursor-grabbing ${
                            !isAllowed
                              ? "bg-secondary/15 border-border/50 hover:border-amber-500/40"
                              : isItemInError
                                ? "border-amber-500/60 bg-amber-500/10 shadow-xs"
                                : "border-border/80 bg-gradient-to-r from-card to-card/60 hover:from-card hover:to-secondary/40 hover:border-foreground/25 hover:shadow-xs active:scale-[0.99]"
                          }`}
                        >
                          {/* Main Card Header */}
                          <div className="flex items-center justify-between gap-2 min-w-0 w-full">
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div
                                className={`w-7.5 h-7.5 rounded-md border flex items-center justify-center shrink-0 transition-transform shadow-2xs ${
                                  isAllowed ? "group-hover:scale-105" : "grayscale opacity-75"
                                } ${item.accentColor}`}
                              >
                                {item.icon}
                              </div>

                              <div className="flex flex-col min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <span
                                    className={`text-xs font-semibold truncate ${
                                      isAllowed ? "text-foreground" : "text-foreground/80"
                                    }`}
                                  >
                                    {item.name}
                                  </span>
                                  <span className="text-[10px] font-mono font-medium text-foreground/75 bg-secondary/90 px-1.5 py-0.5 rounded-md shrink-0 border border-border/60">
                                    &lt;{item.tag}&gt;
                                  </span>
                                </div>
                                <span className="text-xs text-muted-foreground truncate leading-relaxed">
                                  {item.description}
                                </span>
                              </div>
                            </div>

                            {/* Action or Status Badge */}
                            <div className="flex items-center justify-end shrink-0 ml-1">
                              {isJustAdded ? (
                                <span className="inline-flex items-center gap-1 text-xs text-emerald-500 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/25">
                                  <Check className="size-3.5" /> Added
                                </span>
                              ) : !isAllowed ? (
                                <div className="w-5.5 h-5.5 rounded flex items-center justify-center text-amber-500/80 bg-amber-500/10 border border-amber-500/20">
                                  <Ban className="size-3.5" />
                                </div>
                              ) : (
                                <div className="w-5.5 h-5.5 rounded flex items-center justify-center opacity-50 group-hover:opacity-100 group-hover:bg-secondary transition-all text-muted-foreground group-hover:text-foreground">
                                  <Plus className="size-4" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Inline constraint explanation */}
                          {!isAllowed && validation.reason && (
                            <div className="mt-2 pt-2 border-t border-border/40 text-xs flex items-start gap-1.5 leading-relaxed text-amber-700 dark:text-amber-300 font-medium">
                              <AlertCircle className="size-3.5 shrink-0 text-amber-500 mt-0.5" />
                              <span className="break-words flex-1">{validation.reason}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground space-y-1">
            <p>No elements matching &quot;{searchQuery}&quot;</p>
            <p className="text-xs text-muted-foreground/70">
              Try searching for tag names like &lt;div&gt;, &lt;h1&gt;, or &lt;button&gt;.
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-2 p-3 rounded-lg border border-border/70 bg-gradient-to-br from-secondary/50 via-secondary/20 to-blue-500/5 text-xs text-muted-foreground flex flex-col gap-1.5 shadow-2xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5 text-xs">
            <Sparkles className="size-3.5 text-amber-500" />
            Semantic HTML Insertion
          </span>
          <span className="text-xs leading-relaxed">
            Click elements to insert them into the active container. Specialized elements (like <code className="font-mono text-[11px] bg-secondary px-1.5 py-0.5 rounded font-medium text-foreground">&lt;li&gt;</code> or <code className="font-mono text-[11px] bg-secondary px-1.5 py-0.5 rounded font-medium text-foreground">&lt;option&gt;</code>) activate when a valid parent container is targeted.
          </span>
        </div>
      </div>
    </div>
  );
};

