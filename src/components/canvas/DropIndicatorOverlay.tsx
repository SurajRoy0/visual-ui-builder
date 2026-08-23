"use client";

// ============================================================
// components/canvas/DropIndicatorOverlay.tsx
//
// Live visual drop overlay for Phase 4:
// - Renders 'inside' container highlights
// - Renders 'before' and 'after' insertion indicator lines
// - Displays instant validation / constraint rejection feedback
// - Never exported with document output (editor-only)
// ============================================================

import React from "react";
import type { DropTargetResult } from "@/lib/dropTargetResolution";
import type { ElementDefinitionItem } from "@/lib/elementDefinitions";
import { AlertCircle, CornerDownRight, Ban } from "lucide-react";

interface DropIndicatorOverlayProps {
  dropTarget: DropTargetResult | null;
  draggedItem: ElementDefinitionItem | null;
}

export const DropIndicatorOverlay: React.FC<DropIndicatorOverlayProps> = ({
  dropTarget,
  draggedItem,
}) => {
  if (!dropTarget || !draggedItem) {
    return null;
  }

  const { allowed, reason, mode, indicator } = dropTarget;

  if (indicator.type === "box") {
    return (
      <div
        className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
        style={{ width: "100%", height: "100%" }}
      >
        <div
          className={`absolute transition-all duration-75 rounded-md flex flex-col justify-start items-start p-2 ${
            allowed
              ? "bg-blue-500/10 border-2 border-dashed border-blue-500 shadow-md shadow-blue-500/20"
              : "bg-amber-500/10 border-2 border-dashed border-amber-500/80 shadow-md shadow-amber-500/20"
          }`}
          style={{
            left: `${indicator.left}px`,
            top: `${indicator.top}px`,
            width: `${indicator.width}px`,
            height: `${indicator.height}px`,
          }}
        >
          {/* Status Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold backdrop-blur-md shadow-sm border ${
              allowed
                ? "bg-blue-600/90 text-white border-blue-400/50"
                : "bg-amber-600/90 text-white border-amber-400/50"
            }`}
          >
            {allowed ? (
              <>
                <CornerDownRight className="size-3" />
                <span>Insert &lt;{draggedItem.tag}&gt; inside</span>
              </>
            ) : (
              <>
                <Ban className="size-3 text-white" />
                <span>{reason || `Cannot insert <${draggedItem.tag}> here`}</span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Line indicator for 'before' or 'after' insertion between siblings
  const isVertical = indicator.orientation === "vertical";

  return (
    <div
      className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Insertion line */}
      <div
        className={`absolute transition-all duration-75 rounded-full ${
          allowed
            ? "bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.9)]"
            : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.9)]"
        }`}
        style={{
          left: `${isVertical ? indicator.left - 1.5 : indicator.left}px`,
          top: `${isVertical ? indicator.top : indicator.top - 1.5}px`,
          width: `${isVertical ? 3 : indicator.width}px`,
          height: `${isVertical ? indicator.height : 3}px`,
        }}
      >
        {/* Start endpoint pin */}
        <div
          className={`absolute -left-1 -top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
            allowed ? "bg-blue-600" : "bg-amber-600"
          }`}
        />
        {/* End endpoint pin */}
        <div
          className={`absolute -right-1 -bottom-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
            allowed ? "bg-blue-600" : "bg-amber-600"
          }`}
        />

        {/* Small Mode Pill */}
        <div
          className={`absolute z-10 -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold shadow-md border ${
            allowed
              ? "bg-blue-600 text-white border-blue-400/50"
              : "bg-amber-600 text-white border-amber-400/50"
          }`}
        >
          {allowed ? (
            <span>
              Insert &lt;{draggedItem.tag}&gt; ({mode})
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <AlertCircle className="size-3" />
              {reason || "Invalid location"}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
