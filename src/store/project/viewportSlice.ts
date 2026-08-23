// ============================================================
// store/project/viewportSlice.ts
//
// Viewport definitions inside Project (persisted).
// Note: activeViewportId belongs to transient EditorState,
// not this persisted Project slice.
// ============================================================

import type { StateCreator } from "zustand";

import type { Breakpoint, ID, Viewport } from "@/types/project";
import type { ProjectStoreState } from "./storeTypes";
import { makeId } from "./utils";

export interface ViewportSlice {
    createViewport: (params: {
        name: string;
        width: number;
        height: number;
        isDefault?: boolean;
    }) => ID;

    updateViewport: (
        viewportId: ID,
        patch: Partial<Omit<Viewport, "id">>
    ) => void;

    removeViewport: (
        viewportId: ID
    ) => boolean;

    setDefaultViewport: (
        viewportId: ID
    ) => void;

    createBreakpoint: (params: {
        name?: string;
        minWidth: number;
        isDefault?: boolean;
    }) => ID;

    updateBreakpoint: (
        breakpointId: ID,
        patch: Partial<Omit<Breakpoint, "id">>
    ) => void;

    removeBreakpoint: (
        breakpointId: ID
    ) => boolean;
}

/**
 * Ensures that exactly one viewport in the array has isDefault === true.
 * If preferredDefaultId is provided and exists, that viewport is chosen as default.
 * Otherwise, the first viewport currently marked default (or index 0 if none) is chosen.
 */
function ensureSingleDefaultViewport(
    viewports: Viewport[],
    preferredDefaultId?: ID
): void {
    if (viewports.length === 0) {
        return;
    }

    let defaultIndex = -1;

    if (preferredDefaultId !== undefined) {
        defaultIndex = viewports.findIndex(
            (vp) => vp.id === preferredDefaultId
        );
    }

    if (defaultIndex === -1) {
        defaultIndex = viewports.findIndex((vp) => vp.isDefault);
    }

    const targetIndex = defaultIndex !== -1 ? defaultIndex : 0;

    for (let i = 0; i < viewports.length; i++) {
        viewports[i].isDefault = i === targetIndex;
    }
}

export const createViewportSlice: StateCreator<
    ProjectStoreState,
    [],
    [],
    ViewportSlice
> = (_set, get) => ({
    // ==========================================================
    // Create viewport
    // ==========================================================

    createViewport: ({
        name,
        width,
        height,
        isDefault = false,
    }) => {
        const id = makeId("vp");

        get().mutate((draft) => {
            draft.viewports.push({
                id,
                name,
                width: Math.max(1, Math.round(width)),
                height: Math.max(1, Math.round(height)),
                isDefault,
            });

            if (isDefault) {
                ensureSingleDefaultViewport(draft.viewports, id);
            } else {
                ensureSingleDefaultViewport(draft.viewports);
            }
        });

        return id;
    },

    // ==========================================================
    // Update viewport
    // ==========================================================

    updateViewport: (
        viewportId,
        patch
    ) => {
        get().mutate((draft) => {
            const viewport = draft.viewports.find(
                (vp) => vp.id === viewportId
            );

            if (!viewport) {
                return;
            }

            if (patch.name !== undefined) {
                viewport.name = patch.name;
            }

            if (patch.width !== undefined) {
                viewport.width = Math.max(1, Math.round(patch.width));
            }

            if (patch.height !== undefined) {
                viewport.height = Math.max(1, Math.round(patch.height));
            }

            if (patch.isDefault !== undefined) {
                if (patch.isDefault) {
                    ensureSingleDefaultViewport(draft.viewports, viewportId);
                } else {
                    // Attempting to unset default (isDefault: false)
                    // Disallow 0 default viewports - ensure exactly one remains default
                    viewport.isDefault = false;
                    ensureSingleDefaultViewport(draft.viewports);
                }
            } else {
                ensureSingleDefaultViewport(draft.viewports);
            }
        });
    },

    // ==========================================================
    // Remove viewport
    // ==========================================================

    removeViewport: (
        viewportId
    ) => {
        const state = get();

        // Prevent removing if it's the last remaining viewport
        if (state.project.viewports.length <= 1) {
            return false;
        }

        const exists = state.project.viewports.some(
            (vp) => vp.id === viewportId
        );

        if (!exists) {
            return false;
        }

        let removed = false;

        get().mutate((draft) => {
            if (draft.viewports.length <= 1) {
                return;
            }

            const index = draft.viewports.findIndex(
                (vp) => vp.id === viewportId
            );

            if (index === -1) {
                return;
            }

            draft.viewports.splice(index, 1);
            ensureSingleDefaultViewport(draft.viewports);
            removed = true;
        });

        return removed;
    },

    // ==========================================================
    // Set default viewport
    // ==========================================================

    setDefaultViewport: (
        viewportId
    ) => {
        get().mutate((draft) => {
            const exists = draft.viewports.some(
                (vp) => vp.id === viewportId
            );

            if (exists) {
                ensureSingleDefaultViewport(draft.viewports, viewportId);
            } else {
                // If requested viewport does not exist: preserve existing valid default
                // or pick first if none exists
                ensureSingleDefaultViewport(draft.viewports);
            }
        });
    },

    // ==========================================================
    // Create breakpoint
    // ==========================================================

    createBreakpoint: ({
        name,
        minWidth,
        isDefault = false,
    }) => {
        const id = makeId("bp");
        const trimmedName = name?.trim() || "Custom";
        const normalizedMinWidth = Math.max(0, Math.round(minWidth));

        get().mutate((draft) => {
            draft.breakpoints.push({
                id,
                name: trimmedName,
                minWidth: normalizedMinWidth,
                isDefault,
            });

            // Keep breakpoints sorted by minWidth ascending
            draft.breakpoints.sort((a, b) => a.minWidth - b.minWidth);
        });

        return id;
    },

    // ==========================================================
    // Update breakpoint
    // ==========================================================

    updateBreakpoint: (
        breakpointId,
        patch
    ) => {
        get().mutate((draft) => {
            const bp = draft.breakpoints.find((b) => b.id === breakpointId);
            if (!bp) return;

            if (patch.name !== undefined) {
                bp.name = patch.name.trim() || "Custom";
            }

            if (patch.minWidth !== undefined) {
                bp.minWidth = Math.max(0, Math.round(patch.minWidth));
                draft.breakpoints.sort((a, b) => a.minWidth - b.minWidth);
            }

            if (patch.isDefault !== undefined) {
                bp.isDefault = patch.isDefault;
            }
        });
    },

    // ==========================================================
    // Remove breakpoint
    // ==========================================================

    removeBreakpoint: (
        breakpointId
    ) => {
        const state = get();
        if (state.project.breakpoints.length <= 1) {
            return false;
        }

        let removed = false;
        get().mutate((draft) => {
            if (draft.breakpoints.length <= 1) return;

            const index = draft.breakpoints.findIndex((b) => b.id === breakpointId);
            if (index !== -1) {
                draft.breakpoints.splice(index, 1);
                removed = true;
            }
        });

        return removed;
    },
});
