// ============================================================
// store/project/projectStore.ts
// ============================================================

import { create } from "zustand";

import {
    createDocumentSlice,
} from "./documentSlice";

import {
    createElementsSlice,
} from "./elementsSlice";

import {
    createAnimationSlice,
} from "./animationSlice";

import {
    createActionsSlice,
} from "./actionsSlice";

import {
    createViewportSlice,
} from "./viewportSlice";

import {
    createStylesSlice,
} from "./stylesSlice";

import type { ProjectStoreState } from "./storeTypes";

export const useProjectStore =
    create<ProjectStoreState>()(
        (...args) => ({
            ...createDocumentSlice(...args),
            ...createElementsSlice(...args),
            ...createAnimationSlice(...args),
            ...createActionsSlice(...args),
            ...createViewportSlice(...args),
            ...createStylesSlice(...args),
        })
    );