// ============================================================
// store/project/stylesSlice.ts
//
// Manages project-wide design tokens (project.styles):
// Colors, Typography, Spacing, Radii, Shadows, Fonts, Variables.
// ============================================================

import type { StateCreator } from "zustand";
import type { CSSValue, FontToken, TypographyToken } from "@/types/project";
import type { ProjectStoreState } from "./storeTypes";
import { DEFAULT_PROJECT_STYLES } from "./createInitialProject";

export interface StylesSlice {
    setColorToken: (name: string, value: string) => void;
    removeColorToken: (name: string) => void;

    setTypographyToken: (name: string, token: TypographyToken) => void;
    removeTypographyToken: (name: string) => void;

    setSpacingToken: (name: string, value: CSSValue) => void;
    removeSpacingToken: (name: string) => void;

    setRadiusToken: (name: string, value: CSSValue) => void;
    removeRadiusToken: (name: string) => void;

    setShadowToken: (name: string, value: string) => void;
    removeShadowToken: (name: string) => void;

    setFontToken: (name: string, token: FontToken) => void;
    removeFontToken: (name: string) => void;

    setVariableToken: (name: string, value: CSSValue) => void;
    removeVariableToken: (name: string) => void;

    loadDefaultTokenPresets: () => void;
}

export const createStylesSlice: StateCreator<
    ProjectStoreState,
    [],
    [],
    StylesSlice
> = (_set, get) => ({
    // ==========================================================
    // Colors
    // ==========================================================

    setColorToken: (name, value) => {
        get().mutate((draft) => {
            if (!draft.styles) draft.styles = JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES));
            if (!draft.styles.colors) draft.styles.colors = {};
            draft.styles.colors[name] = value;
        });
    },

    removeColorToken: (name) => {
        get().mutate((draft) => {
            if (draft.styles?.colors) {
                delete draft.styles.colors[name];
            }
        });
    },

    // ==========================================================
    // Typography
    // ==========================================================

    setTypographyToken: (name, token) => {
        get().mutate((draft) => {
            if (!draft.styles) draft.styles = JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES));
            if (!draft.styles.typography) draft.styles.typography = {};
            draft.styles.typography[name] = token;
        });
    },

    removeTypographyToken: (name) => {
        get().mutate((draft) => {
            if (draft.styles?.typography) {
                delete draft.styles.typography[name];
            }
        });
    },

    // ==========================================================
    // Spacing
    // ==========================================================

    setSpacingToken: (name, value) => {
        get().mutate((draft) => {
            if (!draft.styles) draft.styles = JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES));
            if (!draft.styles.spacing) draft.styles.spacing = {};
            draft.styles.spacing[name] = value;
        });
    },

    removeSpacingToken: (name) => {
        get().mutate((draft) => {
            if (draft.styles?.spacing) {
                delete draft.styles.spacing[name];
            }
        });
    },

    // ==========================================================
    // Radii
    // ==========================================================

    setRadiusToken: (name, value) => {
        get().mutate((draft) => {
            if (!draft.styles) draft.styles = JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES));
            if (!draft.styles.radii) draft.styles.radii = {};
            draft.styles.radii[name] = value;
        });
    },

    removeRadiusToken: (name) => {
        get().mutate((draft) => {
            if (draft.styles?.radii) {
                delete draft.styles.radii[name];
            }
        });
    },

    // ==========================================================
    // Shadows
    // ==========================================================

    setShadowToken: (name, value) => {
        get().mutate((draft) => {
            if (!draft.styles) draft.styles = JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES));
            if (!draft.styles.shadows) draft.styles.shadows = {};
            draft.styles.shadows[name] = value;
        });
    },

    removeShadowToken: (name) => {
        get().mutate((draft) => {
            if (draft.styles?.shadows) {
                delete draft.styles.shadows[name];
            }
        });
    },

    // ==========================================================
    // Fonts
    // ==========================================================

    setFontToken: (name, token) => {
        get().mutate((draft) => {
            if (!draft.styles) draft.styles = JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES));
            if (!draft.styles.fonts) draft.styles.fonts = {};
            draft.styles.fonts[name] = token;
        });
    },

    removeFontToken: (name) => {
        get().mutate((draft) => {
            if (draft.styles?.fonts) {
                delete draft.styles.fonts[name];
            }
        });
    },

    // ==========================================================
    // Variables
    // ==========================================================

    setVariableToken: (name, value) => {
        get().mutate((draft) => {
            if (!draft.styles) draft.styles = JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES));
            if (!draft.styles.variables) draft.styles.variables = {};
            draft.styles.variables[name] = value;
        });
    },

    removeVariableToken: (name) => {
        get().mutate((draft) => {
            if (draft.styles?.variables) {
                delete draft.styles.variables[name];
            }
        });
    },

    // ==========================================================
    // Preset Loader
    // ==========================================================

    loadDefaultTokenPresets: () => {
        get().mutate((draft) => {
            draft.styles = JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES));
        });
    },
});
