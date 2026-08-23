"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FolderOpen,
  Plus,
  Trash2,
  Search,
  Clock,
  Layers,
  ExternalLink,
  CheckCircle2,
  Loader2,
  FileCode2,
} from "lucide-react";
import type { ID, ProjectSummary, Project } from "@/types/project";
import { getProjectRepository } from "@/lib/repository/projectRepository";
import { CreateProjectModal } from "./CreateProjectModal";
import { DeleteProjectDialog } from "./DeleteProjectDialog";

interface ProjectsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProjectId?: ID;
  onSelectProject: (projectId: ID) => void;
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export const ProjectsManagerModal: React.FC<ProjectsManagerModalProps> = ({
  isOpen,
  onClose,
  currentProjectId,
  onSelectProject,
}) => {
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Deletion state
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const repository = getProjectRepository();

  const loadProjectsList = useCallback(async () => {
    try {
      setIsLoading(true);
      const list = await repository.listProjects();
      setProjects(list);
    } catch (err) {
      console.error("Failed to load projects:", err);
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    if (!isOpen) return;

    let isSubscribed = true;

    repository
      .listProjects()
      .then((list) => {
        if (isSubscribed) {
          setProjects(list);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load projects:", err);
        if (isSubscribed) {
          setIsLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [isOpen, repository]);

  const handleCreateSuccess = (newProject: Project) => {
    setIsCreateOpen(false);
    loadProjectsList();
    onSelectProject(newProject.id);
    onClose();
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      setIsDeleting(true);
      await repository.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      await loadProjectsList();
    } catch (err) {
      console.error("Failed to delete project:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          style={{ width: "90vw", maxWidth: "850px" }}
          className="w-[90vw] !max-w-[850px] max-h-[88vh] flex flex-col p-0 gap-0 overflow-hidden bg-card border-border shadow-2xl"
        >
          {/* Header */}
          <div className="p-6 border-b border-border/80 bg-secondary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary shrink-0 shadow-xs">
                  <FolderOpen className="size-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-semibold tracking-tight">Your Projects</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                    Switch between projects, create new components, or manage existing documents.
                  </DialogDescription>
                </div>
              </div>

              <Button
                onClick={() => setIsCreateOpen(true)}
                className="h-8.5 px-3.5 gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
              >
                <Plus className="size-4" />
                <span>New Project</span>
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative mt-4">
              <Search className="size-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects by name or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9.5 h-9 text-xs bg-background/80 border-border/70 focus-visible:ring-1"
              />
            </div>
          </div>

          {/* Projects List (Row by Row) */}
          <ScrollArea className="flex-1 max-h-[60vh] p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-2.5 text-muted-foreground">
                <Loader2 className="size-7 animate-spin text-primary" />
                <span className="text-xs">Loading projects...</span>
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground px-4">
                <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/80 mb-3 shadow-xs">
                  <Layers className="size-6 opacity-40" />
                </div>
                <h4 className="text-sm font-semibold text-foreground">No projects found</h4>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  {searchQuery
                    ? "No projects match your search query."
                    : "You haven't created any visual component projects yet."}
                </p>
                {!searchQuery && (
                  <Button
                    onClick={() => setIsCreateOpen(true)}
                    variant="outline"
                    className="mt-4 h-8.5 text-xs gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="size-3.5" />
                    <span>Create your first project</span>
                  </Button>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {filteredProjects.map((project) => {
                  const isCurrent = project.id === currentProjectId;
                  return (
                    <div
                      key={project.id}
                      className={`group relative rounded-xl border p-4 flex items-center justify-between gap-5 transition-all duration-150 ${
                        isCurrent
                          ? "border-primary/40 bg-primary/5 shadow-xs"
                          : "border-border/70 hover:border-border hover:bg-secondary/40 bg-card"
                      }`}
                    >
                      {/* Left: Project Icon & Details */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            isCurrent
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-secondary/80 border-border/80 text-muted-foreground group-hover:text-foreground"
                          }`}
                        >
                          <FileCode2 className="size-5" />
                        </div>

                        <div className="min-w-0 flex-1 space-y-1">
                          <div className="flex items-center gap-2.5">
                            <h4 className="font-semibold text-sm text-foreground truncate max-w-md">
                              {project.name}
                            </h4>
                            {isCurrent && (
                              <Badge
                                variant="default"
                                className="text-[10px] h-5 px-2 gap-1 bg-primary/20 text-primary border-primary/30 shrink-0 font-medium"
                              >
                                <CheckCircle2 className="size-3" />
                                Active Workspace
                              </Badge>
                            )}
                          </div>

                          {project.description ? (
                            <p className="text-xs text-muted-foreground truncate max-w-lg">
                              {project.description}
                            </p>
                          ) : (
                            <p className="text-xs text-muted-foreground/60 italic">
                              No description provided
                            </p>
                          )}

                          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80 pt-0.5">
                            <Clock className="size-3 shrink-0 opacity-60" />
                            <span>Updated {formatDate(project.updatedAt)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Delete Button */}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(project);
                          }}
                          className="h-8.5 w-8.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
                          title="Delete project"
                        >
                          <Trash2 className="size-4" />
                        </Button>

                        {/* Open Button */}
                        <Button
                          variant={isCurrent ? "secondary" : "default"}
                          size="sm"
                          onClick={() => {
                            onSelectProject(project.id);
                            onClose();
                          }}
                          className="h-8.5 text-xs px-4 gap-1.5 rounded-lg cursor-pointer font-medium shadow-xs"
                        >
                          <span>{isCurrent ? "Working" : "Open"}</span>
                          {!isCurrent && <ExternalLink className="size-3.5" />}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* Create Project Modal */}
      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onProjectCreated={handleCreateSuccess}
      />

      {/* Delete Project Confirmation Dialog */}
      <DeleteProjectDialog
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        projectName={projectToDelete?.name}
        isDeleting={isDeleting}
      />
    </>
  );
};
