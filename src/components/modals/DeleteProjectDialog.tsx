"use client";

import React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";

interface DeleteProjectDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName?: string;
  isDeleting?: boolean;
}

export const DeleteProjectDialog: React.FC<DeleteProjectDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  projectName = "this project",
  isDeleting = false,
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 text-destructive">
            <div className="w-9 h-9 rounded-lg bg-destructive/10 flex items-center justify-center shrink-0 border border-destructive/20">
              <AlertTriangle className="size-5" />
            </div>
            <AlertDialogTitle className="text-base font-semibold">Delete Project?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2 text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to permanently delete{" "}
            <span className="font-semibold text-foreground">&quot;{projectName}&quot;</span>? This action cannot be undone and will delete all components, elements, styles, and animation timelines in this project.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel
            onClick={onClose}
            disabled={isDeleting}
            className="cursor-pointer rounded-md text-xs h-8"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault();
              onConfirm();
            }}
            disabled={isDeleting}
            className="gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer rounded-md text-xs h-8"
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-3.5" />
                <span>Delete Project</span>
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
