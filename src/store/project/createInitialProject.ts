// ============================================================
// store/project/createInitialProject.ts
// ============================================================

import type {
    ElementNode,
    ID,
    Project,
} from "@/types/project";

export const SCHEMA_VERSION = "1.0.0";

export function createInitialProject(): Project {
    const rootId: ID = "root";
    const pageId: ID = "page-home";

    const breakpointId: ID = "bp-base";
    const viewportId: ID = "vp-desktop";

    const rootNode: ElementNode = {
        id: rootId,
        type: "element",
        name: "Page Root",

        parentId: null,
        children: [],

        tag: "div",

        attributes: {},

        style: {
            display: "flex",
            flexDirection: "column",
        },

        breakpointStyles: {},
    };

    return {
        id: "project-1",

        name: "Untitled Project",

        version: SCHEMA_VERSION,

        styles: {
            colors: {},
            typography: {},
            spacing: {},
            radii: {},
            shadows: {},
            fonts: {},
            variables: {},
        },

        elements: {
            [rootId]: rootNode,
        },

        pages: {
            [pageId]: {
                id: pageId,
                name: "Home",
                path: "/",
                rootElementId: rootId,
            },
        },

        components: {},

        componentLibraries: {},

        gsapTimelines: {},

        actions: {},

        assets: {},

        breakpoints: [
            {
                id: breakpointId,
                name: "Base",
                minWidth: 0,
                isDefault: true,
            },
        ],

        viewports: [
            {
                id: viewportId,
                name: "Desktop",
                width: 1440,
                height: 900,
                isDefault: true,
            },
        ],
    };
}