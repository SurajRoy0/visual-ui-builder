"use client";

import React, { useState } from "react";
import {
  Maximize2,
  Layout,
  Layers,
  Palette,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileText,
  Search,
  Rows,
  Columns,
  MousePointerClick,
  Image as ImageIcon,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UnitInput } from "@/components/ui/unit-input";
import { useEditorStore } from "@/store/editor/editorStore";
import { useProjectStore } from "@/store/project/projectStore";
import type { ElementNode, ElementStyle } from "@/types/project";

export const SelectedElementInspector: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const elements = useProjectStore((state) => state.project.elements);
  const updateNodeStyle = useProjectStore((state) => state.updateNodeStyle);
  const updateTextContent = useProjectStore((state) => state.updateTextContent);
  const updateNodeAttributes = useProjectStore((state) => state.updateNodeAttributes);

  const selectedNode = selectedNodeId ? elements[selectedNodeId] : null;

  if (!selectedNode || selectedNode.type !== "element") {
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        Select an element on the canvas to inspect and edit its styles.
      </div>
    );
  }

  const element = selectedNode as ElementNode;
  const elementName = element.name || element.tag || "Element";
  const elementTag = element.tag || "div";
  const style = element.style || {};
  const attributes = (element.attributes || {}) as Record<string, unknown>;
  const textContent =
    (element as unknown as { content?: string }).content ??
    (attributes?.textContent as string) ??
    (element.children.length === 0 ? element.name : "");

  const isTextElement = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "blockquote", "strong", "em"].includes(
    elementTag
  );
  const isButtonElement = ["button", "a"].includes(elementTag);
  const isImageElement = elementTag === "img";
  const isBoxElement = !isTextElement && !isImageElement;

  const handleStyleChange = (patch: Partial<ElementStyle>) => {
    if (!selectedNodeId) return;
    updateNodeStyle(selectedNodeId, patch);
  };

  const handleTextChange = (newText: string) => {
    if (!selectedNodeId) return;
    updateTextContent(selectedNodeId, newText);
  };

  const handleAttributeChange = (patch: Record<string, unknown>) => {
    if (!selectedNodeId) return;
    updateNodeAttributes(selectedNodeId, patch);
  };

  const q = searchQuery.toLowerCase().trim();

  const matchesFilter = (...keywords: string[]) => {
    if (!q) return true;
    return keywords.some((kw) => kw.toLowerCase().includes(q));
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
            placeholder={`Search ${elementName.toLowerCase()} styles...`}
            className="h-8 text-xs font-normal pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* ==================== TEXT CONTROLS ==================== */}
      {isTextElement && (
        <>
          {matchesFilter("content", "text", "tag", "heading", "typography") && (
            <section className="p-3.5 space-y-2.5 border-b border-border/50">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tracking-tight">
                <FileText className="size-4 text-purple-500" />
                <span>Text Content</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Content</Label>
                <Textarea
                  rows={2}
                  value={textContent}
                  onChange={(e) => handleTextChange(e.target.value)}
                  className="text-xs font-normal rounded-md"
                />
              </div>
            </section>
          )}

          {matchesFilter("typography", "font", "size", "weight", "align", "color", "letter") && (
            <section className="p-3.5 space-y-2.5 border-b border-border/50">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tracking-tight">
                <Type className="size-4 text-purple-500" />
                <span>Typography</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Font Size</Label>
                  <UnitInput
                    value={style.fontSize !== undefined ? String(style.fontSize) : "16px"}
                    onChange={(val) => handleStyleChange({ fontSize: val })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Weight</Label>
                  <Select
                    value={style.fontWeight !== undefined ? String(style.fontWeight) : "400"}
                    onValueChange={(val) => val && handleStyleChange({ fontWeight: val })}
                  >
                    <SelectTrigger className="h-8 text-xs font-medium rounded-md w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="400" className="text-xs">Regular (400)</SelectItem>
                      <SelectItem value="500" className="text-xs font-medium">Medium (500)</SelectItem>
                      <SelectItem value="600" className="text-xs font-semibold">Semibold (600)</SelectItem>
                      <SelectItem value="700" className="text-xs font-bold">Bold (700)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Line Height</Label>
                  <Input
                    value={style.lineHeight !== undefined ? String(style.lineHeight) : "1.4"}
                    onChange={(e) => handleStyleChange({ lineHeight: e.target.value })}
                    className="h-8 text-xs rounded-md"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Letter Spacing</Label>
                  <Input
                    value={style.letterSpacing !== undefined ? String(style.letterSpacing) : "normal"}
                    onChange={(e) => handleStyleChange({ letterSpacing: e.target.value })}
                    className="h-8 text-xs rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Alignment</Label>
                <Tabs
                  value={style.textAlign || "left"}
                  onValueChange={(val) => val && handleStyleChange({ textAlign: val as ElementStyle["textAlign"] })}
                  className="w-full"
                >
                  <TabsList className="w-full h-8 bg-secondary/80 p-0.5 rounded-md">
                    <TabsTrigger value="left" className="flex-1 h-7 p-0 rounded">
                      <AlignLeft className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="center" className="flex-1 h-7 p-0 rounded">
                      <AlignCenter className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="right" className="flex-1 h-7 p-0 rounded">
                      <AlignRight className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="justify" className="flex-1 h-7 p-0 rounded">
                      <AlignJustify className="size-3.5" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.color?.startsWith("#") ? style.color : "#ffffff"}
                    onChange={(e) => handleStyleChange({ color: e.target.value })}
                    className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={style.color || ""}
                    placeholder="#ffffff"
                    onChange={(e) => handleStyleChange({ color: e.target.value })}
                    className="h-8 text-xs font-mono font-medium flex-1 rounded-md"
                  />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ==================== BUTTON CONTROLS ==================== */}
      {isButtonElement && (
        <section className="p-3.5 space-y-2.5 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tracking-tight">
            <MousePointerClick className="size-4 text-blue-500" />
            <span>Button Label & Colors</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Label</Label>
            <Input
              value={textContent}
              onChange={(e) => handleTextChange(e.target.value)}
              className="h-8 text-xs font-medium rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Button Background</Label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={style.backgroundColor?.startsWith("#") ? style.backgroundColor : "#3b82f6"}
                onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
              />
              <Input
                value={style.backgroundColor || ""}
                placeholder="#3b82f6"
                onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                className="h-8 text-xs font-mono font-medium flex-1 rounded-md"
              />
            </div>
          </div>
        </section>
      )}

      {/* ==================== IMAGE CONTROLS ==================== */}
      {isImageElement && (
        <section className="p-3.5 space-y-2.5 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tracking-tight">
            <ImageIcon className="size-4 text-emerald-500" />
            <span>Image Source</span>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Image URL</Label>
            <Input
              value={(attributes.src as string) || ""}
              onChange={(e) => handleAttributeChange({ src: e.target.value })}
              placeholder="https://..."
              className="h-8 text-xs font-mono rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Alt Text</Label>
            <Input
              value={(attributes.alt as string) || ""}
              onChange={(e) => handleAttributeChange({ alt: e.target.value })}
              placeholder="Image description"
              className="h-8 text-xs rounded-md"
            />
          </div>
        </section>
      )}

      {/* ==================== BOX / CONTAINER / LAYOUT CONTROLS ==================== */}
      {isBoxElement && (
        <>
          {/* Dimensions */}
          {matchesFilter("dimension", "width", "height", "size", "w", "h") && (
            <section className="p-3.5 space-y-2.5 border-b border-border/50">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tracking-tight">
                <Maximize2 className="size-4 text-blue-500" />
                <span>Dimensions</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Width</Label>
                  <UnitInput
                    value={style.width !== undefined ? String(style.width) : "auto"}
                    onChange={(val) => handleStyleChange({ width: val })}
                    placeholder="auto / 100%"
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Height</Label>
                  <UnitInput
                    value={style.height !== undefined ? String(style.height) : "auto"}
                    onChange={(val) => handleStyleChange({ height: val })}
                    placeholder="auto"
                    className="h-8"
                  />
                </div>
              </div>
            </section>
          )}

          {/* Flexbox Layout */}
          {matchesFilter("layout", "flex", "display", "align", "justify", "gap", "direction") && (
            <section className="p-3.5 space-y-2.5 border-b border-border/50">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tracking-tight">
                <Layout className="size-4 text-emerald-500" />
                <span>Flexbox Layout</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Display</Label>
                <Tabs
                  value={style.display || "block"}
                  onValueChange={(val) => handleStyleChange({ display: val as ElementStyle["display"] })}
                  className="w-full"
                >
                  <TabsList className="w-full h-8 bg-secondary/80 p-0.5 rounded-md">
                    <TabsTrigger value="flex" className="flex-1 text-xs font-medium h-7 rounded">
                      Flex
                    </TabsTrigger>
                    <TabsTrigger value="block" className="flex-1 text-xs font-medium h-7 rounded">
                      Block
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {style.display === "flex" && (
                <>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Direction</Label>
                    <Tabs
                      value={style.flexDirection || "column"}
                      onValueChange={(val) => handleStyleChange({ flexDirection: val as ElementStyle["flexDirection"] })}
                      className="w-full"
                    >
                      <TabsList className="w-full h-8 bg-secondary/80 p-0.5 rounded-md">
                        <TabsTrigger value="column" className="flex-1 text-xs font-medium h-7 rounded gap-1.5">
                          <Rows className="size-3.5" /> Column
                        </TabsTrigger>
                        <TabsTrigger value="row" className="flex-1 text-xs font-medium h-7 rounded gap-1.5">
                          <Columns className="size-3.5" /> Row
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Align</Label>
                      <Select
                        value={style.alignItems || "stretch"}
                        onValueChange={(val) => val && handleStyleChange({ alignItems: val as ElementStyle["alignItems"] })}
                      >
                        <SelectTrigger className="h-8 text-xs font-medium rounded-md w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start" className="text-xs">Start</SelectItem>
                          <SelectItem value="center" className="text-xs">Center</SelectItem>
                          <SelectItem value="flex-end" className="text-xs">End</SelectItem>
                          <SelectItem value="stretch" className="text-xs">Stretch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-medium text-muted-foreground">Justify</Label>
                      <Select
                        value={style.justifyContent || "flex-start"}
                        onValueChange={(val) => val && handleStyleChange({ justifyContent: val as ElementStyle["justifyContent"] })}
                      >
                        <SelectTrigger className="h-8 text-xs font-medium rounded-md w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start" className="text-xs">Start</SelectItem>
                          <SelectItem value="center" className="text-xs">Center</SelectItem>
                          <SelectItem value="flex-end" className="text-xs">End</SelectItem>
                          <SelectItem value="space-between" className="text-xs">Between</SelectItem>
                          <SelectItem value="space-around" className="text-xs">Around</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Gap</Label>
                    <UnitInput
                      value={style.gap !== undefined ? String(style.gap) : "0px"}
                      onChange={(val) => handleStyleChange({ gap: val })}
                      className="h-8"
                    />
                  </div>
                </>
              )}
            </section>
          )}

          {/* Appearance & Background */}
          {matchesFilter("appearance", "color", "background", "border", "radius", "style") && (
            <section className="p-3.5 space-y-2.5 border-b border-border/50">
              <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tracking-tight">
                <Palette className="size-4 text-pink-500" />
                <span>Appearance & Borders</span>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Background Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.backgroundColor?.startsWith("#") ? style.backgroundColor : "#18181b"}
                    onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                    className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={style.backgroundColor || ""}
                    placeholder="#18181b"
                    onChange={(e) => handleStyleChange({ backgroundColor: e.target.value })}
                    className="h-8 text-xs font-mono font-medium flex-1 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Border Width</Label>
                  <UnitInput
                    value={style.borderWidth !== undefined ? String(style.borderWidth) : "0px"}
                    onChange={(val) => handleStyleChange({ borderWidth: val, borderStyle: "solid" })}
                    className="h-8"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium text-muted-foreground">Radius</Label>
                  <UnitInput
                    value={style.borderRadius !== undefined ? String(style.borderRadius) : "0px"}
                    onChange={(val) => handleStyleChange({ borderRadius: val })}
                    className="h-8"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-medium text-muted-foreground">Border Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={style.borderColor?.startsWith("#") ? style.borderColor : "#27272a"}
                    onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                    className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={style.borderColor || ""}
                    placeholder="#27272a"
                    onChange={(e) => handleStyleChange({ borderColor: e.target.value })}
                    className="h-8 text-xs font-mono font-medium flex-1 rounded-md"
                  />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ==================== SPACING (COMMON TO ALL) ==================== */}
      {matchesFilter("spacing", "padding", "margin", "pad", "mar") && (
        <section className="p-3.5 space-y-2.5 border-b border-border/50">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-foreground tracking-tight">
            <Layers className="size-4 text-amber-500" />
            <span>Spacing (Padding & Margin)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Padding X</Label>
              <UnitInput
                value={style.paddingLeft !== undefined ? String(style.paddingLeft) : "0px"}
                onChange={(val) => handleStyleChange({ paddingLeft: val, paddingRight: val })}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Padding Y</Label>
              <UnitInput
                value={style.paddingTop !== undefined ? String(style.paddingTop) : "0px"}
                onChange={(val) => handleStyleChange({ paddingTop: val, paddingBottom: val })}
                className="h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Margin X</Label>
              <UnitInput
                value={style.marginLeft !== undefined ? String(style.marginLeft) : "0px"}
                onChange={(val) => handleStyleChange({ marginLeft: val, marginRight: val })}
                className="h-8"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Margin Y</Label>
              <UnitInput
                value={style.marginTop !== undefined ? String(style.marginTop) : "0px"}
                onChange={(val) => handleStyleChange({ marginTop: val, marginBottom: val })}
                className="h-8"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
