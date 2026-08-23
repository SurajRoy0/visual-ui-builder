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
import { Layers } from "lucide-react";

interface AddBreakpointModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, minWidth: number) => void;
  defaultWidth?: number;
}

export const AddBreakpointModal: React.FC<AddBreakpointModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  defaultWidth = 1024,
}) => {
  const [name, setName] = useState("");
  const [minWidth, setMinWidth] = useState(defaultWidth.toString());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalName = name.trim() || "Custom";
    const finalWidth = Math.max(0, parseInt(minWidth, 10) || defaultWidth);
    onAdd(finalName, finalWidth);
    setName("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-card border-border shadow-2xl p-6">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
              <Layers className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold text-foreground">
                Add Custom Breakpoint
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Create a responsive threshold. If name is omitted, it defaults to &quot;Custom&quot;.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Breakpoint Name <span className="text-muted-foreground font-normal">(Optional)</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Ultra Wide, Small Mobile (default: Custom)"
              className="text-xs h-9"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Min Width (px) <span className="text-destructive">*</span>
            </label>
            <Input
              type="number"
              min="0"
              max="4000"
              value={minWidth}
              onChange={(e) => setMinWidth(e.target.value)}
              placeholder="e.g. 1024"
              className="text-xs h-9 font-mono"
              required
            />
          </div>

          <DialogFooter className="pt-3 gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="default"
              size="sm"
              className="text-xs"
            >
              Add Breakpoint
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
