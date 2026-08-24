// ============================================================
// store/project/storeTypes.ts
// ============================================================

import type { DocumentSlice } from "./documentSlice";
import type { ElementsSlice } from "./elementsSlice";
import type { AnimationSlice } from "./animationSlice";
import type { ActionsSlice } from "./actionsSlice";
import type { ViewportSlice } from "./viewportSlice";
import type { StylesSlice } from "./stylesSlice";

/**
 * Complete Zustand store.
 *
 * This is the shared type used by every slice so slices can
 * safely access:
 *
 * get().project
 * get().mutate()
 * get().elements...
 * get().createTimeline()
 * get().createAction()
 * get().createViewport()
 * get().setColorToken()
 *
 * without circular runtime imports.
 */
export type ProjectStoreState =
    DocumentSlice &
    ElementsSlice &
    AnimationSlice &
    ActionsSlice &
    ViewportSlice &
    StylesSlice;