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
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  ALL_ELEMENT_DEFINITIONS,
  ELEMENT_CATEGORIES,
  type ElementDefinitionItem,
  type ElementCategory,
} from "@/lib/elementDefinitions";
import { canDropElementIntoParent } from "@/lib/elementRules";
import { useProjectStore } from "@/store/project";
import { useEditorStore } from "@/store/editor";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const ElementsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | "all">("all");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<{ id: string; reason: string } | null>(null);

  const {
    project,
    addElementNode,
    updateNodeStyle,
    updateTextContent,
    updateNodeAttributes,
  } = useProjectStore();

  const {
    selectedNodeId,
    activePageId,
    setSelectedNodeId,
  } = useEditorStore();

  // Find target parent ID (selected element if valid, otherwise active page root, or 'root')
  const activePage = project.pages[activePageId];
  const defaultParentId = activePage?.rootElementId ?? "root";
  const targetParentNode = selectedNodeId ? project.elements[selectedNodeId] : null;
  const effectiveParentId = targetParentNode ? targetParentNode.id : defaultParentId;

  const handleAddElement = (item: ElementDefinitionItem) => {
    // Validate drop compatibility with current target parent
    const validation = canDropElementIntoParent(item, targetParentNode);

    if (!validation.allowed) {
      setErrorMessage({ id: item.id, reason: validation.reason || "Invalid parent element" });
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

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

  const filteredItems = useMemo(() => {
    return ALL_ELEMENT_DEFINITIONS.filter((item) => {
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory =
        selectedCategory === "all" || item.category === selectedCategory;

      // If user is searching or filtered by specific category, show all matching elements.
      // In the default "All" view with no search, show core elements first unless showAdvanced is toggled.
      const matchesTier =
        searchQuery.trim().length > 0 ||
        selectedCategory !== "all" ||
        showAdvanced ||
        !item.isAdvanced;

      return matchesSearch && matchesCategory && matchesTier;
    });
  }, [searchQuery, selectedCategory, showAdvanced]);

  const coreCount = ALL_ELEMENT_DEFINITIONS.filter((i) => !i.isAdvanced).length;
  const totalCount = ALL_ELEMENT_DEFINITIONS.length;

  return (
    <div className="flex flex-col select-none">
      {/* Sticky Fixed Search & Filter Rail */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-md border-b border-border/60 p-3 space-y-2.5">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tags (<p>, <div>, <input>)..."
            className="h-8 text-xs pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground focus-visible:ring-1"
          />
        </div>

        {/* Category Filter Chips & Advanced Toggle */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`text-[10px] px-2 py-0.8 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer border ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                : "bg-secondary/60 text-muted-foreground hover:text-foreground border-border/60"
            }`}
          >
            All ({showAdvanced || searchQuery ? totalCount : coreCount})
          </button>
          {ELEMENT_CATEGORIES.map((cat) => {
            const count = ALL_ELEMENT_DEFINITIONS.filter((i) => i.category === cat.id).length;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-[10px] px-2 py-0.8 rounded-full font-medium whitespace-nowrap transition-colors cursor-pointer border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-secondary/60 text-muted-foreground hover:text-foreground border-border/60"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Target Insertion Context & Advanced Toggle Bar */}
      <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-[10px] text-muted-foreground border-b border-border/30 pb-2">
        <span className="flex items-center gap-1 truncate max-w-[60%]">
          <Layers className="size-3 text-sky-500 shrink-0" />
          Target: <strong className="text-foreground font-medium truncate">{targetParentNode ? targetParentNode.name : "Page Root"}</strong>
        </span>

        {selectedCategory === "all" && !searchQuery && (
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors border ${
              showAdvanced
                ? "bg-secondary text-foreground border-border"
                : "text-muted-foreground hover:text-foreground border-transparent hover:border-border/50"
            }`}
          >
            <SlidersHorizontal className="size-2.5" />
            {showAdvanced ? "All Tags" : "Core Tags"}
          </button>
        )}
      </div>

      {/* Element List */}
      <div className="p-3 pt-2 flex flex-col gap-1.5">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => {
            const isJustAdded = justAddedId === item.id;
            const validation = canDropElementIntoParent(item, targetParentNode);
            const hasError = errorMessage?.id === item.id;

            return (
              <Tooltip key={item.id} delayDuration={300}>
                <TooltipTrigger asChild>
                  <div
                    onClick={() => handleAddElement(item)}
                    className={`group relative flex items-center justify-between p-2 rounded-lg border transition-all cursor-pointer select-none active:scale-[0.99] ${
                      hasError
                        ? "border-red-500/50 bg-red-500/10 text-red-500"
                        : !validation.allowed
                        ? "border-border/50 bg-card/30 opacity-70 hover:opacity-100 hover:border-border"
                        : "border-border/80 bg-gradient-to-r from-card to-card/60 hover:from-card hover:to-secondary/40 hover:border-foreground/25 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-7 h-7 rounded-md border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${item.accentColor}`}
                      >
                        {item.icon}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                          {item.name}
                          <span className="text-[9px] font-mono font-medium text-muted-foreground bg-secondary/90 px-1 py-0.2 rounded-md shrink-0 border border-border/50">
                            &lt;{item.tag}&gt;
                          </span>
                          {!validation.allowed && (
                            <span className="text-[9px] text-amber-500/90 font-sans font-normal px-1 py-0.2 rounded bg-amber-500/10 border border-amber-500/20">
                              Requires parent
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-muted-foreground truncate">
                          {hasError ? errorMessage.reason : item.description}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-muted-foreground group-hover:text-foreground shrink-0 ml-1.5">
                      {isJustAdded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          <Check className="size-3" /> Added
                        </span>
                      ) : hasError ? (
                        <AlertCircle className="size-3.5 text-red-500 animate-pulse" />
                      ) : !validation.allowed ? (
                        <div className="w-5 h-5 rounded flex items-center justify-center opacity-40 group-hover:opacity-100 text-amber-500">
                          <AlertCircle className="size-3" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded flex items-center justify-center opacity-40 group-hover:opacity-100 group-hover:bg-secondary transition-all">
                          <Plus className="size-3.5" />
                        </div>
                      )}
                    </div>
                  </div>
                </TooltipTrigger>
                {!validation.allowed && validation.reason && (
                  <TooltipContent side="right" className="text-xs max-w-56 text-amber-500">
                    {validation.reason}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })
        ) : (
          <div className="text-center py-8 text-xs text-muted-foreground space-y-1">
            <p>No elements matching &quot;{searchQuery}&quot;</p>
            <p className="text-[11px] text-muted-foreground/70">
              Try searching for tag names like &lt;div&gt;, &lt;h1&gt;, or &lt;button&gt;.
            </p>
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-2 p-2.5 rounded-lg border border-border/70 bg-gradient-to-br from-secondary/50 via-secondary/20 to-blue-500/5 text-xs text-muted-foreground flex flex-col gap-1 shadow-2xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5 text-[11px]">
            <Sparkles className="size-3 text-amber-500" />
            Semantic HTML Insertion
          </span>
          <span className="text-[10px] leading-relaxed">
            Click elements to insert them into the active container. Specialized elements (like <code className="font-mono text-[9px] bg-secondary/80 px-1 py-0.5 rounded">&lt;li&gt;</code> or <code className="font-mono text-[9px] bg-secondary/80 px-1 py-0.5 rounded">&lt;option&gt;</code>) validate parent compatibility automatically.
          </span>
        </div>
      </div>
    </div>
  );
};
