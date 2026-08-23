"use client";

import React, { useState } from "react";
import {
  Image as ImageIcon,
  Upload,
  Search,
  FileCode2,
  FileText,
  Video,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DummyAsset {
  id: string;
  name: string;
  type: "image" | "svg" | "video" | "font";
  size: string;
  dimensions?: string;
  url: string;
}

const DUMMY_ASSETS: DummyAsset[] = [
  {
    id: "hero-bg",
    name: "hero-gradient-mesh.webp",
    type: "image",
    size: "142 KB",
    dimensions: "1920×1080",
    url: "/assets/hero.webp",
  },
  {
    id: "logo-vector",
    name: "brand-logo-mark.svg",
    type: "svg",
    size: "12 KB",
    dimensions: "Vector",
    url: "/assets/logo.svg",
  },
  {
    id: "avatar-demo",
    name: "user-avatar-portrait.png",
    type: "image",
    size: "86 KB",
    dimensions: "400×400",
    url: "/assets/avatar.png",
  },
  {
    id: "promo-video",
    name: "product-preview-reel.mp4",
    type: "video",
    size: "2.4 MB",
    dimensions: "1080p",
    url: "/assets/preview.mp4",
  },
  {
    id: "font-display",
    name: "Outfit-Bold.woff2",
    type: "font",
    size: "34 KB",
    dimensions: "Web Font",
    url: "/fonts/Outfit-Bold.woff2",
  },
];

export const AssetsTab: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "image" | "svg" | "font">("all");

  const filteredAssets = DUMMY_ASSETS.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === "all" || asset.type === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getAssetIcon = (type: DummyAsset["type"]) => {
    switch (type) {
      case "image":
        return <ImageIcon className="size-4 text-purple-500" />;
      case "svg":
        return <FileCode2 className="size-4 text-emerald-500" />;
      case "video":
        return <Video className="size-4 text-blue" />;
      case "font":
        return <FileText className="size-4 text-amber-500" />;
    }
  };

  return (
    <div className="p-3 flex flex-col gap-3">
      {/* Search Bar */}
      <div className="relative">
        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search assets by name or type..."
          className="h-7 text-xs pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
        />
      </div>

      {/* Filter Tabs / Quick Chips */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {(["all", "image", "svg", "font"] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-2 py-0.5 rounded-md text-[10px] font-medium capitalize transition-colors cursor-pointer shrink-0 ${activeFilter === filter
                ? "bg-foreground text-background font-semibold"
                : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
          >
            {filter === "all" ? "All Assets" : filter.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Upload Header */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-semibold text-foreground px-1 tracking-tight">
          Project Assets ({filteredAssets.length})
        </span>
        <Button
          variant="outline"
          size="xs"
          className="h-6 text-[10px] gap-1 px-2 rounded-md cursor-pointer hover:bg-black/5 dark:hover:bg-white/8"
        >
          <Upload className="size-3" />
          Upload
        </Button>
      </div>

      {/* Assets Grid / List */}
      {filteredAssets.length > 0 ? (
        <div className="space-y-1.5">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group flex items-center justify-between p-2 rounded-md border border-border bg-card hover:bg-black/4 dark:hover:bg-white/6 transition-all cursor-pointer shadow-2xs select-none"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0 group-hover:border-foreground/30">
                  {getAssetIcon(asset.type)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-medium text-foreground truncate max-w-44">
                    {asset.name}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono">
                    <span>{asset.size}</span>
                    {asset.dimensions && <span>• {asset.dimensions}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                <Plus className="size-3.5" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-xs text-muted-foreground">
          No assets found matching &quot;{searchQuery}&quot;
        </div>
      )}
    </div>
  );
};
