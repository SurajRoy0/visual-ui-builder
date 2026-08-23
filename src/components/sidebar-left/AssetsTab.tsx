"use client";

import React from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";

export const AssetsTab: React.FC = () => {
  return (
    <div className="p-4 flex flex-col items-center justify-center text-center h-full min-h-75 text-muted-foreground">
      <div className="w-10 h-10 rounded-md bg-secondary border border-border flex items-center justify-center mb-3 text-foreground shadow-2xs">
        <ImageIcon className="size-5 text-purple-500" />
      </div>
      <h3 className="text-xs font-semibold text-foreground mb-1">
        Asset Library
      </h3>
      <p className="text-[11px] max-w-50 leading-relaxed mb-4 text-muted-foreground">
        Upload images, vector graphics, and brand media files directly into your visual project.
      </p>
      <Button variant="outline" size="sm" disabled className="gap-1.5 opacity-60 rounded-md">
        <Upload className="size-3.5" />
        Upload Assets
      </Button>
      <span className="text-[10px] text-muted-foreground mt-2 font-mono">
        (Coming soon)
      </span>
    </div>
  );
};
