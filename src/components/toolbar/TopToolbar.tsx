"use client";

import React, { useState, useRef, useEffect } from "react";
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
  ChevronDown,
  FolderOpen,
  Check,
  Loader2,
  AlertCircle,
  Cloud,
} from "lucide-react";
import { useProjectStore } from "@/store/project";
import type { SaveStatus } from "@/hooks/useAutosave";
import Link from "next/link";

interface TopToolbarProps {
  onOpenJsonModal?: () => void;
  onOpenProjectsModal?: () => void;
  saveStatus?: SaveStatus;
}

export const TopToolbar: React.FC<TopToolbarProps> = ({
  onOpenJsonModal,
  onOpenProjectsModal,
  saveStatus = "saved",
}) => {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const { isDark, toggleTheme } = useTheme();

  const projectName = useProjectStore((state) => state.project.name);
  const mutate = useProjectStore((state) => state.mutate);

  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleStartEditing = () => {
    setEditedName(projectName);
    setIsEditingName(true);
  };

  useEffect(() => {
    if (isEditingName && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingName]);

  const handleFinishEditingName = () => {
    setIsEditingName(false);
    const trimmed = editedName.trim();
    if (trimmed && trimmed !== projectName) {
      mutate((draft) => {
        draft.name = trimmed;
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleFinishEditingName();
    } else if (e.key === "Escape") {
      setEditedName(projectName);
      setIsEditingName(false);
    }
  };

  return (
    <header className="h-12 border-b border-border flex items-center justify-between px-3 z-30 select-none bg-background text-foreground">
      {/* Left: Brand, Project Name & Switcher, Save Status */}
      <div className="flex items-center gap-4">
        <Link href="/editor" className="relative">
          <div className="absolute -inset-1 bg-linear-to-r from-blue-500/25 via-purple-500/25 to-pink-500/25 rounded-lg blur-xs group-hover:opacity-100 opacity-60 transition-opacity" />
          <div className="relative w-7 h-7 rounded-md bg-linear-to-b from-secondary to-secondary/60 border border-border/90 flex items-center justify-center shadow-xs">
            <span className="font-black text-xs bg-linear-to-br from-blue-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent select-none tracking-tighter">
              P
            </span>
          </div>
        </Link>
        {/* Brand Logo & Projects List Trigger */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onOpenProjectsModal}
              className="cursor-pointer group focus:outline-none"
              title="All Projects"
            >
              <FolderOpen className="size-5 ml-3 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>
          </TooltipTrigger>
          <TooltipContent>Manage & Switch Projects</TooltipContent>
        </Tooltip>

        {/* Project Name & Rename */}
        <div className="flex items-center gap-1.5">
          {isEditingName ? (
            <input
              ref={inputRef}
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onBlur={handleFinishEditingName}
              onKeyDown={handleKeyDown}
              className="h-7.5 px-2.5 rounded-md text-xs font-medium text-foreground bg-secondary border border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary w-44"
            />
          ) : (
            <div
              onClick={handleStartEditing}
              className="group flex items-center gap-1.5 px-2.5 h-7.5 rounded-md text-xs font-medium text-muted-foreground bg-secondary/50 hover:bg-secondary/80 border border-border/80 cursor-pointer transition-colors max-w-48"
              title="Click to rename"
            >
              <span className="truncate text-foreground text-xs font-medium">{projectName}</span>
              <Edit3 className="size-3 opacity-0 group-hover:opacity-60 transition-opacity shrink-0" />
            </div>
          )}
        </div>

        {/* Autosave Status Indicator */}
        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary/30 border border-border/40 ml-1">
          {saveStatus === "saving" && (
            <>
              <Loader2 className="size-3 animate-spin text-amber-500" />
              <span className="text-amber-500/90 text-[10px]">Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="size-3 text-emerald-500" />
              <span className="text-muted-foreground text-[10px]">Saved</span>
            </>
          )}
          {saveStatus === "idle" && (
            <>
              <Cloud className="size-3 text-muted-foreground/60" />
              <span className="text-muted-foreground/70 text-[10px]">Synced</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="size-3 text-destructive" />
              <span className="text-destructive text-[10px]">Save Failed</span>
            </>
          )}
        </div>
      </div>

      {/* Center: Responsive Breakpoint Selector */}
      <BreakpointBar />

      {/* Right: Mode Toggle, Theme Toggle, Export Button */}
      <div className="flex items-center gap-2">

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
