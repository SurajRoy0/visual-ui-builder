"use client";

import React from "react";
import { CanvasRenderer } from "./CanvasRenderer";
import { SelectionOverlay } from "./SelectionOverlay";
import { CanvasBar } from "./CanvasBar";
import { useEditorStore } from "@/hooks/use-editor-store";

export const CanvasContainer: React.FC = () => {
  const { canvasScale, canvasWidth } = useEditorStore();

  return (
    <div className="relative flex-1 flex flex-col h-full overflow-hidden select-none bg-secondary/30">
      {/* Standalone Canvas Top Bar */}
      <CanvasBar />

      {/* Canvas Scroll Area */}
      <div className="flex-1 overflow-auto flex items-start justify-center p-8 relative">
        <div
          className="relative flex flex-col items-center transition-transform origin-top"
          style={{
            transform: `scale(${canvasScale})`,
          }}
        >
          <div className="relative flex items-stretch">
            {/* Left Canvas Resize Handle */}
            <div
              title="Resize handle"
              className="w-3 flex items-center justify-center cursor-ew-resize group select-none relative -mr-1.5 z-20"
            >
              <div className="w-1 h-14 bg-border group-hover:bg-foreground rounded-full transition-colors" />
            </div>

            {/* Actual Viewport Screen */}
            <div
              style={{
                width: `${canvasWidth}px`,
                minHeight: "750px",
              }}
              className="relative shadow-2xl rounded-md overflow-hidden bg-background ring-1 ring-border"
            >
              {/* Static Canvas Elements */}
              <CanvasRenderer />

              {/* Selection & Resize Overlay */}
              <SelectionOverlay />
            </div>

            {/* Right Canvas Resize Handle */}
            <div
              title="Resize handle"
              className="w-3 flex items-center justify-center cursor-ew-resize group select-none relative -ml-1.5 z-20"
            >
              <div className="w-1 h-14 bg-border group-hover:bg-foreground rounded-full transition-colors" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
