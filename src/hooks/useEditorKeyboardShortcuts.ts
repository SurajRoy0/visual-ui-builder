// ============================================================
// hooks/useEditorKeyboardShortcuts.ts
//
// Centralized editor keyboard shortcut handler:
// - Escape: Deselect active element
// - Delete / Backspace: Remove selected element (if not root)
// - Cmd/Ctrl + D: Duplicate selected element
// - Cmd/Ctrl + Z / Shift+Z: Undo / Redo
// - Arrow Keys: Nudge selected element (1px, or 10px with Shift)
// - Guard against firing when user is typing inside text inputs
// ============================================================

"use client";

import { useEffect } from "react";
import { useEditorStore } from "@/store/editor";
import { useProjectStore } from "@/store/project";
import { isPageRoot } from "@/store/project/utils";
import { isDefaultBreakpoint as computeIsDefaultBreakpoint, resolveActiveBreakpoint } from "@/store/project/selectors";
import type { ElementNode } from "@/types/project";

export function useEditorKeyboardShortcuts() {
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId);
  const activeBreakpointId = useEditorStore((state) => state.activeBreakpointId);
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId);
  const setZoom = useEditorStore((state) => state.setZoom);
  const resetZoom = useEditorStore((state) => state.resetZoom);
  const setCanvasTool = useEditorStore((state) => state.setCanvasTool);
  const setIsSpacePanning = useEditorStore((state) => state.setIsSpacePanning);
  const setIsHelpModalOpen = useEditorStore((state) => state.setIsHelpModalOpen);

  // elements/pages/breakpoints/canUndo/canRedo are only ever read inside
  // handleKeyDown below, never for render — subscribing to them here would
  // just re-register the window listener (and re-render whatever component
  // calls this hook) on every unrelated document edit. Read fresh via
  // getState() at the moment a shortcut actually fires instead.
  const removeNode = useProjectStore((state) => state.removeNode);
  const duplicateNode = useProjectStore((state) => state.duplicateNode);
  const updateNodeStyle = useProjectStore((state) => state.updateNodeStyle);
  const updateBreakpointStyle = useProjectStore((state) => state.updateBreakpointStyle);
  const undo = useProjectStore((state) => state.undo);
  const redo = useProjectStore((state) => state.redo);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Guard against firing shortcuts when typing in inputs/textareas
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT" ||
          target.isContentEditable);

      if (isInput) {
        if (e.key === "Escape") {
          target.blur();
        }
        return;
      }

      const isMac =
        typeof navigator !== "undefined" &&
        /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isCmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      // 2. Zoom Controls with Cmd/Ctrl (Prevent Browser Default Zoom)
      if (isCmdOrCtrl && (e.key === "=" || e.key === "+" || e.code === "Equal" || e.code === "NumpadAdd")) {
        e.preventDefault();
        e.stopPropagation();
        setZoom((prev) => Math.min(2.0, Math.round((prev + 0.1) * 100) / 100));
        return;
      }

      if (isCmdOrCtrl && (e.key === "-" || e.key === "_" || e.code === "Minus" || e.code === "NumpadSubtract")) {
        e.preventDefault();
        e.stopPropagation();
        setZoom((prev) => Math.max(0.25, Math.round((prev - 0.1) * 100) / 100));
        return;
      }

      if (isCmdOrCtrl && (e.key === "0" || e.code === "Digit0" || e.code === "Numpad0")) {
        e.preventDefault();
        e.stopPropagation();
        resetZoom();
        return;
      }

      // 3. Undo / Redo (Cmd/Ctrl + Z, Cmd/Ctrl + Shift + Z / Cmd/Ctrl + Y)
      if (isCmdOrCtrl && e.key.toLowerCase() === "z") {
        e.preventDefault();
        const { past, future } = useProjectStore.getState();
        if (e.shiftKey) {
          if (future.length > 0) redo();
        } else {
          if (past.length > 0) undo();
        }
        return;
      }

      if (isCmdOrCtrl && e.key.toLowerCase() === "y") {
        e.preventDefault();
        if (useProjectStore.getState().future.length > 0) redo();
        return;
      }

      // 4. Help / Shortcuts Modal (? or Cmd/Ctrl + /)
      if (e.key === "?" || (isCmdOrCtrl && e.key === "/")) {
        e.preventDefault();
        setIsHelpModalOpen(true);
        return;
      }

      // 5. Tool Selection: V (Select), H (Hand / Pan)
      if (!isCmdOrCtrl && !e.altKey && !e.shiftKey) {
        if (e.key.toLowerCase() === "v") {
          e.preventDefault();
          setCanvasTool("select");
          return;
        }
        if (e.key.toLowerCase() === "h") {
          e.preventDefault();
          setCanvasTool("pan");
          return;
        }
      }

      // 6. Spacebar temporary pan
      if (e.code === "Space" && !e.repeat) {
        e.preventDefault();
        setIsSpacePanning(true);
        return;
      }

      // 7. Deselect (Escape)
      if (e.key === "Escape") {
        if (selectedNodeId) {
          e.preventDefault();
          setSelectedNodeId(null);
        }
        return;
      }

      // 8. Duplicate (Cmd/Ctrl + D)
      if (isCmdOrCtrl && e.key.toLowerCase() === "d") {
        if (selectedNodeId && !isPageRoot(useProjectStore.getState().project.pages, selectedNodeId)) {
          e.preventDefault();
          const newId = duplicateNode(selectedNodeId);
          if (newId) {
            setSelectedNodeId(newId);
          }
        }
        return;
      }

      // 9. Delete (Delete or Backspace)
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNodeId && !isPageRoot(useProjectStore.getState().project.pages, selectedNodeId)) {
          e.preventDefault();
          removeNode(selectedNodeId);
          setSelectedNodeId(null);
        }
        return;
      }

      // 10. Arrow Key Nudge (1px, or 10px with Shift)
      const { elements, pages, breakpoints } = useProjectStore.getState().project;
      if (
        ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key) &&
        selectedNodeId &&
        !isPageRoot(pages, selectedNodeId)
      ) {
        e.preventDefault();
        const node = elements[selectedNodeId] as ElementNode | undefined;
        if (!node || node.type !== "element") return;

        const activeBreakpoint = resolveActiveBreakpoint(breakpoints, activeBreakpointId);
        const isDefaultBreakpoint = computeIsDefaultBreakpoint(activeBreakpoint);

        const bpOverrides = (node.breakpointStyles?.[activeBreakpointId] || {}) as Partial<ElementNode["style"]>;
        const style = { ...(node.style || {}), ...bpOverrides };
        const isAbsolute = style.position === "absolute";

        const delta = e.shiftKey ? 10 : 1;

        const applyStylePatch = (patch: Partial<ElementNode["style"]>) => {
          if (isDefaultBreakpoint) {
            updateNodeStyle(selectedNodeId, patch);
          } else {
            updateBreakpointStyle(selectedNodeId, activeBreakpointId, patch);
          }
        };

        if (isAbsolute) {
          let left = parseInt(String(style.left || "0"), 10) || 0;
          let top = parseInt(String(style.top || "0"), 10) || 0;

          if (e.key === "ArrowLeft") left -= delta;
          if (e.key === "ArrowRight") left += delta;
          if (e.key === "ArrowUp") top -= delta;
          if (e.key === "ArrowDown") top += delta;

          applyStylePatch({
            left: `${left}px`,
            top: `${top}px`,
          });
        } else {
          // Flow element: nudge margin
          let marginLeft = parseInt(String(style.marginLeft || "0"), 10) || 0;
          let marginTop = parseInt(String(style.marginTop || "0"), 10) || 0;

          if (e.key === "ArrowLeft") marginLeft -= delta;
          if (e.key === "ArrowRight") marginLeft += delta;
          if (e.key === "ArrowUp") marginTop -= delta;
          if (e.key === "ArrowDown") marginTop += delta;

          applyStylePatch({
            marginLeft: `${marginLeft}px`,
            marginTop: `${marginTop}px`,
          });
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        setIsSpacePanning(false);
      }
    };

    // Prevent default browser zoom on Ctrl/Cmd + Wheel
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.05 : 0.05;
        setZoom((prev) => Math.min(2.0, Math.max(0.25, Math.round((prev + delta) * 100) / 100)));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [
    selectedNodeId,
    activeBreakpointId,
    setSelectedNodeId,
    setZoom,
    resetZoom,
    setCanvasTool,
    setIsSpacePanning,
    setIsHelpModalOpen,
    removeNode,
    duplicateNode,
    updateNodeStyle,
    updateBreakpointStyle,
    undo,
    redo,
  ]);
}
