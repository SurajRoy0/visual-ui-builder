"use client";

import React, { useState } from "react";
import {
  Component,
  Plus,
  Search,
  Layers,
  LayoutTemplate,
  CreditCard,
  Rows3,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DummyComponent {
  id: string;
  name: string;
  category: string;
  elementCount: number;
  icon: React.ReactNode;
}

const DUMMY_COMPONENTS: DummyComponent[] = [
  {
    id: "comp-navbar",
    name: "Navigation Header",
    category: "Navigation",
    elementCount: 6,
    icon: <Rows3 className="size-3.5 text-blue" />,
  },
  {
    id: "comp-hero",
    name: "Hero Banner with CTA",
    category: "Hero",
    elementCount: 5,
    icon: <LayoutTemplate className="size-3.5 text-purple-500" />,
  },
  {
    id: "comp-feature-card",
    name: "Feature Showcase Card",
    category: "Cards",
    elementCount: 4,
    icon: <Sparkles className="size-3.5 text-emerald-500" />,
  },
  {
    id: "comp-pricing",
    name: "Pricing Tier Card",
    category: "Marketing",
    elementCount: 8,
    icon: <CreditCard className="size-3.5 text-amber-500" />,
  },
  {
    id: "comp-footer",
    name: "Standard Footer",
    category: "Footers",
    elementCount: 7,
    icon: <Layers className="size-3.5 text-indigo-500" />,
  },
];

export const ComponentsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredComponents = DUMMY_COMPONENTS.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search components..."
          className="h-7 text-xs pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
        />
      </div>

      {/* Header & Create Button */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-foreground px-1 tracking-tight">
          Components ({filteredComponents.length})
        </span>
        <Button
          variant="outline"
          size="xs"
          className="h-6 text-[10px] gap-1 px-2 rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/8"
        >
          <Plus className="size-3" />
          Create
        </Button>
      </div>

      {/* Components List */}
      {filteredComponents.length > 0 ? (
        <div className="space-y-1.5">
          {filteredComponents.map((comp) => (
            <div
              key={comp.id}
              className="group flex items-center justify-between p-2 rounded-md border border-border bg-card hover:bg-black/4 dark:hover:bg-white/6 hover:border-foreground/30 transition-all cursor-pointer shadow-2xs select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0 group-hover:border-foreground/30">
                  {comp.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground truncate max-w-44">
                    {comp.name}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-mono">
                    <span>{comp.category}</span>
                    <span>• {comp.elementCount} elements</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity text-muted-foreground group-hover:text-foreground shrink-0 ml-1">
                <Plus className="size-3.5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-muted-foreground">
          No components matching &quot;{searchQuery}&quot;
        </div>
      )}

      {/* Info notice */}
      <div className="mt-1 p-2.5 rounded-md border border-border bg-secondary/30 text-[11px] text-muted-foreground flex flex-col gap-1">
        <span className="font-semibold text-foreground flex items-center gap-1">
          💡 Reusable Symbols:
        </span>
        <span>Drag components to insert synced instances into any page layout.</span>
      </div>
    </div>
  );
};
