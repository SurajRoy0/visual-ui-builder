"use client";

// ============================================================
// components/canvas/SelectionOverlay.tsx
//
// Dedicated Selection and Real-Time Resize/Move Overlay (Phase 5):
// - 8-directional interactive resize handles (nw, n, ne, e, se, s, sw, w)
// - Bypasses ProjectStore during active gesture for 60fps smoothness
// - Commits exactly ONE atomic mutation on gesture completion (pointerup)
// - Live dimension badge tooltip during resizing
// - Auto-tracks selected element bounding box via ResizeObserver
// - Editor-only (never exported in output code)
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useEditorStore } from "@/store/editor";
import { useProjectStore } from "@/store/project";
import { isPageRoot } from "@/store/project/utils";
import {
  computeResize,
  formatDimensions,
  type ResizeHandleDirection,
  type InitialBounds,
} from "@/lib/resizeMath";
import { getRelativeElementRect, type Rect } from "@/lib/canvasCoordinates";
import type { ElementNode } from "@/types/project";

const HANDLES: { dir: ResizeHandleDirection; cursor: string; className: string }[] = [
  { dir: "nw", cursor: "cursor-nwse-resize", className: "-left-1.5 -top-1.5" },
  { dir: "n", cursor: "cursor-ns-resize", className: "left-1/2 -translate-x-1/2 -top-1.5" },
  { dir: "ne", cursor: "cursor-nesw-resize", className: "-right-1.5 -top-1.5" },
  { dir: "e", cursor: "cursor-ew-resize", className: "-right-1.5 top-1/2 -translate-y-1/2" },
  { dir: "se", cursor: "cursor-nwse-resize", className: "-right-1.5 -bottom-1.5" },
  { dir: "s", cursor: "cursor-ns-resize", className: "left-1/2 -translate-x-1/2 -bottom-1.5" },
  { dir: "sw", cursor: "cursor-nesw-resize", className: "-left-1.5 -bottom-1.5" },
  { dir: "w", cursor: "cursor-ew-resize", className: "-left-1.5 top-1/2 -translate-y-1/2" },
];

