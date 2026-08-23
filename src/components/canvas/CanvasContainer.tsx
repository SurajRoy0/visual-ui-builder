// ============================================================
// components/canvas/CanvasContainer.tsx
//
// Host container for visual viewport canvas:
// - Simulates the responsive browser viewport (width/height).
// - Scales visual representation based on editor zoom.
// - Supports smooth interactive drag-to-resize on left/right handles.
// - Real-time synchronization with CanvasBar and BreakpointBar.
// - Handles background deselection.
// - Supports Phase 4 drag-and-drop from toolbox with live drop indicator.
// ============================================================

"use client";

import React, { useRef, useState, useCallback } from "react";
import { CanvasRenderer } from "./CanvasRenderer";
import { SelectionOverlay } from "./SelectionOverlay";
import { DropIndicatorOverlay } from "./DropIndicatorOverlay";
import { CanvasBar } from "./CanvasBar";
import { useEditorStore } from "@/store/editor";
import { useProjectStore } from "@/store/project";
import {
  computeDropResult,
  getGlobalDraggedDefinition,
  setGlobalDraggedDefinition,
  type DropTargetResult,
} from "@/lib/dropTargetResolution";
import type { ElementDefinitionItem } from "@/lib/elementDefinitions";

export const CanvasContainer: React.FC = () => {
  const zoom = useEditorStore((state) => state.zoom);
  const activeViewportId = useEditorStore((state) => state.activeViewportId);
  const activePageId = useEditorStore((state) => state.activePageId);
  const viewportWidth = useEditorStore((state) => state.viewportWidth);
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);
  const setViewportWidth = useEditorStore((state) => state.setViewportWidth);
  const setActiveBreakpointId = useEditorStore((state) => state.setActiveBreakpointId);

  const viewports = useProjectStore((state) => state.project.viewports);
  const breakpoints = useProjectStore((state) => state.project.breakpoints);
  const pages = useProjectStore((state) => state.project.pages);
  const elements = useProjectStore((state) => state.project.elements);
  const updateViewport = useProjectStore((state) => state.updateViewport);
  const addElementNode = useProjectStore((state) => state.addElementNode);
  const updateNodeStyle = useProjectStore((state) => state.updateNodeStyle);
  const updateTextContent = useProjectStore((state) => state.updateTextContent);
  const updateNodeAttributes = useProjectStore((state) => state.updateNodeAttributes);
  const batch = useProjectStore((state) => state.batch);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [isDraggingHandle, setIsDraggingHandle] = useState<"left" | "right" | null>(null);

  // Transient drag-and-drop indicator state
  const [dropTarget, setDropTarget] = useState<DropTargetResult | null>(null);
  const [activeDraggedItem, setActiveDraggedItem] = useState<ElementDefinitionItem | null>(null);

  const activeViewport =
    viewports.find((v) => v.id === activeViewportId) ||
    viewports[0] || { id: "vp-desktop", width: 1440, height: 900, name: "Desktop" };

  const currentDisplayWidth = viewportWidth ?? activeViewport.width;

  const handleCanvasBackgroundClick = (e: React.MouseEvent) => {
    // Only deselect if clicked directly on the backdrop area
    if (e.target === e.currentTarget) {
      setSelectedNodeId(null);
    }
  };

  // Helper to match breakpoint given a width
  const updateMatchingBreakpoint = useCallback(
    (width: number) => {
      if (breakpoints.length === 0) return;
      const sorted = [...breakpoints].sort((a, b) => a.minWidth - b.minWidth);
      const matched = [...sorted].reverse().find((bp) => width >= bp.minWidth) || sorted[0];
      if (matched) {
        setActiveBreakpointId(matched.id);
      }
    },
    [breakpoints, setActiveBreakpointId]
  );

  // Viewport resize handle start
  const handlePointerDown = (side: "left" | "right", e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDraggingHandle(side);

    if (!viewportRef.current) return;
    const rect = viewportRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const distFromCenter = Math.abs(moveEvent.clientX - centerX) / (zoom || 1);
      const newWidth = Math.min(2560, Math.max(320, Math.round(distFromCenter * 2)));

      setViewportWidth(newWidth);
      updateMatchingBreakpoint(newWidth);
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      const target = e.currentTarget;
      try {
        target.releasePointerCapture(upEvent.pointerId);
      } catch {
        // Pointer already released
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      setIsDraggingHandle(null);

      // Commit final width to ProjectStore
      const finalWidth = useEditorStore.getState().viewportWidth;
      if (finalWidth !== null && finalWidth !== activeViewport.width) {
        updateViewport(activeViewport.id, { width: finalWidth });
      }
      setViewportWidth(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  // ============================================================
  // Canvas Drag & Drop Handlers (Phase 4)
  // ============================================================

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";

    const dragged = getGlobalDraggedDefinition();
    if (!dragged || !viewportRef.current) return;

    setActiveDraggedItem(dragged);

    const activePage = pages[activePageId] || Object.values(pages)[0];
    const rootId = activePage?.rootElementId || "root";

    const result = computeDropResult({
      clientX: e.clientX,
      clientY: e.clientY,
      viewportElement: viewportRef.current,
      zoom,
      elements,
      activePageRootId: rootId,
      draggedItem: dragged,
    });

    setDropTarget(result);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!viewportRef.current?.contains(e.relatedTarget as Node)) {
      setDropTarget(null);
      setActiveDraggedItem(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    let item = getGlobalDraggedDefinition();
    if (!item) {
      try {
        const raw = e.dataTransfer.getData("application/x-playfull-element");
        if (raw) item = JSON.parse(raw);
      } catch {
        // Ignore parse error
      }
    }

    if (!item || !viewportRef.current) {
      setDropTarget(null);
      setActiveDraggedItem(null);
      return;
    }

    const activePage = pages[activePageId] || Object.values(pages)[0];
    const rootId = activePage?.rootElementId || "root";

    const result = computeDropResult({
      clientX: e.clientX,
      clientY: e.clientY,
      viewportElement: viewportRef.current,
      zoom,
      elements,
      activePageRootId: rootId,
      draggedItem: item,
    });

    if (result && result.allowed) {
      batch(() => {
        const newId = addElementNode({
          tag: item.tag,
          parentId: result.parentId,
          index: result.index,
          name: item.name,
        });

        if (newId) {
          if (item.defaultStyle) {
            updateNodeStyle(newId, item.defaultStyle);
          }
          if (item.defaultContent) {
            updateTextContent(newId, item.defaultContent);
          }
          if (item.defaultAttributes) {
            updateNodeAttributes(newId, item.defaultAttributes);
          }
          setSelectedNodeId(newId);
        }
      });
    }

    setDropTarget(null);
    setActiveDraggedItem(null);
    setGlobalDraggedDefinition(null);
  };

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden select-none bg-secondary/25">
      {/* Standalone Canvas Top Bar */}
      <CanvasBar />

      {/* Canvas Scroll Area */}
      <div
        onClick={handleCanvasBackgroundClick}
        className="flex-1 overflow-auto flex items-start justify-center p-8 relative"
      >
        <div
          className="relative flex flex-col items-center transition-transform duration-150 origin-top my-auto"
          style={{
            transform: `scale(${zoom})`,
          }}
        >
          <div className="relative flex items-stretch">
            {/* Left Canvas Resize Handle */}
            <div
              title="Drag to resize viewport width"
              onPointerDown={(e) => handlePointerDown("left", e)}
              className={`w-4 flex items-center justify-center cursor-ew-resize group select-none relative -mr-2 z-30 transition-all ${
                isDraggingHandle === "left" ? "opacity-100 scale-105" : ""
              }`}
            >
              <div
                className={`w-1.5 h-16 rounded-full transition-all ${
                  isDraggingHandle === "left"
                    ? "bg-blue-500 shadow-md shadow-blue-500/50 scale-y-110"
                    : "bg-border group-hover:bg-blue-500/80 group-hover:scale-y-110"
                }`}
              />
            </div>

            {/* Simulated Website Viewport Screen */}
            <div
              ref={viewportRef}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{
                width: `${currentDisplayWidth}px`,
                minHeight: `${activeViewport.height}px`,
              }}
              className="relative shadow-2xl rounded-md overflow-hidden bg-background ring-1 ring-border flex flex-col transition-all duration-75"
            >
              {/* Live Canvas Document Tree */}
              <CanvasRenderer />

              {/* Selection & Resize Overlay */}
              <SelectionOverlay />

              {/* Live Drag & Drop Indicator Overlay */}
              <DropIndicatorOverlay
                dropTarget={dropTarget}
                draggedItem={activeDraggedItem}
              />
            </div>

            {/* Right Canvas Resize Handle */}
            <div
              title="Drag to resize viewport width"
              onPointerDown={(e) => handlePointerDown("right", e)}
              className={`w-4 flex items-center justify-center cursor-ew-resize group select-none relative -ml-2 z-30 transition-all ${
                isDraggingHandle === "right" ? "opacity-100 scale-105" : ""
              }`}
            >
              <div
                className={`w-1.5 h-16 rounded-full transition-all ${
                  isDraggingHandle === "right"
                    ? "bg-blue-500 shadow-md shadow-blue-500/50 scale-y-110"
                    : "bg-border group-hover:bg-blue-500/80 group-hover:scale-y-110"
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

