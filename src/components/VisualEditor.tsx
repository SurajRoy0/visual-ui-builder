"use client";

import React, { useState, useEffect, useCallback } from "react";
import { TopToolbar } from "./toolbar/TopToolbar";
import { LeftSidebar } from "./sidebar-left/LeftSidebar";
import { CanvasContainer } from "./canvas/CanvasContainer";
import { RightSidebar } from "./sidebar-right/RightSidebar";
import { JsonModal } from "./modals/JsonModal";
import { ConfirmDeleteDialog } from "./modals/ConfirmDeleteDialog";
import { ProjectsManagerModal } from "./modals/ProjectsManagerModal";
import { HelpModal } from "./modals/HelpModal";
import { useProjectStore } from "@/store/project";
import { useEditorStore } from "@/store/editor";
import { useAutosave } from "@/hooks/useAutosave";
import { getProjectRepository } from "@/lib/repository/projectRepository";
import type { ID } from "@/types/project";
import { Loader2 } from "lucide-react";

interface VisualEditorProps {
  initialProjectId?: ID;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ initialProjectId }) => {
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isProjectsModalOpen, setIsProjectsModalOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const currentProjectId = useProjectStore((state) => state.project.id);
  const loadProject = useProjectStore((state) => state.loadProject);
  const isHelpModalOpen = useEditorStore((state) => state.isHelpModalOpen);
  const setIsHelpModalOpen = useEditorStore((state) => state.setIsHelpModalOpen);

  const { status: saveStatus, saveNow } = useAutosave({ debounceMs: 600 });
  const repository = getProjectRepository();

  const handleSelectProject = useCallback(
    async (projectId: ID) => {
      try {
        await saveNow(); // Flush any pending edits before switching
        const loaded = await repository.loadProject(projectId);
        if (loaded) {
          loadProject(loaded);
          if (typeof window !== "undefined") {
            window.history.replaceState(null, "", `/editor/${projectId}`);
          }
        }
      } catch (err) {
        console.error("Failed to switch project:", err);
      }
    },
    [loadProject, repository, saveNow]
  );

  useEffect(() => {
    let isCancelled = false;

    async function initProject() {
      try {
        setIsInitializing(true);

        // 1. If an explicit projectId was requested
        if (initialProjectId) {
          const project = await repository.loadProject(initialProjectId);
          if (project && !isCancelled) {
            loadProject(project);
            setIsInitializing(false);
            return;
          }
        }

        // 2. Otherwise check if there are existing projects
        const existingProjects = await repository.listProjects();
        if (existingProjects.length > 0 && !isCancelled) {
          const mostRecent = await repository.loadProject(existingProjects[0].id);
          if (mostRecent && !isCancelled) {
            loadProject(mostRecent);
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", `/editor/${mostRecent.id}`);
            }
            setIsInitializing(false);
            return;
          }
        }

        // 3. If no project exists at all, create an initial default project
        if (!isCancelled) {
          const newDefault = await repository.createProject({
            name: "My First Component",
            description: "Initial visual component draft",
          });
          loadProject(newDefault);
          if (typeof window !== "undefined") {
            window.history.replaceState(null, "", `/editor/${newDefault.id}`);
          }
        }
      } catch (err) {
        console.error("Project initialization error:", err);
      } finally {
        if (!isCancelled) {
          setIsInitializing(false);
        }
      }
    }

    initProject();

    return () => {
      isCancelled = true;
    };
  }, [initialProjectId, loadProject, repository]);

  if (isInitializing) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-background text-foreground gap-3">
        <div className="relative">
          <div className="absolute -inset-2 bg-linear-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-2xl blur-md animate-pulse" />
          <div className="relative w-12 h-12 rounded-xl bg-secondary border border-border flex items-center justify-center shadow-md">
            <span className="font-black text-base bg-linear-to-br from-blue-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent select-none">
              P
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
          <Loader2 className="size-3.5 animate-spin text-primary" />
          <span>Loading project workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Top Toolbar */}
      <TopToolbar
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
        onOpenProjectsModal={() => setIsProjectsModalOpen(true)}
        saveStatus={saveStatus}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Sidebar (Elements, Layers, Components, Assets, Icons) */}
        <LeftSidebar />

        {/* Canvas Area */}
        <CanvasContainer />

        {/* Right Sidebar (Properties Inspector Panel) */}
        <RightSidebar />
      </div>

      {/* Modals & Dialogs */}
      <JsonModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
      <ProjectsManagerModal
        isOpen={isProjectsModalOpen}
        onClose={() => setIsProjectsModalOpen(false)}
        currentProjectId={currentProjectId}
        onSelectProject={handleSelectProject}
      />
      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />
    </div>
  );
};
