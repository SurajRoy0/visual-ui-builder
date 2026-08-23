// ============================================================
// store/project/documentSlice.ts
//
// Owns the persistent Project and the global undo/redo stack.
//
// Every project mutation goes through `mutate()`.
//
// This means:
//
// element edit
// timeline edit
// action edit
// component edit
// style edit
//
// all share ONE history.
// ============================================================

import type { StateCreator } from "zustand";

import {
    applyPatches,
    enablePatches,
    produceWithPatches,
    type Patch,
} from "immer";

enablePatches();

import type { Project } from "@/types/project";
import type { ProjectStoreState } from "./storeTypes";
import { createInitialProject } from "./createInitialProject";

const HISTORY_LIMIT = 200;

export interface HistoryEntry {
    patches: Patch[];
    inversePatches: Patch[];
}

export interface DocumentSlice {
    project: Project;

    past: HistoryEntry[];

    future: HistoryEntry[];

    loadProject: (project: Project) => void;

    mutate: (
        recipe: (draft: Project) => void
    ) => void;

    batch: (
        fn: () => void
    ) => void;

    undo: () => void;

    redo: () => void;

    canUndo: () => boolean;

    canRedo: () => boolean;
}

export const createDocumentSlice: StateCreator<
    ProjectStoreState,
    [],
    [],
    DocumentSlice
> = (set, get) => {
    /**
     * Batch state belongs to this store instance.
     */
    let batchDepth = 0;

    let batchedPatches: Patch[] = [];

    let batchedInversePatches: Patch[] = [];

    let batchStartProject: Project | null = null;

    let batchFailed = false;

    return {
        project: createInitialProject(),

        past: [],

        future: [],

        // ========================================================
        // Load Project
        // ========================================================

        loadProject: (project) => {
            batchDepth = 0;
            batchedPatches = [];
            batchedInversePatches = [];
            batchStartProject = null;
            batchFailed = false;

            set({
                project,
                past: [],
                future: [],
            });
        },

        // ========================================================
        // Mutate
        // ========================================================

        mutate: (recipe) => {
            const state = get();

            const [
                nextProject,
                patches,
                inversePatches,
            ] = produceWithPatches(
                state.project,
                recipe
            );

            /**
             * Nothing changed.
             */
            if (patches.length === 0) {
                return;
            }

            /**
             * Inside a batch:
             * update the document but postpone history.
             */
            if (batchDepth > 0) {
                batchedPatches.push(...patches);

                batchedInversePatches = [
                    ...inversePatches,
                    ...batchedInversePatches,
                ];

                set({
                    project: nextProject,
                });

                return;
            }

            /**
             * Normal mutation.
             */
            set({
                project: nextProject,

                past: [
                    ...state.past.slice(
                        -HISTORY_LIMIT + 1
                    ),

                    {
                        patches,
                        inversePatches,
                    },
                ],

                future: [],
            });
        },

        // ========================================================
        // Batch
        // ========================================================

        batch: (fn) => {
            const isOuterBatch =
                batchDepth === 0;

            if (isOuterBatch) {
                batchStartProject =
                    get().project;

                batchedPatches = [];

                batchedInversePatches = [];

                batchFailed = false;
            }

            batchDepth += 1;

            try {
                fn();
            } catch (error) {
                batchFailed = true;
                throw error;
            } finally {
                batchDepth -= 1;

                if (batchDepth === 0) {
                    const state = get();

                    /**
                     * Failed batch:
                     * restore the document to its
                     * original state.
                     */
                    if (batchFailed) {
                        if (batchStartProject) {
                            set({
                                project:
                                    batchStartProject,
                            });
                        }
                    }

                    /**
                     * Successful batch:
                     * create exactly ONE history entry.
                     */
                    else if (
                        batchedPatches.length > 0
                    ) {
                        set({
                            past: [
                                ...state.past.slice(
                                    -HISTORY_LIMIT + 1
                                ),

                                {
                                    patches:
                                        batchedPatches,

                                    inversePatches:
                                        batchedInversePatches,
                                },
                            ],

                            future: [],
                        });
                    }

                    batchedPatches = [];

                    batchedInversePatches = [];

                    batchStartProject = null;

                    batchFailed = false;
                }
            }
        },

        // ========================================================
        // Undo
        // ========================================================

        undo: () => {
            const state = get();

            const entry =
                state.past[
                state.past.length - 1
                ];

            if (!entry) {
                return;
            }

            set({
                project: applyPatches(
                    state.project,
                    entry.inversePatches
                ),

                past: state.past.slice(
                    0,
                    -1
                ),

                future: [
                    entry,
                    ...state.future,
                ],
            });
        },

        // ========================================================
        // Redo
        // ========================================================

        redo: () => {
            const state = get();

            const entry =
                state.future[0];

            if (!entry) {
                return;
            }

            set({
                project: applyPatches(
                    state.project,
                    entry.patches
                ),

                past: [
                    ...state.past,
                    entry,
                ],

                future:
                    state.future.slice(1),
            });
        },

        canUndo: () => {
            return get().past.length > 0;
        },

        canRedo: () => {
            return get().future.length > 0;
        },
    };
};