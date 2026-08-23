"use client";

import React, { useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { BreakpointBar } from "./BreakpointBar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import {
  Eye,
  Edit3,
  Moon,
  Sun,
  FileJson,
} from "lucide-react";

interface TopToolbarProps {
  onOpenJsonModal?: () => void;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  onOpenJsonModal,
}) => {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const { isDark, toggleTheme } = useTheme();
  const projectName = "My Awesome Project";

  return (
    <header className="h-12 border-b border-border flex items-center justify-between px-3 z-30 select-none bg-background text-foreground">
      {/* Left: Brand & Project Name */}
      <div className="flex items-center gap-2.5">
        {/* Brand Logo */}
        <div className="flex items-center gap-2 pr-2.5 border-r border-border">
          <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center font-bold text-xs shadow-xs">
            P
          </div>
        </div>

        {/* Project Name */}
        <div className="flex items-center">
          <div className="flex items-center gap-1.5 px-2.5 h-7.5 rounded-md text-xs font-medium text-muted-foreground bg-secondary/50 border border-border/80 max-w-45">
            <span className="truncate text-foreground text-xs font-medium">{projectName}</span>
            <Edit3 className="size-3 opacity-50 shrink-0" />
          </div>
        </div>
      </div>

      {/* Center: Responsive Breakpoint Selector */}
      <BreakpointBar />

      {/* Right: Mode Toggle, Theme Toggle, Export Button */}
      <div className="flex items-center gap-2">
        {/* Mode Toggle (Edit / Preview) */}
        <Tabs
          value={mode}
          onValueChange={(val) => {
            if (val) setMode(val as "edit" | "preview");
          }}
        >
          <TabsList>
            <TabsTrigger value="edit">
              <Edit3 className="size-3" />
              <span className="hidden md:inline">Edit</span>
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="size-3" />
              <span className="hidden md:inline">Preview</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Theme Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={toggleTheme}
              className="h-7.5 w-7.5 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
            >
              {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isDark ? "Light Mode" : "Dark Mode"}</TooltipContent>
        </Tooltip>

        {/* Export JSON Button */}
        <Button
          onClick={onOpenJsonModal}
          className="h-7.5 gap-1.5 font-medium text-xs rounded-md cursor-pointer shadow-xs"
        >
          <FileJson className="size-3.5" />
          <span>Export</span>
        </Button>
      </div>
    </header>
  );
};
