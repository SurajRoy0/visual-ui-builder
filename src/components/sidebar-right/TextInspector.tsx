"use client";

import React, { useState } from "react";
import {
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Layers,
  Palette,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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

export const TextInspector: React.FC = () => {
  const [content, setContent] = useState("Welcome to Playfull");
  const [tag, setTag] = useState("h1");
  const [fontSize, setFontSize] = useState("30px");
  const [fontWeight, setFontWeight] = useState("700");
  const [color, setColor] = useState("#111827");
  const [lineHeight, setLineHeight] = useState("1.25");
  const [letterSpacing, setLetterSpacing] = useState("0px");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("center");
  const [margin, setMargin] = useState("0px");
  const [padding, setPadding] = useState("0px");

  return (
    <div className="flex flex-col divide-y divide-border">
      {/* 1. Content & HTML Tag */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <FileText className="size-3.5 text-purple-500" />
          <span>Content & HTML Tag</span>
        </div>

        {/* Textarea */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Text Content</Label>
          <Textarea
            rows={2}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type text content here..."
            className="text-xs rounded-md"
          />
        </div>

        {/* HTML Tag Selector */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">HTML Tag</Label>
          <Select value={tag} onValueChange={(val) => { if (val) setTag(val); }}>
            <SelectTrigger className="h-7 text-xs w-full rounded-md cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="p">&lt;p&gt; Paragraph</SelectItem>
              <SelectItem value="h1">&lt;h1&gt; Heading 1</SelectItem>
              <SelectItem value="h2">&lt;h2&gt; Heading 2</SelectItem>
              <SelectItem value="h3">&lt;h3&gt; Heading 3</SelectItem>
              <SelectItem value="h4">&lt;h4&gt; Heading 4</SelectItem>
              <SelectItem value="span">&lt;span&gt; Inline Span</SelectItem>
              <SelectItem value="button">&lt;button&gt; Button</SelectItem>
              <SelectItem value="a">&lt;a&gt; Link</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      {/* 2. Typography Settings */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Type className="size-3.5 text-blue" />
          <span>Typography</span>
        </div>

        {/* Font Size & Font Weight */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Font Size</Label>
            <UnitInput
              value={fontSize}
              onChange={setFontSize}
              units={["px", "rem", "em", "pt"]}
              placeholder="16"
              min={1}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Font Weight</Label>
            <Select value={fontWeight} onValueChange={(val) => { if (val) setFontWeight(val); }}>
              <SelectTrigger className="h-7 text-xs w-full rounded-md cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="400">Regular (400)</SelectItem>
                <SelectItem value="500">Medium (500)</SelectItem>
                <SelectItem value="600">Semibold (600)</SelectItem>
                <SelectItem value="700">Bold (700)</SelectItem>
                <SelectItem value="800">Extra Bold (800)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Line Height & Letter Spacing */}
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Line Height</Label>
            <UnitInput
              value={lineHeight}
              onChange={setLineHeight}
              units={["none", "px", "rem", "em", "%"]}
              placeholder="1.25"
              min={0}
              step={0.1}
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Letter Spacing</Label>
            <UnitInput
              value={letterSpacing}
              onChange={setLetterSpacing}
              units={["px", "rem", "em", "%"]}
              placeholder="0"
              step={0.5}
            />
          </div>
        </div>

        {/* Alignment */}
        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Alignment</Label>
          <Tabs
            value={textAlign}
            onValueChange={(val) => {
              if (val) setTextAlign(val as "left" | "center" | "right" | "justify");
            }}
          >
            <TabsList className="w-full">
              <TabsTrigger value="left" className="cursor-pointer">
                <AlignLeft className="size-3" />
              </TabsTrigger>
              <TabsTrigger value="center" className="cursor-pointer">
                <AlignCenter className="size-3" />
              </TabsTrigger>
              <TabsTrigger value="right" className="cursor-pointer">
                <AlignRight className="size-3" />
              </TabsTrigger>
              <TabsTrigger value="justify" className="cursor-pointer">
                <AlignJustify className="size-3" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </section>

      {/* 3. Color & Appearance */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Palette className="size-3.5 text-purple-500" />
          <span>Color</span>
        </div>

        <div className="space-y-1">
          <Label className="text-[11px] text-muted-foreground">Text Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={color.startsWith("#") ? color : "#000000"}
              onChange={(e) => setColor(e.target.value)}
              className="w-7 h-7 rounded-md border border-border bg-transparent cursor-pointer p-0.5 shrink-0"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="e.g. #000000, inherit"
              className="h-7 text-xs flex-1 rounded-md font-mono"
            />
          </div>
        </div>
      </section>

      {/* 4. Spacing */}
      <section className="p-3.5 space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Layers className="size-3.5 text-amber-500" />
          <span>Spacing</span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Margin</Label>
            <UnitInput
              value={margin}
              onChange={setMargin}
              units={["px", "rem", "em", "auto"]}
              placeholder="0"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Padding</Label>
            <UnitInput
              value={padding}
              onChange={setPadding}
              units={["px", "rem", "em"]}
              placeholder="0"
              min={0}
            />
          </div>
        </div>
      </section>
    </div>
  );
};
