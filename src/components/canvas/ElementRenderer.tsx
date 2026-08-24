/* eslint-disable @next/next/no-img-element */
// ============================================================
// components/canvas/ElementRenderer.tsx
//
// Recursive element renderer adhering to Phase 2 architecture:
// - Granular subscription: each node subscribes to its own state.
// - Resolves effective styles: base styles + breakpoint overrides.
// - Dispatches by HTML tag with proper HTML rules & attribute support.
// - Complies with HTML void tags (img, input, hr, br, source).
// - Selection and visual focus integration.
// ============================================================

"use client";

import React from "react";
import type { ElementNode, ID, TreeNode } from "@/types/project";
import { useProjectStore } from "@/store/project";
import { useEditorStore } from "@/store/editor";
import { resolveEffectiveStyles } from "@/lib/styleUtils";
import { Square, Type, Layout, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ElementRendererProps {
  nodeId: ID;
  isRoot?: boolean;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({
  nodeId,
  isRoot = false,
}) => {
  const node = useProjectStore((state) => state.project.elements[nodeId]) as
    | TreeNode
    | undefined;

  const activeBreakpointId = useEditorStore((state) => state.activeBreakpointId);
  const activeViewportId = useEditorStore((state) => state.activeViewportId);
  const viewportWidth = useEditorStore((state) => state.viewportWidth);
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);
  const viewports = useProjectStore((state) => state.project.viewports);
  const addElementNode = useProjectStore((state) => state.addElementNode);

  if (!node) {
    return null;
  }

  // Handle component instances or element nodes
  if (node.type !== "element") {
    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
          setSelectedNodeId(nodeId);
        }}
        className={`p-3 rounded border border-dashed text-xs text-muted-foreground ${
          selectedNodeId === nodeId ? "ring-2 ring-primary" : ""
        }`}
      >
        Component: {node.name}
      </div>
    );
  }

  const elementNode = node as ElementNode;
  const isSelected = selectedNodeId === nodeId;

  const activeViewport =
    viewports.find((v) => v.id === activeViewportId) ||
    viewports[0] || { id: "vp-desktop", width: 1440, height: 900, name: "Desktop" };

  const currentDisplayWidth = viewportWidth ?? activeViewport.width;

  const simulatedViewport = {
    width: currentDisplayWidth,
    height: activeViewport.height,
  };

  // Resolve effective style for active breakpoint and simulated viewport
  const effectiveStyles = resolveEffectiveStyles(
    elementNode.style,
    elementNode.breakpointStyles?.[activeBreakpointId],
    simulatedViewport
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNodeId(nodeId);
  };

  const handleQuickAdd = (tag: "div" | "h1" | "section", name: string) => {
    const newId = addElementNode({
      tag,
      parentId: nodeId,
      name,
    });
    if (newId) {
      setSelectedNodeId(newId);
    }
  };

  const tag = elementNode.tag || "div";
  const attributes = (elementNode.attributes || {}) as Record<string, unknown>;

  // Common visual selection & hover outline classes
  const outlineClass = isRoot
    ? "relative w-full min-h-full cursor-default"
    : isSelected
    ? "relative z-10"
    : "relative hover:outline hover:outline-1 hover:outline-blue-400/40 cursor-pointer";

  // 1. Image Elements (Void)
  if (tag === "img") {
    return (
      <img
        data-node-id={nodeId}
        data-tag={tag}
        src={
          (attributes.src as string) ||
          "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=600&auto=format&fit=crop&q=80"
        }
        alt={(attributes.alt as string) || elementNode.name || "Image"}
        loading={(attributes.loading as "lazy" | "eager") || "lazy"}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      />
    );
  }

  // 2. Video Elements
  if (tag === "video") {
    return (
      <video
        data-node-id={nodeId}
        data-tag={tag}
        src={
          (attributes.src as string) ||
          "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        }
        poster={(attributes.poster as string) || undefined}
        controls={attributes.controls !== false}
        autoPlay={Boolean(attributes.autoPlay)}
        loop={Boolean(attributes.loop)}
        muted={Boolean(attributes.muted)}
        playsInline={attributes.playsInline !== false}
        preload={(attributes.preload as "auto" | "metadata" | "none") || "metadata"}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      />
    );
  }

  // 3. Audio Elements
  if (tag === "audio") {
    return (
      <audio
        data-node-id={nodeId}
        data-tag={tag}
        src={(attributes.src as string) || undefined}
        controls={attributes.controls !== false}
        autoPlay={Boolean(attributes.autoPlay)}
        loop={Boolean(attributes.loop)}
        muted={Boolean(attributes.muted)}
        preload={(attributes.preload as "auto" | "metadata" | "none") || "metadata"}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      />
    );
  }

  // 4. Iframe / Embed Elements
  if (tag === "iframe") {
    return (
      <iframe
        data-node-id={nodeId}
        data-tag={tag}
        src={(attributes.src as string) || "about:blank"}
        title={(attributes.title as string) || "Embed frame"}
        allowFullScreen={Boolean(attributes.allowFullScreen)}
        loading={(attributes.loading as "lazy" | "eager") || "lazy"}
        style={effectiveStyles}
        onClick={handleClick}
        className={`${outlineClass} border-0`}
      />
    );
  }

  // 5. Input Elements (Void)
  if (tag === "input") {
    return (
      <input
        data-node-id={nodeId}
        data-tag={tag}
        type={(attributes.type as string) || "text"}
        placeholder={(attributes.placeholder as string) || undefined}
        defaultValue={(attributes.value as string) || undefined}
        disabled={Boolean(attributes.disabled)}
        required={Boolean(attributes.required)}
        readOnly={Boolean(attributes.readOnly)}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      />
    );
  }

  // 6. Textarea Elements
  if (tag === "textarea") {
    return (
      <textarea
        data-node-id={nodeId}
        data-tag={tag}
        placeholder={(attributes.placeholder as string) || undefined}
        defaultValue={(attributes.value as string) || undefined}
        rows={typeof attributes.rows === "number" ? attributes.rows : 3}
        disabled={Boolean(attributes.disabled)}
        required={Boolean(attributes.required)}
        readOnly={Boolean(attributes.readOnly)}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      />
    );
  }

  // 7. Select Elements
  if (tag === "select") {
    return (
      <select
        data-node-id={nodeId}
        data-tag={tag}
        disabled={Boolean(attributes.disabled)}
        multiple={Boolean(attributes.multiple)}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      >
        {elementNode.children.length > 0 ? (
          elementNode.children.map((childId) => (
            <ElementRenderer key={childId} nodeId={childId} />
          ))
        ) : (
          <option>Option 1</option>
        )}
      </select>
    );
  }

  // 8. Horizontal Rule / Break (Void)
  if (tag === "hr") {
    return (
      <hr
        data-node-id={nodeId}
        data-tag={tag}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      />
    );
  }
  if (tag === "br") {
    return <br data-node-id={nodeId} data-tag={tag} />;
  }

  // 9. Link Elements
  if (tag === "a") {
    const rawContent = (elementNode as unknown as { content?: string }).content;
    const rawAttrText = attributes?.textContent as string | undefined;
    const textContent = typeof rawContent === "string" ? rawContent : typeof rawAttrText === "string" ? rawAttrText : elementNode.name || "Link";

    return (
      <a
        data-node-id={nodeId}
        data-tag={tag}
        href={(attributes.href as string) || "#"}
        target={(attributes.target as string) || undefined}
        rel={(attributes.rel as string) || undefined}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      >
        {elementNode.children.length > 0 ? (
          elementNode.children.map((childId) => (
            <ElementRenderer key={childId} nodeId={childId} />
          ))
        ) : (
          textContent
        )}
      </a>
    );
  }

  // 10. Button Elements
  if (tag === "button") {
    const rawContent = (elementNode as unknown as { content?: string }).content;
    const rawAttrText = attributes?.textContent as string | undefined;
    const textContent = typeof rawContent === "string" ? rawContent : typeof rawAttrText === "string" ? rawAttrText : elementNode.name || "Button";

    return (
      <button
        data-node-id={nodeId}
        data-tag={tag}
        type={(attributes.type as "button" | "submit" | "reset") || "button"}
        disabled={Boolean(attributes.disabled)}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      >
        {elementNode.children.length > 0 ? (
          elementNode.children.map((childId) => (
            <ElementRenderer key={childId} nodeId={childId} />
          ))
        ) : (
          textContent
        )}
      </button>
    );
  }

  // 11. Text Elements (p, span, h1-h6, strong, em, etc.)
  const isTextTag = [
    "p",
    "span",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "strong",
    "em",
    "blockquote",
    "small",
  ].includes(tag);

  if (isTextTag) {
    const rawContent = (elementNode as unknown as { content?: string }).content;
    const rawAttrText = attributes?.textContent as string | undefined;
    const textContent = typeof rawContent === "string" ? rawContent : typeof rawAttrText === "string" ? rawAttrText : (elementNode.children.length === 0 ? elementNode.name || "" : "");

    const TextTag = tag as keyof React.JSX.IntrinsicElements;

    return (
      <TextTag
        data-node-id={nodeId}
        data-tag={tag}
        style={effectiveStyles}
        onClick={handleClick}
        className={outlineClass}
      >
        {elementNode.children.length > 0 ? (
          elementNode.children.map((childId) => (
            <ElementRenderer key={childId} nodeId={childId} />
          ))
        ) : (
          textContent
        )}
      </TextTag>
    );
  }

  // 12. Form Elements
  if (tag === "form") {
    return (
      <form
        data-node-id={nodeId}
        data-tag={tag}
        action={(attributes.action as string) || undefined}
        method={(attributes.method as string) || "post"}
        style={effectiveStyles}
        onClick={handleClick}
        onSubmit={(e) => e.preventDefault()}
        className={outlineClass}
      >
        {elementNode.children.length > 0 ? (
          elementNode.children.map((childId) => (
            <ElementRenderer key={childId} nodeId={childId} />
          ))
        ) : (
          <div className="p-4 border border-dashed border-border rounded text-xs text-muted-foreground">
            Empty Form Container
          </div>
        )}
      </form>
    );
  }

  // 13. Container / Layout Elements (div, section, article, main, header, footer, etc.)
  const ContainerTag = tag as keyof React.JSX.IntrinsicElements;

  // If Page Root is completely empty, show the starter canvas dropzone
  if (isRoot && elementNode.children.length === 0) {
    return (
      <div
        data-node-id={nodeId}
        data-tag={tag}
        style={effectiveStyles}
        onClick={handleClick}
        className="w-full min-h-full flex flex-col items-center justify-center p-8 text-foreground select-none"
      >
        <div className="relative flex flex-col items-center justify-center text-center max-w-md p-8 rounded-xl border border-border/80 bg-card/60 backdrop-blur-xs shadow-xl space-y-6">
          <div className="relative">
            <div className="absolute -inset-3 bg-linear-to-r from-blue-500/25 via-purple-500/25 to-pink-500/25 rounded-3xl blur-xl" />
            <div className="relative w-14 h-14 rounded-lg bg-linear-to-b from-secondary to-secondary/60 border border-border/90 flex items-center justify-center shadow-md">
              <span className="font-black text-2xl bg-linear-to-br from-blue-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent select-none tracking-tighter">
                P
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-border/80 text-xs font-medium text-foreground">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Live Canvas Connected
            </div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Visual Design Workspace
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
              Your page is ready. Drop primitives from the left sidebar or select a starter block below to start designing.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd("div", "Box Container")}
              className="h-8 text-xs font-medium gap-1.5 px-3 rounded-md cursor-pointer bg-linear-to-r from-blue-500/10 to-indigo-500/10 hover:from-blue-500/20 hover:to-indigo-500/20 border-blue-500/30 text-foreground shadow-2xs"
            >
              <Square className="size-3.5 text-blue-500" />
              <span>Add Box</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd("h1", "Headline Text")}
              className="h-8 text-xs font-medium gap-1.5 px-3 rounded-md cursor-pointer bg-linear-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-500/30 text-foreground shadow-2xs"
            >
              <Type className="size-3.5 text-purple-400" />
              <span>Add Text</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickAdd("section", "Hero Section")}
              className="h-8 text-xs font-medium gap-1.5 px-3 rounded-md cursor-pointer bg-linear-to-r from-emerald-500/10 to-teal-500/10 hover:from-emerald-500/20 hover:to-teal-500/20 border-emerald-500/30 text-foreground shadow-2xs"
            >
              <Layout className="size-3.5 text-emerald-400" />
              <span>Add Section</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // If internal container is empty, render a placeholder outline so it has visible height
  if (elementNode.children.length === 0 && !isRoot) {
    return (
      <ContainerTag
        data-node-id={nodeId}
        data-tag={tag}
        style={{
          minHeight: "48px",
          minWidth: "48px",
          ...effectiveStyles,
        }}
        onClick={handleClick}
        className={`${outlineClass} border border-dashed border-border/80 p-2 flex items-center justify-center`}
      >
        <span className="text-[11px] text-muted-foreground/60 select-none flex items-center gap-1">
          <Plus className="size-3" />
          <span>Empty {elementNode.name || tag}</span>
        </span>
      </ContainerTag>
    );
  }

  // Normal container with children
  return (
    <ContainerTag
      data-node-id={nodeId}
      data-tag={tag}
      style={effectiveStyles}
      onClick={handleClick}
      className={outlineClass}
    >
      {elementNode.children.map((childId) => (
        <ElementRenderer key={childId} nodeId={childId} />
      ))}
    </ContainerTag>
  );
};
