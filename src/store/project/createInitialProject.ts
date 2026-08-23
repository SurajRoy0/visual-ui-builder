// ============================================================
// store/project/createInitialProject.ts
// ============================================================

import type {
    ElementNode,
    ID,
    Project,
} from "@/types/project";
import { makeId } from "./utils";

export const SCHEMA_VERSION = "1.0.0";

export interface CreateProjectOptions {
    id?: ID;
    name?: string;
    description?: string;
}

export function createInitialProject(options: CreateProjectOptions = {}): Project {
    const now = Date.now();
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
        id: options.id || makeId("proj"),

        name: options.name || "Untitled Project",

        description: options.description || "",

        createdAt: now,

        updatedAt: now,

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