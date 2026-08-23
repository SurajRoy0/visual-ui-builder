"use client";

import React, { useState } from "react";
import { TopToolbar } from "./toolbar/TopToolbar";
import { LeftSidebar } from "./sidebar-left/LeftSidebar";
import { CanvasContainer } from "./canvas/CanvasContainer";
import { RightSidebar } from "./sidebar-right/RightSidebar";
import { JsonModal } from "./modals/JsonModal";
import { ConfirmDeleteDialog } from "./modals/ConfirmDeleteDialog";

export const VisualEditor: React.FC = () => {
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Top Toolbar */}
      <TopToolbar
        onOpenJsonModal={() => setIsJsonModalOpen(true)}
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
    </div>
  );
};
