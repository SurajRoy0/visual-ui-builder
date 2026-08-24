// ============================================================
// components/canvas/CanvasRenderer.tsx
//
// Root Canvas Renderer for Phase 2:
// - Fetches the active page configuration and root element ID.
// - Mounts the ElementRenderer tree from ProjectStore data.
// ============================================================

"use client";

import React from "react";
import { useProjectStore } from "@/store/project";
import { useEditorStore } from "@/store/editor";
import { ElementRenderer } from "./ElementRenderer";

export const CanvasRenderer: React.FC = () => {
  const activePageId = useEditorStore((state) => state.activePageId);
  const pages = useProjectStore((state) => state.project.pages);

  const activePage = pages[activePageId] || Object.values(pages)[0];
  const rootElementId = activePage?.rootElementId || "root";

  const rootElementExists = useProjectStore((state) => Boolean(state.project.elements[rootElementId]));

  // If root element exists, render it
  if (rootElementExists) {
    return (
      <div className="w-full min-h-full flex-1 flex flex-col">
        <ElementRenderer nodeId={rootElementId} isRoot />
      </div>
    );
  }

  // Fallback if no root is configured
  return (
    <div className="flex items-center justify-center p-12 text-muted-foreground text-xs">
      No root element found for active page.
    </div>
  );
};