export const SelectionOverlay: React.FC = () => {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const zoom = useEditorStore((state) => state.zoom);
  const elements = useProjectStore((state) => state.project.elements);
  const pages = useProjectStore((state) => state.project.pages);
  const updateNodeStyle = useProjectStore((state) => state.updateNodeStyle);

  const [overlayRect, setOverlayRect] = useState<Rect | null>(null);
  const [activeHandle, setActiveHandle] = useState<ResizeHandleDirection | null>(null);
  const [isMoving, setIsMoving] = useState(false);
  const [transientSize, setTransientSize] = useState<{ width: number; height: number } | null>(null);

  const overlayRef = useRef<HTMLDivElement>(null);
  const movingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isRoot = selectedNodeId ? isPageRoot(pages, selectedNodeId) : false;
  const selectedNode = selectedNodeId ? (elements[selectedNodeId] as ElementNode | undefined) : null;
  const nodeStyleKey = selectedNode?.style ? JSON.stringify(selectedNode.style) : "";

  // Sync overlay position with rendered element's DOM bounding rect
  const updateOverlayPosition = useCallback(() => {
    if (!selectedNodeId || isRoot) {
      setOverlayRect(null);
      return;
    }

    const domEl = document.querySelector<HTMLElement>(`[data-node-id="${selectedNodeId}"]`);
    const canvasViewport =
      domEl?.closest<HTMLElement>("[data-canvas-viewport]") ||
      (domEl?.closest(".shadow-2xl") as HTMLElement | null);

    if (!domEl || !canvasViewport) {
      setOverlayRect(null);
      return;
    }

    const elementRect = domEl.getBoundingClientRect();
    const viewportRect = canvasViewport.getBoundingClientRect();
    const relative = getRelativeElementRect(elementRect, viewportRect, zoom || 1);

    setOverlayRect(relative);
  }, [selectedNodeId, isRoot, zoom]);

  // Track DOM element resizing and viewport layout changes
  useEffect(() => {
    if (!selectedNodeId || isRoot) return;

    const domEl = document.querySelector<HTMLElement>(`[data-node-id="${selectedNodeId}"]`);
    if (!domEl) return;

    // Measure on next animation frame to avoid synchronous cascading render
    const frameId = requestAnimationFrame(() => {
      updateOverlayPosition();
    });

    const resizeObserver = new ResizeObserver(() => {
      updateOverlayPosition();
    });

    resizeObserver.observe(domEl);
    window.addEventListener("scroll", updateOverlayPosition, true);
    window.addEventListener("resize", updateOverlayPosition);

    return () => {
      cancelAnimationFrame(frameId);
      resizeObserver.disconnect();
      window.removeEventListener("scroll", updateOverlayPosition, true);
      window.removeEventListener("resize", updateOverlayPosition);
    };
  }, [selectedNodeId, isRoot, updateOverlayPosition]);

  // Update overlay immediately when zoom or element style (position, margin, size) mutates
  useEffect(() => {
    if (!selectedNodeId || isRoot) return;

    const frameId = requestAnimationFrame(() => {
      updateOverlayPosition();
    });

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [zoom, nodeStyleKey, selectedNodeId, isRoot, updateOverlayPosition]);

  // Track keyboard arrow movement to hide handles temporarily while nudging
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        selectedNodeId &&
        !isRoot
      ) {
        setIsMoving(true);
        if (movingTimeoutRef.current) {
          clearTimeout(movingTimeoutRef.current);
        }
        movingTimeoutRef.current = setTimeout(() => {
          setIsMoving(false);
        }, 300);

        requestAnimationFrame(() => {
          updateOverlayPosition();
        });
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        if (movingTimeoutRef.current) {
          clearTimeout(movingTimeoutRef.current);
        }
        movingTimeoutRef.current = setTimeout(() => {
          setIsMoving(false);
          updateOverlayPosition();
        }, 150);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      if (movingTimeoutRef.current) {
        clearTimeout(movingTimeoutRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [selectedNodeId, isRoot, updateOverlayPosition]);

  // Handle pointer down on a resize handle
  const handleResizePointerDown = (
    direction: ResizeHandleDirection,
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedNodeId || !overlayRect) return;

    const domEl = document.querySelector<HTMLElement>(`[data-node-id="${selectedNodeId}"]`);
    if (!domEl) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setActiveHandle(direction);

    const startX = e.clientX;
    const startY = e.clientY;

    const initialBounds: InitialBounds = {
      width: overlayRect.width,
      height: overlayRect.height,
      left: overlayRect.left,
      top: overlayRect.top,
    };

    let latestWidth = initialBounds.width;
    let latestHeight = initialBounds.height;

    const handlePointerMove = (moveEvent: PointerEvent) => {
      const delta = {
        dx: moveEvent.clientX - startX,
        dy: moveEvent.clientY - startY,
      };

      const result = computeResize({
        direction,
        initialBounds,
        delta,
        zoom: zoom || 1,
      });

      latestWidth = result.width;
      latestHeight = result.height;

      // 60fps Transient visual update directly on the DOM element (no ProjectStore mutation)
      domEl.style.width = `${result.width}px`;
      domEl.style.height = `${result.height}px`;

      setTransientSize({ width: result.width, height: result.height });
      setOverlayRect((prev) =>
        prev
          ? {
              ...prev,
              width: result.width,
              height: result.height,
              right: prev.left + result.width,
              bottom: prev.top + result.height,
            }
          : null
      );
    };

    const handlePointerUp = (upEvent: PointerEvent) => {
      try {
        e.currentTarget.releasePointerCapture(upEvent.pointerId);
      } catch {
        // Pointer capture already released
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);

      setActiveHandle(null);
      setTransientSize(null);

      // Commit final dimensions to ProjectStore (ONE history entry)
      if (selectedNodeId) {
        updateNodeStyle(selectedNodeId, {
          width: `${latestWidth}px`,
          height: `${latestHeight}px`,
        });
      }

      updateOverlayPosition();
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  };

  if (!selectedNodeId || !overlayRect || isRoot || !selectedNode) {
    return null;
  }

  const tagName = selectedNode.type === "element" ? selectedNode.tag : "comp";
  const displayName = selectedNode.name || tagName;

  const isNudgeOrResize = isMoving || activeHandle !== null;

  return (
    <div
      ref={overlayRef}
      className="absolute inset-0 pointer-events-none z-40 overflow-visible"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Selection Box Outline - 1px crisp ring while moving/resizing for pixel precision */}
      <div
        className={`absolute rounded-xs pointer-events-none transition-none ${
          isNudgeOrResize ? "ring-1 ring-blue-500" : "ring-2 ring-blue-500 shadow-xs"
        }`}
        style={{
          left: `${overlayRect.left}px`,
          top: `${overlayRect.top}px`,
          width: `${overlayRect.width}px`,
          height: `${overlayRect.height}px`,
        }}
      >
        {/* Element Header Badge */}
        <div className="absolute -top-6 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-t-md bg-blue-600 text-white text-[10px] font-semibold tracking-tight shadow-sm pointer-events-auto select-none">
          <span className="truncate max-w-36">{displayName}</span>
          <span className="opacity-75 font-mono text-[9px]">&lt;{tagName}&gt;</span>
        </div>

        {/* Live Dimension Tooltip while Resizing */}
        {transientSize && (
          <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-neutral-900/90 text-white text-[10px] font-mono font-medium shadow-md border border-neutral-700/60 backdrop-blur-xs select-none whitespace-nowrap">
            {formatDimensions(transientSize.width, transientSize.height)}
          </div>
        )}

        {/* 8 Interactive Resize Handles - hidden while actively resizing or moving */}
        {!activeHandle &&
          !isMoving &&
          HANDLES.map(({ dir, cursor, className }) => (
            <div
              key={dir}
              onPointerDown={(e) => handleResizePointerDown(dir, e)}
              className={`absolute w-2.5 h-2.5 bg-white dark:bg-neutral-900 border-2 border-blue-500 rounded-xs shadow-xs pointer-events-auto transition-transform hover:scale-125 select-none ${cursor} ${className}`}
            />
          ))}
      </div>
    </div>
  );
};
