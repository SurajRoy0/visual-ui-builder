"use client";

import React from "react";
import { Component, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ComponentsTab: React.FC = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-center text-center h-full min-h-75 text-muted-foreground">
      <div className="w-10 h-10 rounded-md bg-secondary border border-border flex items-center justify-center mb-3 text-foreground shadow-2xs">
        <Component className="size-5 text-emerald-500" />
      </div>
      <h3 className="text-xs font-semibold text-foreground mb-1">
        Reusable Components
      </h3>
      <p className="text-[11px] max-w-50 leading-relaxed mb-4 text-muted-foreground">
        Save complex box & typography arrangements into reusable symbols across your project pages.
      </p>
      <Button variant="outline" size="sm" disabled className="gap-1.5 opacity-60 rounded-md">
        <Plus className="size-3.5" />
        Create Component
      </Button>
      <span className="text-[10px] text-muted-foreground mt-2 font-mono">
        (Coming soon)
      </span>
    </div>
  );
};
