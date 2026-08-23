"use client";

import React, { useState } from "react";
import { Globe, Palette, Layout, UnfoldHorizontal, UnfoldVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnitInput } from "@/components/ui/unit-input";

export const PageSection: React.FC = () => {
  const [bg, setBg] = useState("#ffffff");
  const [paddingY, setPaddingY] = useState("64px");
  const [paddingX, setPaddingX] = useState("24px");
  const [minHeight, setMinHeight] = useState("100vh");

  return (
    <div className="flex flex-col divide-y divide-border">
      {/* 1. Page Details */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Globe className="size-3.5 text-blue" />
          <span>Page Properties</span>
        </div>

        <div className="space-y-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Page Name</Label>
            <Input
              defaultValue="Home Page"
              className="h-7 text-xs rounded-md"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Route Path</Label>
            <Input
              defaultValue="/"
              className="h-7 text-xs font-mono rounded-md"
            />
          </div>
        </div>
      </section>

      {/* 2. Page Canvas Settings */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Palette className="size-3.5 text-purple-500" />
          <span>Canvas Background</span>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="color"
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            className="w-7 h-7 rounded-md border border-border bg-transparent cursor-pointer p-0.5 shrink-0"
          />
          <Input
            value={bg}
            onChange={(e) => setBg(e.target.value)}
            placeholder="#ffffff"
            className="h-7 text-xs flex-1 rounded-md font-mono"
          />
        </div>
      </section>

      {/* 3. Page Layout & Padding */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Layout className="size-3.5 text-emerald-500" />
          <span>Page Layout</span>
        </div>

        <div className="space-y-2">
          {/* Padding */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Page Padding (Y / X)</Label>
            <div className="grid grid-cols-2 gap-2">
              <UnitInput
                value={paddingY}
                onChange={setPaddingY}
                units={["px", "rem", "em", "vh", "%"]}
                prefixIcon={<UnfoldVertical className="size-3 text-muted-foreground" />}
                placeholder="Top / Bottom"
                min={0}
              />
              <UnitInput
                value={paddingX}
                onChange={setPaddingX}
                units={["px", "rem", "em", "vw", "%"]}
                prefixIcon={<UnfoldHorizontal className="size-3 text-muted-foreground" />}
                placeholder="Left / Right"
                min={0}
              />
            </div>
          </div>

          {/* Min Height */}
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Min Height</Label>
            <UnitInput
              value={minHeight}
              onChange={setMinHeight}
              units={["vh", "px", "%", "rem", "auto"]}
              placeholder="100"
            />
          </div>
        </div>
      </section>
    </div>
  );
};
