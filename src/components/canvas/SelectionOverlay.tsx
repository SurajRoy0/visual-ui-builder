"use client";

import React from "react";
import { useEditorStore } from "@/hooks/use-editor-store";

const HANDLES = [
  { type: "nw", cursor: "nwse-resize", className: "-top-1 -left-1" },
  { type: "n", cursor: "ns-resize", className: "-top-1 left-1/2 -translate-x-1/2" },
  { type: "ne", cursor: "nesw-resize", className: "-top-1 -right-1" },
  { type: "e", cursor: "ew-resize", className: "top-1/2 -translate-y-1/2 -right-1" },
  { type: "se", cursor: "nwse-resize", className: "-bottom-1 -right-1" },
  { type: "s", cursor: "ns-resize", className: "-bottom-1 left-1/2 -translate-x-1/2" },
  { type: "sw", cursor: "nesw-resize", className: "-bottom-1 -left-1" },
  { type: "w", cursor: "ew-resize", className: "top-1/2 -translate-y-1/2 -left-1" },
];

export const SelectionOverlay: React.FC = () => {
  const { selectedElement } = useEditorStore();

  if (selectedElement.id === "root-page") {
    return null;
  }

  // Dynamic bounds for preview
  let top = "64px";
  let left = "calc(50% - 300px)";
  let width = "600px";
  let height = "260px";
  let dimensionLabel = "600 × 260";

  if (selectedElement.id === "hero-heading") {
    top = "104px";
    left = "calc(50% - 240px)";
    width = "480px";
    height = "40px";
    dimensionLabel = "480 × 40";
  } else if (selectedElement.id === "hero-desc") {
    top = "160px";
    left = "calc(50% - 240px)";
    width = "480px";
    height = "48px";
    dimensionLabel = "480 × 48";
  } else if (selectedElement.id === "hero-buttons") {
    top = "220px";
    left = "calc(50% - 130px)";
    width = "260px";
    height = "44px";
    dimensionLabel = "260 × 44";
  }

  return (
    <div
      style={{
        position: "absolute",
        top,
        left,
        width,
        height,
        transition: "all 0.15s ease-out",
      }}
      className="pointer-events-none z-30 border-2 border-blue shadow-2xs rounded-md"
    >
      {/* Live Dimension Indicator Tag */}
      <div className="absolute -bottom-5 right-0 bg-blue text-white px-1.5 py-0.5 rounded-md text-[9px] font-mono font-medium shadow-xs pointer-events-none whitespace-nowrap">
        {dimensionLabel}
      </div>

      {/* Resize handles */}
      {HANDLES.map((h) => (
        <div
          key={h.type}
          style={{ cursor: h.cursor }}
          className={`absolute w-2 h-2 bg-white border border-blue rounded-xs shadow-2xs ${h.className}`}
        />
      ))}
    </div>
  );
};

