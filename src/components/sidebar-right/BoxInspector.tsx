"use client";

import React, { useState } from "react";
import {
  Maximize2,
  Layout,
  Layers,
  Palette,
  Rows,
  Columns,
  UnfoldHorizontal,
  UnfoldVertical,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitInput } from "@/components/ui/unit-input";

export const BoxInspector: React.FC = () => {
  const [display, setDisplay] = useState<"flex" | "block">("flex");
  const [flexDirection, setFlexDirection] = useState<"row" | "column">("column");
  const [alignItems, setAlignItems] = useState("center");
  const [justifyContent, setJustifyContent] = useState("center");

  // Numeric CSS properties with Unit separation
  const [width, setWidth] = useState("600px");
  const [height, setHeight] = useState("auto");
  const [gap, setGap] = useState("16px");

  // Spacing (X & Y or unified)
  const [paddingX, setPaddingX] = useState("32px");
  const [paddingY, setPaddingY] = useState("48px");
  const [marginX, setMarginX] = useState("auto");
  const [marginY, setMarginY] = useState("0px");

  // Appearance
  const [background, setBackground] = useState("#ffffff");
  const [borderWidth, setBorderWidth] = useState("1px");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderColor, setBorderColor] = useState("#e5e7eb");
  const [borderRadius, setBorderRadius] = useState("16px");

  return (
    <div className="flex flex-col divide-y divide-border">
      {/* 1. Size & Dimensions */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Maximize2 className="size-3.5 text-blue" />
          <span>Dimensions</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Width</Label>
            <UnitInput
              value={width}
              onChange={setWidth}
              units={["px", "%", "rem", "em", "vw", "auto"]}
              placeholder="Auto"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Height</Label>
            <UnitInput
              value={height}
              onChange={setHeight}
              units={["px", "%", "rem", "em", "vh", "auto"]}
              placeholder="Auto"
            />
          </div>
        </div>
      </section>

      {/* 2. Layout & Flex Direction */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Layout className="size-3.5 text-emerald-500" />
          <span>Layout (Flexbox)</span>
        </div>

        {/* Display Type */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Display</Label>
          <Tabs
            value={display}
            onValueChange={(val) => {
              if (val) setDisplay(val as "flex" | "block");
            }}
          >
            <TabsList className="w-full">
              {(["flex", "block"] as const).map((mode) => (
                <TabsTrigger
                  key={mode}
                  value={mode}
                  className="capitalize text-xs cursor-pointer"
                >
                  {mode}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Flexbox options */}
        {display === "flex" && (
          <div className="space-y-2.5 pt-1">
            {/* Direction */}
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Direction</Label>
              <Tabs
                value={flexDirection}
                onValueChange={(val) => {
                  if (val) setFlexDirection(val as "row" | "column");
                }}
              >
                <TabsList className="w-full">
                  <TabsTrigger value="row" className="gap-1.5 cursor-pointer">
                    <Columns className="size-3" />
                    <span>Row</span>
                  </TabsTrigger>
                  <TabsTrigger value="column" className="gap-1.5 cursor-pointer">
                    <Rows className="size-3" />
                    <span>Column</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Align & Justify */}
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Align Items</Label>
                <Select value={alignItems} onValueChange={(val) => { if (val) setAlignItems(val); }}>
                  <SelectTrigger className="h-7 text-xs w-full rounded-md cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stretch">Stretch</SelectItem>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Justify Content</Label>
                <Select value={justifyContent} onValueChange={(val) => { if (val) setJustifyContent(val); }}>
                  <SelectTrigger className="h-7 text-xs w-full rounded-md cursor-pointer">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flex-start">Start</SelectItem>
                    <SelectItem value="center">Center</SelectItem>
                    <SelectItem value="flex-end">End</SelectItem>
                    <SelectItem value="space-between">Between</SelectItem>
                    <SelectItem value="space-around">Around</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Gap */}
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Gap</Label>
              <UnitInput
                value={gap}
                onChange={setGap}
                units={["px", "rem", "em", "%"]}
                placeholder="0"
                min={0}
              />
            </div>
          </div>
        )}
      </section>

      {/* 3. Spacing (Padding & Margin) */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Layers className="size-3.5 text-amber-500" />
          <span>Spacing</span>
        </div>

        {/* Padding */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Padding (Y / X)</Label>
          <div className="grid grid-cols-2 gap-2">
            <UnitInput
              value={paddingY}
              onChange={setPaddingY}
              units={["px", "rem", "em", "%"]}
              prefixIcon={<UnfoldVertical className="size-3 text-muted-foreground" />}
              placeholder="Top / Bottom"
              min={0}
            />
            <UnitInput
              value={paddingX}
              onChange={setPaddingX}
              units={["px", "rem", "em", "%"]}
              prefixIcon={<UnfoldHorizontal className="size-3 text-muted-foreground" />}
              placeholder="Left / Right"
              min={0}
            />
          </div>
        </div>

        {/* Margin */}
        <div className="space-y-1.5">
          <Label className="text-[11px] text-muted-foreground">Margin (Y / X)</Label>
          <div className="grid grid-cols-2 gap-2">
            <UnitInput
              value={marginY}
              onChange={setMarginY}
              units={["px", "rem", "em", "%", "auto"]}
              prefixIcon={<UnfoldVertical className="size-3 text-muted-foreground" />}
              placeholder="Top / Bottom"
            />
            <UnitInput
              value={marginX}
              onChange={setMarginX}
              units={["px", "rem", "em", "%", "auto"]}
              prefixIcon={<UnfoldHorizontal className="size-3 text-muted-foreground" />}
              placeholder="Left / Right"
            />
          </div>
        </div>
      </section>

      {/* 4. Appearance (Background, Border, Border Radius) */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Palette className="size-3.5 text-purple-500" />
          <span>Appearance</span>
        </div>

        {/* Background Color */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Background Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={background.startsWith("#") ? background : "#ffffff"}
              onChange={(e) => setBackground(e.target.value)}
              className="w-7 h-7 rounded-md border border-border bg-transparent cursor-pointer p-0.5 shrink-0"
            />
            <Input
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              placeholder="e.g. #ffffff, transparent"
              className="h-7 text-xs flex-1 rounded-md font-mono"
            />
          </div>
        </div>

        {/* Border (Width, Style, Color) */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Border (Width / Style / Color)</Label>
          <div className="grid grid-cols-3 gap-1.5">
            <UnitInput
              value={borderWidth}
              onChange={setBorderWidth}
              units={["px", "rem", "em", "none"]}
              placeholder="Width"
              min={0}
            />
            <Select value={borderStyle} onValueChange={(val) => { if (val) setBorderStyle(val); }}>
              <SelectTrigger className="h-7 text-xs rounded-md cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="solid">Solid</SelectItem>
                <SelectItem value="dashed">Dashed</SelectItem>
                <SelectItem value="dotted">Dotted</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <input
                type="color"
                value={borderColor.startsWith("#") ? borderColor : "#e5e7eb"}
                onChange={(e) => setBorderColor(e.target.value)}
                className="w-7 h-7 rounded-md border border-border bg-transparent cursor-pointer p-0.5 shrink-0"
              />
              <Input
                value={borderColor}
                onChange={(e) => setBorderColor(e.target.value)}
                placeholder="#e5e7eb"
                className="h-7 text-xs flex-1 rounded-md font-mono px-1.5"
              />
            </div>
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Border Radius</Label>
          <UnitInput
            value={borderRadius}
            onChange={setBorderRadius}
            units={["px", "%", "rem", "em"]}
            placeholder="0"
            min={0}
          />
        </div>
      </section>
    </div>
  );
};
