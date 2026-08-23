"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2, Sparkles } from "lucide-react";
import type { Project } from "@/types/project";
import { getProjectRepository } from "@/lib/repository/projectRepository";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated?: (project: Project) => void;
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const repository = getProjectRepository();
      const newProject = await repository.createProject({
        name: name.trim(),
        description: description.trim(),
      });

      setName("");
      setDescription("");
      onClose();
      if (onProjectCreated) {
        onProjectCreated(newProject);
      }
    } catch (err) {
      console.error("Failed to create project:", err);
      setError("Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
                <Sparkles className="size-4 text-primary" />
              </div>
              <DialogTitle className="text-base font-semibold">Create New Project</DialogTitle>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Start building a new visual React component or layout.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label htmlFor="project-name" className="text-xs font-medium">
                Project Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="project-name"
                placeholder="e.g. Hero Section, Pricing Card..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="h-8 text-xs"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="project-description" className="text-xs font-medium">
                Description <span className="text-muted-foreground font-normal">(Optional)</span>
              </Label>
              <Textarea
                id="project-description"
                placeholder="Brief summary of what this component does..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="text-xs resize-none"
                disabled={isSubmitting}
              />
            </div>

            {error && (
              <p className="text-xs text-destructive font-medium">{error}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="text-xs h-8 cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="text-xs h-8 gap-1.5 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <PlusCircle className="size-3.5" />
                  <span>Create Project</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
