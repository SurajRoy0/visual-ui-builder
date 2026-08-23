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
  Sliders,
  Rows,
  Columns,
  Square,
  MousePointerClick,
  Image as ImageIcon,
  Link as LinkIcon,
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
import { Badge } from "@/components/ui/badge";
import { useEditorStore } from "@/store/editor/editorStore";
import { useProjectStore } from "@/store/project/projectStore";

export const SelectedElementInspector: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const elements = useProjectStore((state) => state.project.elements);
  const selectedNode = selectedNodeId ? elements[selectedNodeId] : null;

  // Determine element attributes / kind
  const elementName = selectedNode?.name || "Box";
  const elementTag = (selectedNode && "tag" in selectedNode ? selectedNode.tag : "div") as string;

  const isTextElement = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "blockquote"].includes(
    elementTag
  );
  const isButtonElement = ["button", "a"].includes(elementTag);
  const isImageElement = elementTag === "img";
  const isBoxElement = !isTextElement && !isImageElement;

  // Box / Container Properties
  const [display, setDisplay] = useState<"flex" | "block">("flex");
  const [flexDirection, setFlexDirection] = useState<"row" | "column">("column");
  const [alignItems, setAlignItems] = useState("center");
  const [justifyContent, setJustifyContent] = useState("center");
  const [width, setWidth] = useState("100%");
  const [height, setHeight] = useState("auto");
  const [gap, setGap] = useState("16px");
  const [paddingX, setPaddingX] = useState("24px");
  const [paddingY, setPaddingY] = useState("32px");
  const [marginX, setMarginX] = useState("auto");
  const [marginY, setMarginY] = useState("0px");
  const [background, setBackground] = useState("#18181b");
  const [borderWidth, setBorderWidth] = useState("1px");
  const [borderStyle, setBorderStyle] = useState("solid");
  const [borderColor, setBorderColor] = useState("#27272a");
  const [borderRadius, setBorderRadius] = useState("12px");

  // Text Properties
  const [textContent, setTextContent] = useState("Welcome to Playfull");
  const [textTag, setTextTag] = useState(elementTag || "h1");
  const [fontSize, setFontSize] = useState("28px");
  const [fontWeight, setFontWeight] = useState("700");
  const [textColor, setTextColor] = useState("#fafafa");
  const [lineHeight, setLineHeight] = useState("1.25");
  const [letterSpacing, setLetterSpacing] = useState("-0.01em");
  const [textAlign, setTextAlign] = useState<"left" | "center" | "right" | "justify">("center");

  // Button Properties
  const [buttonLabel, setButtonLabel] = useState("Get Started");
  const [buttonVariant, setButtonVariant] = useState("primary");
  const [buttonHref, setButtonHref] = useState("#");

  // Image Properties
  const [imageSrc, setImageSrc] = useState("/assets/hero.webp");
  const [imageAlt, setImageAlt] = useState("Preview graphic");
  const [objectFit, setObjectFit] = useState("cover");

  const q = searchQuery.toLowerCase().trim();

  const matchesFilter = (...keywords: string[]) => {
    if (!q) return true;
    return keywords.some((kw) => kw.toLowerCase().includes(q));
  };

  return (
    <div className="flex flex-col divide-y divide-border">
      {/* Header Info & Search Bar */}
      <div className="p-3 space-y-2.5 bg-secondary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center text-foreground shrink-0">
              {isTextElement ? (
                <Type className="size-3.5 text-purple-500" />
              ) : isButtonElement ? (
                <MousePointerClick className="size-3.5 text-blue" />
              ) : isImageElement ? (
                <ImageIcon className="size-3.5 text-emerald-500" />
              ) : (
                <Square className="size-3.5 text-blue" />
              )}
            </div>
            <span className="text-xs font-semibold text-foreground truncate">
              {elementName}
            </span>
          </div>

          <Badge variant="secondary" className="uppercase font-mono text-[9px] px-1.5 py-0.5 rounded-md shrink-0">
            &lt;{isTextElement ? textTag : elementTag}&gt;
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${elementName.toLowerCase()} properties...`}
            className="h-7 text-xs pl-8 bg-secondary/50 border-border/70 placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* ==================== TEXT CONTROLS ==================== */}
      {isTextElement && (
        <>
          {matchesFilter("content", "text", "tag", "heading", "typography") && (
            <section className="p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <FileText className="size-3.5 text-purple-500" />
                <span>Text Content & Tag</span>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Content</Label>
                <Textarea
                  rows={2}
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  className="text-xs rounded-md"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">HTML Tag</Label>
                <Select value={textTag} onValueChange={(val) => val && setTextTag(val)}>
                  <SelectTrigger className="h-7 text-xs rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["h1", "h2", "h3", "h4", "h5", "h6", "p", "span", "blockquote"].map((t) => (
                      <SelectItem key={t} value={t} className="text-xs uppercase font-mono">
                        &lt;{t}&gt;
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </section>
          )}

          {matchesFilter("typography", "font", "size", "weight", "align", "color", "letter") && (
            <section className="p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Type className="size-3.5 text-purple-500" />
                <span>Typography</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Font Size</Label>
                  <UnitInput value={fontSize} onChange={setFontSize} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Weight</Label>
                  <Select value={fontWeight} onValueChange={(val) => val && setFontWeight(val)}>
                    <SelectTrigger className="h-7 text-xs rounded-md">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="400">Regular (400)</SelectItem>
                      <SelectItem value="500">Medium (500)</SelectItem>
                      <SelectItem value="600">Semibold (600)</SelectItem>
                      <SelectItem value="700">Bold (700)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Line Height</Label>
                  <Input
                    value={lineHeight}
                    onChange={(e) => setLineHeight(e.target.value)}
                    className="h-7 text-xs rounded-md"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Letter Spacing</Label>
                  <Input
                    value={letterSpacing}
                    onChange={(e) => setLetterSpacing(e.target.value)}
                    className="h-7 text-xs rounded-md"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Alignment</Label>
                <Tabs
                  value={textAlign}
                  onValueChange={(val) => val && setTextAlign(val)}
                  className="w-full"
                >
                  <TabsList className="w-full h-7 bg-secondary/80 p-0.5 rounded-md">
                    <TabsTrigger value="left" className="flex-1 h-6 p-0 rounded">
                      <AlignLeft className="size-3" />
                    </TabsTrigger>
                    <TabsTrigger value="center" className="flex-1 h-6 p-0 rounded">
                      <AlignCenter className="size-3" />
                    </TabsTrigger>
                    <TabsTrigger value="right" className="flex-1 h-6 p-0 rounded">
                      <AlignRight className="size-3" />
                    </TabsTrigger>
                    <TabsTrigger value="justify" className="flex-1 h-6 p-0 rounded">
                      <AlignJustify className="size-3" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Text Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={textColor.startsWith("#") ? textColor : "#fafafa"}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="h-7 text-xs font-mono flex-1 rounded-md"
                  />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ==================== BUTTON CONTROLS ==================== */}
      {isButtonElement && (
        <section className="p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <MousePointerClick className="size-3.5 text-blue" />
            <span>Button & Action</span>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Label</Label>
            <Input
              value={buttonLabel}
              onChange={(e) => setButtonLabel(e.target.value)}
              className="h-7 text-xs rounded-md"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Target URL / Action</Label>
            <Input
              value={buttonHref}
              onChange={(e) => setButtonHref(e.target.value)}
              placeholder="https://... or #section"
              className="h-7 text-xs rounded-md font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Style Variant</Label>
            <Select value={buttonVariant} onValueChange={(val) => val && setButtonVariant(val)}>
              <SelectTrigger className="h-7 text-xs rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary (Solid)</SelectItem>
                <SelectItem value="secondary">Secondary</SelectItem>
                <SelectItem value="outline">Outline</SelectItem>
                <SelectItem value="ghost">Ghost</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      )}

      {/* ==================== IMAGE CONTROLS ==================== */}
      {isImageElement && (
        <section className="p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <ImageIcon className="size-3.5 text-emerald-500" />
            <span>Image Source</span>
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Image URL</Label>
            <Input
              value={imageSrc}
              onChange={(e) => setImageSrc(e.target.value)}
              className="h-7 text-xs rounded-md font-mono"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Alt Text</Label>
            <Input
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="h-7 text-xs rounded-md"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-[11px] text-muted-foreground">Object Fit</Label>
            <Select value={objectFit} onValueChange={(val) => val && setObjectFit(val)}>
              <SelectTrigger className="h-7 text-xs rounded-md">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cover">Cover</SelectItem>
                <SelectItem value="contain">Contain</SelectItem>
                <SelectItem value="fill">Fill</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </section>
      )}

      {/* ==================== BOX / CONTAINER / LAYOUT CONTROLS ==================== */}
      {isBoxElement && (
        <>
          {/* Dimensions */}
          {matchesFilter("dimension", "width", "height", "size", "w", "h") && (
            <section className="p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Maximize2 className="size-3.5 text-blue" />
                <span>Dimensions</span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Width</Label>
                  <UnitInput value={width} onChange={setWidth} placeholder="auto / 100%" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Height</Label>
                  <UnitInput value={height} onChange={setHeight} placeholder="auto" />
                </div>
              </div>
            </section>
          )}

          {/* Flexbox Layout */}
          {matchesFilter("layout", "flex", "display", "align", "justify", "gap", "direction") && (
            <section className="p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Layout className="size-3.5 text-emerald-500" />
                <span>Flexbox Layout</span>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Display</Label>
                <Tabs
                  value={display}
                  onValueChange={(val) => setDisplay(val as "flex" | "block")}
                  className="w-full"
                >
                  <TabsList className="w-full h-7 bg-secondary/80 p-0.5 rounded-md">
                    <TabsTrigger value="flex" className="flex-1 text-[11px] h-6 rounded">
                      Flex
                    </TabsTrigger>
                    <TabsTrigger value="block" className="flex-1 text-[11px] h-6 rounded">
                      Block
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {display === "flex" && (
                <>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Direction</Label>
                    <Tabs
                      value={flexDirection}
                      onValueChange={(val) => setFlexDirection(val as "row" | "column")}
                      className="w-full"
                    >
                      <TabsList className="w-full h-7 bg-secondary/80 p-0.5 rounded-md">
                        <TabsTrigger value="column" className="flex-1 text-[11px] h-6 rounded gap-1">
                          <Rows className="size-3" /> Column
                        </TabsTrigger>
                        <TabsTrigger value="row" className="flex-1 text-[11px] h-6 rounded gap-1">
                          <Columns className="size-3" /> Row
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Align</Label>
                      <Select value={alignItems} onValueChange={(val) => val && setAlignItems(val)}>
                        <SelectTrigger className="h-7 text-xs rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">Start</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="flex-end">End</SelectItem>
                          <SelectItem value="stretch">Stretch</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1">
                      <Label className="text-[11px] text-muted-foreground">Justify</Label>
                      <Select
                        value={justifyContent}
                        onValueChange={(val) => val && setJustifyContent(val)}
                      >
                        <SelectTrigger className="h-7 text-xs rounded-md">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="flex-start">Start</SelectItem>
                          <SelectItem value="center">Center</SelectItem>
                          <SelectItem value="flex-end">End</SelectItem>
                          <SelectItem value="space-between">Between</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground">Gap</Label>
                    <UnitInput value={gap} onChange={setGap} />
                  </div>
                </>
              )}
            </section>
          )}

          {/* Appearance & Background */}
          {matchesFilter("appearance", "color", "background", "border", "radius", "style") && (
            <section className="p-3.5 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                <Palette className="size-3.5 text-pink-500" />
                <span>Appearance & Borders</span>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Background</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={background.startsWith("#") ? background : "#18181b"}
                    onChange={(e) => setBackground(e.target.value)}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={background}
                    onChange={(e) => setBackground(e.target.value)}
                    className="h-7 text-xs font-mono flex-1 rounded-md"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Border Width</Label>
                  <UnitInput value={borderWidth} onChange={setBorderWidth} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Radius</Label>
                  <UnitInput value={borderRadius} onChange={setBorderRadius} />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] text-muted-foreground">Border Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={borderColor.startsWith("#") ? borderColor : "#27272a"}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="w-7 h-7 rounded border border-border cursor-pointer bg-transparent"
                  />
                  <Input
                    value={borderColor}
                    onChange={(e) => setBorderColor(e.target.value)}
                    className="h-7 text-xs font-mono flex-1 rounded-md"
                  />
                </div>
              </div>
            </section>
          )}
        </>
      )}

      {/* ==================== SPACING (COMMON TO ALL) ==================== */}
      {matchesFilter("spacing", "padding", "margin", "pad", "mar") && (
        <section className="p-3.5 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Layers className="size-3.5 text-amber-500" />
            <span>Spacing (Padding & Margin)</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Padding X</Label>
              <UnitInput value={paddingX} onChange={setPaddingX} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Padding Y</Label>
              <UnitInput value={paddingY} onChange={setPaddingY} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Margin X</Label>
              <UnitInput value={marginX} onChange={setMarginX} />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] text-muted-foreground">Margin Y</Label>
              <UnitInput value={marginY} onChange={setMarginY} />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
