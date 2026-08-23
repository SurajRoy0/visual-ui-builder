// ============================================================
// components/canvas/CanvasContainer.tsx
//
// Host container for visual viewport canvas:
// - Simulates the responsive browser viewport (width/height).
// - Scales visual representation based on editor zoom.
// - Supports smooth interactive drag-to-resize on left/right handles.
// - Real-time synchronization with CanvasBar and BreakpointBar.
// - Handles background deselection.
// ============================================================

"use client";

import React, { useRef, useState, useCallback } from "react";
import { CanvasRenderer } from "./CanvasRenderer";
import { SelectionOverlay } from "./SelectionOverlay";
import { CanvasBar } from "./CanvasBar";
import { useEditorStore } from "@/store/editor";
import { useProjectStore } from "@/store/project";

export const CanvasContainer: React.FC = () => {
  const zoom = useEditorStore((state) => state.zoom);
  const activeViewportId = useEditorStore((state) => state.activeViewportId);
  const viewportWidth = useEditorStore((state) => state.viewportWidth);
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);
  const setViewportWidth = useEditorStore((state) => state.setViewportWidth);
  const setActiveBreakpointId = useEditorStore((state) => state.setActiveBreakpointId);

  const viewports = useProjectStore((state) => state.project.viewports);
  const breakpoints = useProjectStore((state) => state.project.breakpoints);
  const updateViewport = useProjectStore((state) => state.updateViewport);

  const viewportRef = useRef<HTMLDivElement>(null);
  const [isDraggingHandle, setIsDraggingHandle] = useState<"left" | "right" | null>(null);

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

  // Resize handler start
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
