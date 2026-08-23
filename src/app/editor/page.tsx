"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Search,
  Clock,
  ExternalLink,
  Loader2,
  ArrowLeft,
  Sparkles,
  LayoutGrid,
} from "lucide-react";
import type { ProjectSummary, Project } from "@/types/project";
import { getProjectRepository } from "@/lib/repository/projectRepository";
import { CreateProjectModal } from "@/components/modals/CreateProjectModal";
import { DeleteProjectDialog } from "@/components/modals/DeleteProjectDialog";
import { useTheme } from "@/hooks/use-theme";
import { Sun, Moon } from "lucide-react";

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

export default function ProjectsDashboardPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Deletion state
  const [projectToDelete, setProjectToDelete] = useState<ProjectSummary | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { isDark, toggleTheme } = useTheme();
  const repository = getProjectRepository();

  const loadProjects = useCallback(async () => {
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
  }, [repository]);

  const handleCreateSuccess = (newProject: Project) => {
    setIsCreateOpen(false);
    router.push(`/editor/${newProject.id}`);
  };

  const handleDeleteConfirm = async () => {
    if (!projectToDelete) return;
    try {
      setIsDeleting(true);
      await repository.deleteProject(projectToDelete.id);
      setProjectToDelete(null);
      await loadProjects();
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
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-20 px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mr-2 cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Home</span>
          </Link>

          <div className="h-4 w-px bg-border" />

          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="absolute -inset-1 bg-linear-to-r from-blue-500/25 via-purple-500/25 to-pink-500/25 rounded-lg blur-xs" />
              <div className="relative w-7 h-7 rounded-md bg-linear-to-b from-secondary to-secondary/60 border border-border/90 flex items-center justify-center shadow-xs">
                <span className="font-black text-xs bg-linear-to-br from-blue-500 via-indigo-500 to-pink-500 bg-clip-text text-transparent select-none tracking-tighter">
                  P
                </span>
              </div>
            </div>
            <span className="font-semibold text-sm tracking-tight">Playfull Projects</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <Button
            variant="outline"
            size="icon-sm"
            onClick={toggleTheme}
            className="h-8 w-8 rounded-md text-muted-foreground hover:text-foreground cursor-pointer"
          >
            {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
          </Button>

          {/* Create Project Button */}
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="h-8 gap-1.5 text-xs font-medium cursor-pointer shadow-xs"
          >
            <Plus className="size-3.5" />
            <span>New Project</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
        {/* Banner / Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Your Projects</h1>
            <p className="text-xs text-muted-foreground mt-1">
              Create, customize, and edit your visual React components and layouts.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <Search className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8.5 h-9 text-xs bg-card border-border/80"
            />
          </div>
        </div>

        {/* Projects Grid of Cards */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
            <Loader2 className="size-7 animate-spin text-primary" />
            <span className="text-xs">Loading projects...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground px-4 bg-card/40 border border-dashed border-border rounded-2xl">
            <div className="w-14 h-14 rounded-2xl bg-secondary/80 flex items-center justify-center border border-border/80 mb-3 shadow-xs">
              <LayoutGrid className="size-6 text-muted-foreground/60" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">No projects found</h3>
            <p className="text-xs text-muted-foreground max-w-sm mt-1">
              {searchQuery
                ? "No projects match your search query."
                : "You don't have any projects yet. Create your first visual React component."}
            </p>
            {!searchQuery && (
              <Button
                onClick={() => setIsCreateOpen(true)}
                className="mt-4 h-8.5 text-xs gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="size-3.5" />
                <span>Create New Project</span>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Create New Project Card Trigger */}
            <div
              onClick={() => setIsCreateOpen(true)}
              className="group relative rounded-2xl border-2 border-dashed border-border/80 hover:border-primary/50 hover:bg-primary/5 p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 min-h-[220px]"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 group-hover:bg-primary/20 text-primary flex items-center justify-center border border-primary/20 transition-transform group-hover:scale-105 mb-3 shadow-xs">
                <Plus className="size-5" />
              </div>
              <h4 className="font-semibold text-xs text-foreground group-hover:text-primary transition-colors">
                Create New Project
              </h4>
              <p className="text-[11px] text-muted-foreground mt-1 max-w-[180px]">
                Start blank or build a component visually
              </p>
            </div>

            {/* List of Project Cards */}
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className="group relative rounded-2xl border border-border/80 hover:border-border hover:shadow-md bg-card/80 flex flex-col justify-between overflow-hidden transition-all duration-200 min-h-[220px]"
              >
                {/* Decorative Linear Header Banner */}
                <div className="h-16 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border-b border-border/60 p-3.5 flex items-center justify-between">
                  <div className="w-8 h-8 rounded-lg bg-background/80 border border-border/80 flex items-center justify-center text-primary shadow-xs">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project);
                      }}
                      className="size-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md cursor-pointer transition-colors"
                      title="Delete project"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
                      {project.name}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 min-h-8">
                      {project.description || "No description provided."}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Clock className="size-3 opacity-60" />
                      <span className="truncate">{formatDate(project.updatedAt)}</span>
                    </div>

                    <Link
                      href={`/editor/${project.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
                    >
                      <span>Open</span>
                      <ExternalLink className="size-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

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
    </div>
  );
}
