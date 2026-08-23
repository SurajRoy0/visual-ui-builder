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
import { Trash2, AlertTriangle } from "lucide-react";

interface ConfirmDeleteDialogProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const ConfirmDeleteDialog: React.FC<ConfirmDeleteDialogProps> = ({
  isOpen = false,
  onClose = () => { },
}) => {
  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5 text-destructive">
            <div className="w-8 h-8 rounded-md bg-destructive/10 flex items-center justify-center shrink-0">
              <AlertTriangle className="size-4.5" />
            </div>
            <AlertDialogTitle>Delete Element?</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="pt-2">
            Are you sure you want to delete this element and all its child nodes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel onClick={onClose} className="cursor-pointer rounded-md">Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onClose} className="gap-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer rounded-md">
            <Trash2 className="size-3.5" />
            Delete Element
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
