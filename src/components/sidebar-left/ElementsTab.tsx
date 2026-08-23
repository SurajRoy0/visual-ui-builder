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
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ElementPrimitive {
  id: string;
  name: string;
  tag: string;
  description: string;
  category: "layout" | "typography" | "media_form";
  icon: React.ReactNode;
}

const PRIMITIVES: ElementPrimitive[] = [
  // Layout
  {
    id: "box",
    name: "Box",
    tag: "<div>",
    description: "Flexible layout container",
    category: "layout",
    icon: <Square className="size-3.5" />,
  },
  {
    id: "section",
    name: "Section",
    tag: "<section>",
    description: "Full-width content block",
    category: "layout",
    icon: <Layout className="size-3.5" />,
  },
  {
    id: "grid",
    name: "Grid Container",
    tag: "<div>",
    description: "Multi-column CSS grid",
    category: "layout",
    icon: <Columns3 className="size-3.5" />,
  },
  {
    id: "container",
    name: "Main Container",
    tag: "<main>",
    description: "Semantic page wrapper",
    category: "layout",
    icon: <Layers className="size-3.5" />,
  },

  // Typography
  {
    id: "heading",
    name: "Heading 1",
    tag: "<h1>",
    description: "Primary page title",
    category: "typography",
    icon: <Heading1 className="size-3.5" />,
  },
  {
    id: "paragraph",
    name: "Paragraph",
    tag: "<p>",
    description: "Typography & text block",
    category: "typography",
    icon: <Type className="size-3.5" />,
  },
  {
    id: "text-span",
    name: "Text Span",
    tag: "<span>",
    description: "Inline inline-block snippet",
    category: "typography",
    icon: <AlignLeft className="size-3.5" />,
  },

  // Media & Interactive
  {
    id: "button",
    name: "Button",
    tag: "<button>",
    description: "Clickable action trigger",
    category: "media_form",
    icon: <MousePointerClick className="size-3.5" />,
  },
  {
    id: "image",
    name: "Image",
    tag: "<img>",
    description: "Responsive graphic frame",
    category: "media_form",
    icon: <ImageIcon className="size-3.5" />,
  },
  {
    id: "link",
    name: "Hyperlink",
    tag: "<a>",
    description: "Navigation anchor link",
    category: "media_form",
    icon: <LinkIcon className="size-3.5" />,
  },
  {
    id: "input",
    name: "Text Input",
    tag: "<input>",
    description: "User form input field",
    category: "media_form",
    icon: <FormInput className="size-3.5" />,
  },
  {
    id: "divider",
    name: "Divider",
    tag: "<hr>",
    description: "Horizontal visual rule",
    category: "media_form",
    icon: <Minus className="size-3.5" />,
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
              className="group relative flex items-center justify-between p-2 rounded-md border border-border bg-card hover:bg-black/4 dark:hover:bg-white/6 hover:border-foreground/30 transition-all cursor-pointer shadow-2xs select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-secondary text-foreground border border-border flex items-center justify-center shrink-0 group-hover:border-foreground/40">
                  {item.icon}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5 truncate">
                    {item.name}
                    <span className="text-[10px] font-mono font-medium text-muted-foreground bg-secondary/80 px-1 py-0.2 rounded-md shrink-0">
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
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur-xs p-3 border-b border-border/50">
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

        {/* Quick Tips */}
        <div className="mt-1 p-2.5 rounded-md border border-border bg-secondary/30 text-[11px] text-muted-foreground flex flex-col gap-1">
          <span className="font-semibold text-foreground flex items-center gap-1">
            💡 Quick Tips:
          </span>
          <span>• Click an element to insert into the canvas.</span>
          <span>• Drag and drop directly onto the visual canvas.</span>
        </div>
      </div>
    </div>
  );
};
