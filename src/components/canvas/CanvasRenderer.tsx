"use client";

import React from "react";
import { CanvasElement } from "./CanvasElement";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/hooks/use-editor-store";

export const CanvasRenderer: React.FC = () => {
  const { selectedElement, selectElementById } = useEditorStore();

  return (
    <div
      id="root-page"
      onClick={() => selectElementById("root-page")}
      className="flex flex-col items-center justify-start w-full min-h-180 p-16 gap-6 bg-background text-foreground cursor-pointer"
    >
      {/* Sample Hero Card */}
      <CanvasElement
        id="card-container"
        type="box"
        isSelected={selectedElement.id === "card-container"}
        onClick={() => selectElementById("card-container")}
        className="flex flex-col items-center justify-center w-150 max-w-full p-10 bg-card border border-border rounded-md shadow-xs gap-4 text-center"
      >
        <CanvasElement
          id="hero-heading"
          type="text"
          tag="h1"
          content="Welcome to Playfull"
          isSelected={selectedElement.id === "hero-heading"}
          onClick={() => selectElementById("hero-heading")}
          className="text-2xl font-bold tracking-tight text-foreground m-0 text-center"
        />

        <CanvasElement
          id="hero-desc"
          type="text"
          tag="p"
          content="A modern visual component editor for crafting beautiful and responsive web layouts."
          isSelected={selectedElement.id === "hero-desc"}
          onClick={() => selectElementById("hero-desc")}
          className="text-xs font-normal text-muted-foreground text-center m-0 max-w-120 leading-relaxed"
        />

        <div
          id="hero-buttons"
          onClick={(e) => {
            e.stopPropagation();
            selectElementById("hero-buttons");
          }}
          className={`flex items-center gap-3 pt-2 p-1 rounded-md transition-all ${selectedElement.id === "hero-buttons" ? "ring-2 ring-blue" : ""
            }`}
        >
          <Button size="sm" className="font-semibold rounded-md pointer-events-none">
            Get Started
          </Button>
          <Button variant="outline" size="sm" className="font-semibold rounded-md pointer-events-none">
            Documentation
          </Button>
        </div>
      </CanvasElement>
    </div>
  );
};
