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

export const DEFAULT_PROJECT_STYLES = {
    colors: {
        primary: "#3b82f6",
        secondary: "#64748b",
        accent: "#ec4899",
        background: "#09090b",
        foreground: "#f8fafc",
        card: "#18181b",
        muted: "#71717a",
        border: "#27272a",
        success: "#10b981",
        warning: "#f59e0b",
        destructive: "#ef4444",
    },
    typography: {
        heading1: {
            fontFamily: "Inter, sans-serif",
            fontSize: "36px",
            fontWeight: "700",
            lineHeight: "1.2",
            letterSpacing: "-0.02em",
        },
        heading2: {
            fontFamily: "Inter, sans-serif",
            fontSize: "28px",
            fontWeight: "600",
            lineHeight: "1.3",
            letterSpacing: "-0.01em",
        },
        heading3: {
            fontFamily: "Inter, sans-serif",
            fontSize: "22px",
            fontWeight: "600",
            lineHeight: "1.35",
        },
        body: {
            fontFamily: "Inter, sans-serif",
            fontSize: "16px",
            fontWeight: "400",
            lineHeight: "1.5",
        },
        small: {
            fontFamily: "Inter, sans-serif",
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "1.4",
        },
        caption: {
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            fontWeight: "500",
            lineHeight: "1.3",
        },
    },
    spacing: {
        none: "0px",
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        "2xl": "48px",
        "3xl": "64px",
    },
    radii: {
        none: "0px",
        sm: "4px",
        md: "8px",
        lg: "12px",
        xl: "16px",
        full: "9999px",
    },
    shadows: {
        none: "none",
        sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    },
    fonts: {
        sans: {
            family: "Inter",
            fallback: "sans-serif",
            weights: [400, 500, 600, 700],
        },
    },
    variables: {},
};

export function createInitialProject(options: CreateProjectOptions = {}): Project {
    const now = Date.now();
    const rootId: ID = "root";
    const pageId: ID = "page-home";

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

        styles: JSON.parse(JSON.stringify(DEFAULT_PROJECT_STYLES)),

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
                id: "bp-desktop",
                name: "Desktop",
                minWidth: 1200,
                isDefault: true,
            },
            {
                id: "bp-tablet",
                name: "Tablet",
                minWidth: 768,
            },
            {
                id: "bp-mobile",
                name: "Mobile",
                minWidth: 480,
            },
        ],

        viewports: [
            {
                id: "vp-desktop",
                name: "Desktop",
                width: 1440,
                height: 900,
                isDefault: true,
            },
            {
                id: "vp-tablet",
                name: "Tablet",
                width: 768,
                height: 1024,
            },
            {
                id: "vp-mobile",
                name: "Mobile",
                width: 390,
                height: 844,
            },
        ],
    };
}