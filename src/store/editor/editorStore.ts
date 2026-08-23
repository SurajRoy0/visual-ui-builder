// ============================================================
// store/editor/editorStore.ts
//
// Transient UI and session state. Never persisted as part of
// the Project document model.
// ============================================================

import { create } from "zustand";
import type { EditorState, ID } from "@/types/project";

export interface EditorStoreActions {
    setSelectedNodeId: (nodeId: ID | null) => void;
    setInspectedComponent: (instanceId: ID | null, internalNodeId?: ID | null) => void;
    setActivePageId: (pageId: ID) => void;
    setActiveBreakpointId: (breakpointId: ID) => void;
    setActiveViewportId: (viewportId: ID) => void;
    setViewportWidth: (width: number | null) => void;
    setZoom: (zoom: number | ((prev: number) => number)) => void;
    resetZoom: () => void;
    setGrid: (grid: Partial<EditorState["grid"]>) => void;
    setMode: (mode: EditorState["mode"]) => void;
    setActiveTimelineId: (timelineId: ID | null) => void;
    setPlayheadSeconds: (seconds: number) => void;
    resetEditorState: () => void;
}

export type EditorStore = EditorState & {
    viewportWidth: number | null;
} & EditorStoreActions;

export const initialEditorState: EditorState & { viewportWidth: number | null } = {
    selectedNodeId: null,
    inspectedComponentInstanceId: null,
    inspectedComponentNodeId: null,
    activePageId: "page-home",
    activeBreakpointId: "bp-desktop",
    activeViewportId: "vp-desktop",
    viewportWidth: null,
    zoom: 1,
    grid: {
        visible: false,
        snap: false,
        size: 8,
    },
    mode: "edit",
    activeTimelineId: null,
    playheadSeconds: 0,
};

export const useEditorStore = create<EditorStore>()((set) => ({
    ...initialEditorState,

    setSelectedNodeId: (nodeId) =>
        set({
            selectedNodeId: nodeId,
            inspectedComponentInstanceId: null,
            inspectedComponentNodeId: null,
        }),

    setInspectedComponent: (instanceId, internalNodeId = null) =>
        set({
            inspectedComponentInstanceId: instanceId,
            inspectedComponentNodeId: internalNodeId,
            selectedNodeId: instanceId,
        }),

    setActivePageId: (pageId) =>
        set({
            activePageId: pageId,
            selectedNodeId: null,
        }),

    setActiveBreakpointId: (breakpointId) =>
        set({ activeBreakpointId: breakpointId }),

    setActiveViewportId: (viewportId) =>
        set({ activeViewportId: viewportId, viewportWidth: null }),

    setViewportWidth: (width) =>
        set({ viewportWidth: width }),

    setZoom: (zoomOrUpdater) =>
        set((state) => {
            const nextZoom =
                typeof zoomOrUpdater === "function"
                    ? zoomOrUpdater(state.zoom)
                    : zoomOrUpdater;
            return { zoom: Math.min(4, Math.max(0.1, Number(nextZoom.toFixed(2)))) };
        }),

    resetZoom: () => set({ zoom: 1 }),

    setGrid: (gridPatch) =>
        set((state) => ({
            grid: { ...state.grid, ...gridPatch },
        })),

    setMode: (mode) => set({ mode }),

    setActiveTimelineId: (timelineId) =>
        set({
            activeTimelineId: timelineId,
            playheadSeconds: 0,
        }),

    setPlayheadSeconds: (seconds) =>
        set({ playheadSeconds: Math.max(0, seconds) }),

    resetEditorState: () => set(initialEditorState),
}));
