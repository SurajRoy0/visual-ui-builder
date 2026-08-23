"use client";

import React, { useState } from "react";
import {
  Square,
  Type,
  Plus,
  Search,
  Layout,
  Heading1,
  MousePointerClick,
  Image as ImageIcon,
  Link as LinkIcon,
  Minus,
  FormInput,
  Layers,
  Columns3,
  AlignLeft,
  Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ElementPrimitive {
  id: string;
  name: string;
  tag: string;
  description: string;
  category: "layout" | "typography" | "media_form";
  icon: React.ReactNode;
  accentColor: string;
}

const PRIMITIVES: ElementPrimitive[] = [
  // Layout
  {
    id: "box",
    name: "Box",
    tag: "<div>",
    description: "Flexible layout container",
    category: "layout",
    icon: <Square className="size-3.5 text-blue" />,
    accentColor: "bg-blue-500/10 border-blue-500/20 text-blue-500",
  },
  {
    id: "section",
    name: "Section",
    tag: "<section>",
    description: "Full-width content block",
    category: "layout",
    icon: <Layout className="size-3.5 text-sky-500" />,
    accentColor: "bg-sky-500/10 border-sky-500/20 text-sky-500",
  },
  {
    id: "grid",
    name: "Grid Container",
    tag: "<div>",
    description: "Multi-column CSS grid",
    category: "layout",
    icon: <Columns3 className="size-3.5 text-indigo-500" />,
    accentColor: "bg-indigo-500/10 border-indigo-500/20 text-indigo-500",
  },
  {
    id: "container",
    name: "Main Container",
    tag: "<main>",
    description: "Semantic page wrapper",
    category: "layout",
    icon: <Layers className="size-3.5 text-violet-500" />,
    accentColor: "bg-violet-500/10 border-violet-500/20 text-violet-500",
  },

  // Typography
  {
    id: "heading",
    name: "Heading 1",
    tag: "<h1>",
    description: "Primary page title",
    category: "typography",
    icon: <Heading1 className="size-3.5 text-purple-500" />,
    accentColor: "bg-purple-500/10 border-purple-500/20 text-purple-500",
  },
  {
    id: "paragraph",
    name: "Paragraph",
    tag: "<p>",
    description: "Typography & text block",
    category: "typography",
    icon: <Type className="size-3.5 text-pink-500" />,
    accentColor: "bg-pink-500/10 border-pink-500/20 text-pink-500",
  },
  {
    id: "text-span",
    name: "Text Span",
    tag: "<span>",
    description: "Inline inline-block snippet",
    category: "typography",
    icon: <AlignLeft className="size-3.5 text-rose-500" />,
    accentColor: "bg-rose-500/10 border-rose-500/20 text-rose-500",
  },

  // Media & Interactive
  {
    id: "button",
    name: "Button",
    tag: "<button>",
    description: "Clickable action trigger",
    category: "media_form",
    icon: <MousePointerClick className="size-3.5 text-amber-500" />,
    accentColor: "bg-amber-500/10 border-amber-500/20 text-amber-500",
  },
  {
    id: "image",
    name: "Image",
    tag: "<img>",
    description: "Responsive graphic frame",
    category: "media_form",
    icon: <ImageIcon className="size-3.5 text-emerald-500" />,
    accentColor: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
  },
  {
    id: "link",
    name: "Hyperlink",
    tag: "<a>",
    description: "Navigation anchor link",
    category: "media_form",
    icon: <LinkIcon className="size-3.5 text-cyan-500" />,
    accentColor: "bg-cyan-500/10 border-cyan-500/20 text-cyan-500",
  },
  {
    id: "input",
    name: "Text Input",
    tag: "<input>",
    description: "User form input field",
    category: "media_form",
    icon: <FormInput className="size-3.5 text-teal-500" />,
    accentColor: "bg-teal-500/10 border-teal-500/20 text-teal-500",
  },
  {
    id: "divider",
    name: "Divider",
    tag: "<hr>",
    description: "Horizontal visual rule",
    category: "media_form",
    icon: <Minus className="size-3.5 text-zinc-400" />,
    accentColor: "bg-zinc-500/10 border-zinc-500/20 text-zinc-400",
  },
];

export const ElementsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPrimitives = PRIMITIVES.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const layoutPrimitives = filteredPrimitives.filter((p) => p.category === "layout");
  const typographyPrimitives = filteredPrimitives.filter((p) => p.category === "typography");
  const mediaPrimitives = filteredPrimitives.filter((p) => p.category === "media_form");

  const renderPrimitiveGroup = (title: string, items: ElementPrimitive[]) => {
    if (items.length === 0) return null;
    return (
      <div className="space-y-1.5">
        <h4 className="text-[11px] font-semibold tracking-wider uppercase text-muted-foreground px-1">
          {title} ({items.length})
        </h4>
        <div className="grid grid-cols-1 gap-1.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="group relative flex items-center justify-between p-2 rounded-lg border border-border/80 bg-gradient-to-r from-card to-card/60 hover:from-card hover:to-secondary/40 hover:border-foreground/25 hover:shadow-xs transition-all cursor-pointer select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-md border flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs ${item.accentColor}`}
                >
                  {item.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                    {item.name}
                    <span className="text-[10px] font-mono font-medium text-muted-foreground bg-secondary/80 px-1.5 py-0.2 rounded-md shrink-0">
                      {item.tag}
                    </span>
                  </span>
                  <span className="text-[11px] text-muted-foreground truncate">
                    {item.description}
                  </span>
                </div>
              </div>
              <div className="flex items-center opacity-40 group-hover:opacity-100 transition-opacity text-muted-foreground group-hover:text-foreground shrink-0 ml-1">
                <Plus className="size-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col">
      {/* Sticky Fixed Search Bar */}
      <div className="sticky top-0 z-20 bg-background/90 backdrop-blur-md p-3 border-b border-border/50">
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search elements & tags..."
            className="h-8 text-xs pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Elements Groups Content */}
      <div className="p-3 flex flex-col gap-3.5">
        {filteredPrimitives.length > 0 ? (
          <div className="space-y-3.5">
            {renderPrimitiveGroup("Layout Primitives", layoutPrimitives)}
            {renderPrimitiveGroup("Typography", typographyPrimitives)}
            {renderPrimitiveGroup("Interactive & Media", mediaPrimitives)}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-muted-foreground">
            No elements matching &quot;{searchQuery}&quot;
          </div>
        )}

        {/* Quick Tips Card with subtle gradient */}
        <div className="mt-1 p-3 rounded-xl border border-border/70 bg-gradient-to-br from-secondary/50 via-secondary/20 to-blue-500/5 text-xs text-muted-foreground flex flex-col gap-1.5 shadow-2xs">
          <span className="font-semibold text-foreground flex items-center gap-1.5">
            <Sparkles className="size-3.5 text-amber-500" />
            Quick Tips:
          </span>
          <span className="text-[11px] leading-relaxed">• Click any primitive to insert into canvas.</span>
          <span className="text-[11px] leading-relaxed">• Drag and drop directly into your visual layout.</span>
        </div>
      </div>
    </div>
  );
};
