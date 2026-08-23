"use client";

import React from "react";
import { Sparkles, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export const IconsTab: React.FC = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-center text-center h-full min-h-75 text-muted-foreground">
      <div className="w-10 h-10 rounded-md bg-secondary border border-border flex items-center justify-center mb-3 text-foreground shadow-2xs">
        <Sparkles className="size-5 text-blue-500" />
      </div>
      <h3 className="text-xs font-semibold text-foreground mb-1">
        Icon Directory
      </h3>
      <p className="text-[11px] max-w-50 leading-relaxed mb-4 text-muted-foreground">
        Browse and insert hundreds of Lucide & custom vector icons into any element.
      </p>
      <div className="w-full max-w-55 relative">
        <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search icons..."
          disabled
          className="text-xs pl-8 h-7 rounded-md"
        />
      </div>
      <span className="text-[10px] text-muted-foreground mt-3 font-mono">
        (Coming soon)
      </span>
    </div>
  );
};
