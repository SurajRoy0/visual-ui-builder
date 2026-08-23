// store/editor-store.ts

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { nanoid } from "nanoid";

import type {
  Breakpoint,
  BoxProps,
  ComponentDefinition,
  ComponentInstanceNode,
  ElementNode,
  ElementProps,
  ElementStyle,
  PageNode,
  Project,
  ProjectStyles,
  TextProps,
} from "@/types/project";


// ============================================================
// Types
// ============================================================

export type EditorPanel =
  | "elements"
  | "layers"
  | "components";

export type EditorMode = "edit" | "preview";


// ============================================================
// Helpers
// ============================================================

const createId = (prefix: string) => {
  return `${prefix}_${nanoid(10)}`;
};


// ============================================================
// Initial Project
// ============================================================

const createInitialProject = (): Project => {
  const homeRootId = "home-root";
  const aboutRootId = "about-root";

  const homeBoxId = "home-box";
  const homeTextId = "home-text";

  const aboutBoxId = "about-box";
  const aboutTextId = "about-text";

  return {
    id: "project-1",

    name: "Untitled Website",

    version: "1.0.0",

    editorState: {
      selectedNodeId: "home-box",
      activePageId: "home",
      activeBreakpointId: "desktop",
      zoom: 1,
      grid: {
        visible: false,
        snap: true,
        size: 8,
      },
      mode: "edit",
    },

    // --------------------------------------------------------
    // Project Design System
    // --------------------------------------------------------

    styles: {
      colors: {
        primary: "#6366f1",
        secondary: "#8b5cf6",
        background: "#ffffff",
        foreground: "#111827",
        muted: "#6b7280",
      },

      typography: {
        body: {
          fontFamily: "Inter, sans-serif",
          fontSize: "16px",
          fontWeight: 400,
          lineHeight: 1.5,
        },

        heading: {
          fontFamily: "Inter, sans-serif",
          fontWeight: 700,
          lineHeight: 1.2,
        },
      },

      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "48px",
        "2xl": "80px",
      },

      radii: {
        sm: "4px",
        md: "8px",
        lg: "16px",
        full: "9999px",
      },

      shadows: {
        sm: "0 1px 2px rgba(0, 0, 0, 0.05)",
        md: "0 4px 12px rgba(0, 0, 0, 0.1)",
      },

      fonts: {
        inter: {
          family: "Inter",
          fallback: "sans-serif",
        },
      },
    },

    // --------------------------------------------------------
    // Pages
    // --------------------------------------------------------

    pages: {
      home: {
        id: "home",
        name: "Home",
        path: "/",
        rootElementId: homeRootId,
      },

      about: {
        id: "about",
        name: "About",
        path: "/about",
        rootElementId: aboutRootId,
      },
    },

    // --------------------------------------------------------
    // Page Elements
    // --------------------------------------------------------

    elements: {
      // HOME ROOT
      [homeRootId]: {
        id: homeRootId,
        type: "box",
        name: "Home",
        parentId: null,
        children: [homeBoxId],

        style: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "100vh",
          padding: "64px 24px",
          background: "#ffffff",
        },

        breakpointStyles: {},

        props: {},
      },

      // HOME BOX
      [homeBoxId]: {
        id: homeBoxId,
        type: "box",
        name: "Hero Container",
        parentId: homeRootId,
        children: [homeTextId],

        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: "500px",
          padding: "48px",
          background: "#f5f5f5",
          borderRadius: "16px",
        },

        breakpointStyles: {},

        props: {},
      },

      // HOME TEXT
      [homeTextId]: {
        id: homeTextId,
        type: "text",
        name: "Hero Heading",
        parentId: homeBoxId,
        children: [],

        style: {
          fontSize: "48px",
          fontWeight: 700,
          lineHeight: 1.2,
          textAlign: "center",
          color: "#111827",
        },

        breakpointStyles: {},

        props: {
          content: "Welcome to my website",
          tag: "h1",
        },
      },

      // ABOUT ROOT
      [aboutRootId]: {
        id: aboutRootId,
        type: "box",
        name: "About",
        parentId: null,
        children: [aboutBoxId],

        style: {
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: "100vh",
          padding: "64px 24px",
          background: "#ffffff",
        },

        breakpointStyles: {},

        props: {},
      },

      // ABOUT BOX
      [aboutBoxId]: {
        id: aboutBoxId,
        type: "box",
        name: "About Container",
        parentId: aboutRootId,
        children: [aboutTextId],

        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          minHeight: "400px",
          padding: "48px",
          background: "#f5f5f5",
          borderRadius: "16px",
        },

        breakpointStyles: {},

        props: {},
      },

      // ABOUT TEXT
      [aboutTextId]: {
        id: aboutTextId,
        type: "text",
        name: "About Heading",
        parentId: aboutBoxId,
        children: [],

        style: {
          fontSize: "48px",
          fontWeight: 700,
          lineHeight: 1.2,
          textAlign: "center",
          color: "#111827",
        },

        breakpointStyles: {},

        props: {
          content: "About Us",
          tag: "h1",
        },
      },
    },

    // --------------------------------------------------------
    // Components
    // --------------------------------------------------------

    components: {},

    // --------------------------------------------------------
    // Breakpoints
    // --------------------------------------------------------

    breakpoints: [
      {
        id: "desktop",
        name: "Desktop",
        width: 1200,
        isDefault: true,
      },

      {
        id: "tablet",
        name: "Tablet",
        width: 768,
      },

      {
        id: "mobile",
        name: "Mobile",
        width: 480,
      },
    ],
  };
};


// ============================================================
// Editor State
// ============================================================

interface EditorStore {
  // ----------------------------------------------------------
  // Persistent project
  // ----------------------------------------------------------

  project: Project;

  // ----------------------------------------------------------
  // Editor/session state
  // ----------------------------------------------------------

  selectedNodeId: string | null;
  selectedElement: PageNode | null;

  activePageId: string;

  activeBreakpointId: string;
  canvasWidth: number;

  zoom: number;
  canvasScale: number;

  grid: {
    visible: boolean;
    snap: boolean;
    size: number;
  };
  gridSnap: boolean;

  mode: EditorMode;

  activePanel: EditorPanel;

  // ----------------------------------------------------------
  // Selection
  // ----------------------------------------------------------

  setSelectedNode: (
    nodeId: string | null
  ) => void;

  selectElementById: (
    nodeId: string | null
  ) => void;

  // ----------------------------------------------------------
  // Pages
  // ----------------------------------------------------------

  setActivePage: (
    pageId: string
  ) => void;

  addPage: (params: {
    name: string;
    path: string;
  }) => string;

  renamePage: (
    pageId: string,
    name: string
  ) => void;

  deletePage: (
    pageId: string
  ) => void;

  // ----------------------------------------------------------
  // Zoom & Canvas Scale
  // ----------------------------------------------------------

  setZoom: (
    zoom:
      | number
      | ((previous: number) => number)
  ) => void;

  setCanvasScale: (
    zoom:
      | number
      | ((previous: number) => number)
  ) => void;

  zoomIn: () => void;

  zoomOut: () => void;

  resetZoom: () => void;

  // ----------------------------------------------------------
  // Grid
  // ----------------------------------------------------------

  setGridVisible: (
    value:
      | boolean
      | ((previous: boolean) => boolean)
  ) => void;

  setGridSnap: (
    value:
      | boolean
      | ((previous: boolean) => boolean)
  ) => void;

  setGridSize: (
    size: number
  ) => void;

  // ----------------------------------------------------------
  // Mode / Panel
  // ----------------------------------------------------------

  setMode: (
    mode: EditorMode
  ) => void;

  setActivePanel: (
    panel: EditorPanel
  ) => void;

  // ----------------------------------------------------------
  // Elements
  // ----------------------------------------------------------

  addElement: (params: {
    type: ElementNode["type"];
    name: string;
    parentId: string;

    style?: ElementStyle;

    props?: ElementProps;
  }) => string | null;

  updateElementName: (
    elementId: string,
    name: string
  ) => void;

  updateElementStyle: (
    elementId: string,
    style: Partial<ElementStyle>
  ) => void;

  updateElementProp: (
    elementId: string,
    key: string,
    value: unknown
  ) => void;

  deleteElement: (
    elementId: string
  ) => void;

  duplicateElement: (
    elementId: string
  ) => string | null;

  moveElement: (
    elementId: string,
    newParentId: string,
    index?: number
  ) => void;

  // ----------------------------------------------------------
  // Breakpoints
  // ----------------------------------------------------------

  setActiveBreakpoint: (
    breakpointId: string
  ) => void;

  addBreakpoint: (params: {
    name: string;
    width: number;
  }) => string;

  updateBreakpoint: (
    breakpointId: string,
    updates: Partial<
      Pick<Breakpoint, "name" | "width">
    >
  ) => void;

  deleteBreakpoint: (
    breakpointId: string
  ) => void;

  updateElementBreakpointStyle: (
    elementId: string,
    breakpointId: string,
    style: Partial<ElementStyle>
  ) => void;

  removeElementBreakpointStyle: (
    elementId: string,
    breakpointId: string,
    property: keyof ElementStyle
  ) => void;

  // ----------------------------------------------------------
  // Project Styles
  // ----------------------------------------------------------

  updateProjectStyles: (
    styles: Partial<ProjectStyles>
  ) => void;

  // ----------------------------------------------------------
  // Components
  // ----------------------------------------------------------

  createComponent: (params: {
    name: string;
    rootElementId: string;
    elements: Record<string, ElementNode>;
    properties?: ComponentDefinition["properties"];
  }) => string;

  deleteComponent: (
    componentId: string
  ) => void;

  addComponentInstance: (params: {
    componentId: string;
    parentId: string;
    index?: number;
  }) => string | null;

  updateComponentInstanceProp: (
    instanceId: string,
    propertyId: string,
    value: unknown
  ) => void;

  // ----------------------------------------------------------
  // History flags
  // ----------------------------------------------------------

  historyCanUndo: boolean;

  historyCanRedo: boolean;
}


// Sync derived state fields so selectors work cleanly
const syncStateHelpers = (state: EditorStore) => {
  if (state.selectedNodeId) {
    state.selectedElement = state.project.elements[state.selectedNodeId] || null;
  } else {
    state.selectedElement = null;
  }

  state.canvasScale = state.zoom;
  state.gridSnap = state.grid.snap;

  const activeBp = state.project.breakpoints.find(
    (bp) => bp.id === state.activeBreakpointId
  );
  state.canvasWidth = activeBp ? activeBp.width : 1200;

  if (state.project.editorState) {
    state.project.editorState.selectedNodeId = state.selectedNodeId;
    state.project.editorState.activePageId = state.activePageId;
    state.project.editorState.activeBreakpointId = state.activeBreakpointId;
    state.project.editorState.zoom = state.zoom;
    state.project.editorState.grid = { ...state.grid };
    state.project.editorState.mode = state.mode;
  }
};


// ============================================================
// Store
// ============================================================

const initialProject = createInitialProject();

export const useEditorStore =
  create<EditorStore>()(
    immer((set) => ({
      // ======================================================
      // INITIAL PROJECT
      // ======================================================

      project: initialProject,

      // ======================================================
      // EDITOR STATE
      // ======================================================

      selectedNodeId: "home-box",
      selectedElement: initialProject.elements["home-box"] || null,

      activePageId: "home",

      activeBreakpointId: "desktop",
      canvasWidth: 1200,

      zoom: 1,
      canvasScale: 1,

      grid: {
        visible: false,
        snap: true,
        size: 8,
      },
      gridSnap: true,

      mode: "edit",

      activePanel: "elements",

      // ======================================================
      // SELECTION
      // ======================================================

      setSelectedNode: (nodeId) => {
        set((state) => {
          if (nodeId === null) {
            state.selectedNodeId = null;
            syncStateHelpers(state);
            return;
          }

          if (!state.project.elements[nodeId]) {
            return;
          }

          state.selectedNodeId = nodeId;
          syncStateHelpers(state);
        });
      },

      selectElementById: (nodeId) => {
        set((state) => {
          if (nodeId === null) {
            state.selectedNodeId = null;
            syncStateHelpers(state);
            return;
          }

          if (!state.project.elements[nodeId]) {
            return;
          }

          state.selectedNodeId = nodeId;
          syncStateHelpers(state);
        });
      },

      // ======================================================
      // PAGES
      // ======================================================

      setActivePage: (pageId) => {
        set((state) => {
          const page =
            state.project.pages[pageId];

          if (!page) {
            return;
          }

          state.activePageId = pageId;

          state.selectedNodeId =
            page.rootElementId;
          syncStateHelpers(state);
        });
      },

      addPage: ({ name, path }) => {
        const pageId = createId("page");
        const rootId = createId("root");

        set((state) => {
          state.project.pages[pageId] = {
            id: pageId,
            name,
            path,
            rootElementId: rootId,
          };

          state.project.elements[rootId] = {
            id: rootId,
            type: "box",
            name,
            parentId: null,
            children: [],
            style: {
              display: "block",
              width: "100%",
              minHeight: "100vh",
              background: "#ffffff",
            },
            breakpointStyles: {},
            props: {},
          };

          state.activePageId = pageId;
          state.selectedNodeId = rootId;
          syncStateHelpers(state);
        });

        return pageId;
      },

      renamePage: (pageId, name) => {
        set((state) => {
          const page =
            state.project.pages[pageId];

          if (!page) {
            return;
          }

          page.name = name;
        });
      },

      deletePage: (pageId) => {
        set((state) => {
          const page =
            state.project.pages[pageId];

          if (!page) {
            return;
          }

          const pageIds =
            Object.keys(
              state.project.pages
            );

          // Don't delete the final page.
          if (pageIds.length <= 1) {
            return;
          }

          // Remove the page tree.
          deleteElementTree(
            state.project.elements,
            page.rootElementId
          );

          delete state.project.pages[pageId];

          // Switch active page if necessary.
          if (
            state.activePageId === pageId
          ) {
            const nextPageId =
              Object.keys(
                state.project.pages
              )[0];

            state.activePageId =
              nextPageId;

            state.selectedNodeId =
              state.project.pages[
                nextPageId
              ].rootElementId;
          }
          syncStateHelpers(state);
        });
      },

      // ======================================================
      // ZOOM & CANVAS SCALE
      // ======================================================

      setZoom: (zoom) => {
        set((state) => {
          const nextZoom =
            typeof zoom === "function"
              ? zoom(state.zoom)
              : zoom;

          state.zoom = clamp(
            nextZoom,
            0.1,
            4
          );
          syncStateHelpers(state);
        });
      },

      setCanvasScale: (zoom) => {
        set((state) => {
          const nextZoom =
            typeof zoom === "function"
              ? zoom(state.zoom)
              : zoom;

          state.zoom = clamp(
            nextZoom,
            0.1,
            4
          );
          syncStateHelpers(state);
        });
      },

      zoomIn: () => {
        set((state) => {
          state.zoom = clamp(
            state.zoom + 0.1,
            0.1,
            4
          );
          syncStateHelpers(state);
        });
      },

      zoomOut: () => {
        set((state) => {
          state.zoom = clamp(
            state.zoom - 0.1,
            0.1,
            4
          );
          syncStateHelpers(state);
        });
      },

      resetZoom: () => {
        set((state) => {
          state.zoom = 1;
          syncStateHelpers(state);
        });
      },

      // ======================================================
      // GRID
      // ======================================================

      setGridVisible: (value) => {
        set((state) => {
          state.grid.visible =
            typeof value === "function"
              ? value(state.grid.visible)
              : value;
        });
      },

      setGridSnap: (value) => {
        set((state) => {
          state.grid.snap =
            typeof value === "function"
              ? value(state.grid.snap)
              : value;
          syncStateHelpers(state);
        });
      },

      setGridSize: (size) => {
        set((state) => {
          state.grid.size = Math.max(
            1,
            size
          );
        });
      },

      // ======================================================
      // MODE / PANEL
      // ======================================================

      setMode: (mode) => {
        set((state) => {
          state.mode = mode;
          syncStateHelpers(state);
        });
      },

      setActivePanel: (panel) => {
        set((state) => {
          state.activePanel = panel;
        });
      },

      // ======================================================
      // ELEMENTS
      // ======================================================

      addElement: ({
        type,
        name,
        parentId,
        style,
        props,
      }) => {
        const id = createId(type);

        let created = false;

        set((state) => {
          const parent =
            state.project.elements[
            parentId
            ];

          if (!parent || parent.type === "component-instance") {
            return;
          }

          const element =
            createDefaultElement(
              id,
              type,
              name,
              parentId,
              style,
              props
            );

          state.project.elements[id] =
            element;

          parent.children.push(id);

          state.selectedNodeId = id;
          syncStateHelpers(state);

          created = true;
        });

        return created ? id : null;
      },

      updateElementName: (
        elementId,
        name
      ) => {
        set((state) => {
          const element =
            state.project.elements[
            elementId
            ];

          if (!element) {
            return;
          }

          element.name = name;
          syncStateHelpers(state);
        });
      },

      updateElementStyle: (
        elementId,
        style
      ) => {
        set((state) => {
          const element =
            state.project.elements[
            elementId
            ];

          if (!element) {
            return;
          }

          if (element.type === "component-instance") {
            element.styleOverrides = {
              ...element.styleOverrides,
              ...style,
            };
          } else {
            Object.assign(
              element.style,
              style
            );
          }
          syncStateHelpers(state);
        });
      },

      updateElementProp: (
        elementId,
        key,
        value
      ) => {
        set((state) => {
          const element =
            state.project.elements[
            elementId
            ];

          if (!element) {
            return;
          }

          (
            element.props as Record<
              string,
              unknown
            >
          )[key] = value;
          syncStateHelpers(state);
        });
      },

      deleteElement: (
        elementId
      ) => {
        set((state) => {
          const element =
            state.project.elements[
            elementId
            ];

          if (!element) {
            return;
          }

          // Never delete a page root.
          const isRoot =
            Object.values(
              state.project.pages
            ).some(
              (page) =>
                page.rootElementId ===
                elementId
            );

          if (isRoot) {
            return;
          }

          const parentId =
            element.parentId;

          if (parentId) {
            const parent =
              state.project.elements[
              parentId
              ];

            if (parent && parent.type !== "component-instance") {
              parent.children =
                parent.children.filter(
                  (id) =>
                    id !== elementId
                );
            }
          }

          deleteElementTree(
            state.project.elements,
            elementId
          );

          if (
            state.selectedNodeId ===
            elementId
          ) {
            state.selectedNodeId =
              parentId;
          }
          syncStateHelpers(state);
        });
      },

      duplicateElement: (
        elementId
      ) => {
        let duplicatedId:
          | string
          | null = null;

        set((state) => {
          const original =
            state.project.elements[
            elementId
            ];

          if (!original) {
            return;
          }

          if (!original.parentId) {
            return;
          }

          const parent =
            state.project.elements[
            original.parentId
            ];

          if (!parent || parent.type === "component-instance") {
            return;
          }

          const cloneNode = (
            sourceId: string,
            newParentId: string
          ): string => {
            const source =
              state.project.elements[
              sourceId
              ];

            const newId =
              createId(source.type);

            const clone =
              structuredClone(
                source
              );

            clone.id = newId;

            clone.parentId =
              newParentId;

            clone.name =
              `${source.name} Copy`;

            if (clone.type !== "component-instance") {
              clone.children = [];
            }

            state.project.elements[
              newId
            ] = clone;

            for (
              const childId of
              source.children
            ) {
              const childNewId =
                cloneNode(
                  childId,
                  newId
                );

              if (clone.type !== "component-instance") {
                clone.children.push(
                  childNewId
                );
              }
            }

            return newId;
          };

          duplicatedId =
            cloneNode(
              elementId,
              original.parentId
            );

          const index =
            parent.children.indexOf(
              elementId
            );

          parent.children.splice(
            index + 1,
            0,
            duplicatedId
          );

          state.selectedNodeId =
            duplicatedId;
          syncStateHelpers(state);
        });

        return duplicatedId;
      },

      moveElement: (
        elementId,
        newParentId,
        index
      ) => {
        set((state) => {
          const element =
            state.project.elements[
            elementId
            ];

          const newParent =
            state.project.elements[
            newParentId
            ];

          if (
            !element ||
            !newParent ||
            newParent.type === "component-instance"
          ) {
            return;
          }

          if (
            elementId ===
            newParentId
          ) {
            return;
          }

          // Prevent moving an element
          // inside its own descendant.
          if (
            isDescendant(
              state.project.elements,
              newParentId,
              elementId
            )
          ) {
            return;
          }

          // Remove from old parent.
          if (element.parentId) {
            const oldParent =
              state.project.elements[
              element.parentId
              ];

            if (oldParent && oldParent.type !== "component-instance") {
              oldParent.children =
                oldParent.children.filter(
                  (id) =>
                    id !== elementId
                );
            }
          }

          element.parentId =
            newParentId;

          // Add to new parent.
          if (
            index === undefined ||
            index < 0 ||
            index >
            newParent.children.length
          ) {
            newParent.children.push(
              elementId
            );
          } else {
            newParent.children.splice(
              index,
              0,
              elementId
            );
          }
          syncStateHelpers(state);
        });
      },

      // ======================================================
      // BREAKPOINTS
      // ======================================================

      setActiveBreakpoint: (
        breakpointId
      ) => {
        set((state) => {
          const exists =
            state.project.breakpoints.some(
              (bp) =>
                bp.id === breakpointId
            );

          if (!exists) {
            return;
          }

          state.activeBreakpointId =
            breakpointId;
          syncStateHelpers(state);
        });
      },

      addBreakpoint: ({
        name,
        width,
      }) => {
        const id = createId("bp");

        set((state) => {
          state.project.breakpoints.push(
            {
              id,
              name,
              width,
            }
          );

          sortBreakpoints(
            state.project.breakpoints
          );

          state.activeBreakpointId =
            id;
          syncStateHelpers(state);
        });

        return id;
      },

      updateBreakpoint: (
        breakpointId,
        updates
      ) => {
        set((state) => {
          const breakpoint =
            state.project.breakpoints.find(
              (bp) =>
                bp.id === breakpointId
            );

          if (!breakpoint) {
            return;
          }

          Object.assign(
            breakpoint,
            updates
          );

          sortBreakpoints(
            state.project.breakpoints
          );
          syncStateHelpers(state);
        });
      },

      deleteBreakpoint: (
        breakpointId
      ) => {
        set((state) => {
          const breakpoint =
            state.project.breakpoints.find(
              (bp) =>
                bp.id === breakpointId
            );

          if (!breakpoint) {
            return;
          }

          // Default breakpoint cannot be deleted.
          if (
            breakpoint.isDefault
          ) {
            return;
          }

          if (
            state.project.breakpoints
              .length <= 1
          ) {
            return;
          }

          state.project.breakpoints =
            state.project.breakpoints.filter(
              (bp) =>
                bp.id !== breakpointId
            );

          // Remove responsive overrides belonging to this breakpoint.
          for (const element of Object.values(
            state.project.elements
          )) {
            if (element.type === "component-instance") {
              if (element.breakpointStyleOverrides) {
                delete element.breakpointStyleOverrides[breakpointId];
              }
            } else {
              if (element.breakpointStyles) {
                delete element.breakpointStyles[breakpointId];
              }
            }
          }

          if (
            state.activeBreakpointId ===
            breakpointId
          ) {
            state.activeBreakpointId =
              state.project.breakpoints[0]
                .id;
          }
          syncStateHelpers(state);
        });
      },

      updateElementBreakpointStyle: (
        elementId,
        breakpointId,
        style
      ) => {
        set((state) => {
          const element =
            state.project.elements[
            elementId
            ];

          if (!element) {
            return;
          }

          const breakpoint =
            state.project.breakpoints.find(
              (bp) =>
                bp.id === breakpointId
            );

          if (!breakpoint) {
            return;
          }

          if (element.type === "component-instance") {
            if (!element.breakpointStyleOverrides) {
              element.breakpointStyleOverrides = {};
            }
            element.breakpointStyleOverrides[breakpointId] = {
              ...element.breakpointStyleOverrides[breakpointId],
              ...style,
            };
          } else {
            if (
              !element.breakpointStyles[
              breakpointId
              ]
            ) {
              element.breakpointStyles[
                breakpointId
              ] = {};
            }

            Object.assign(
              element.breakpointStyles[
              breakpointId
              ],
              style
            );
          }
          syncStateHelpers(state);
        });
      },

      removeElementBreakpointStyle: (
        elementId,
        breakpointId,
        property
      ) => {
        set((state) => {
          const element =
            state.project.elements[
            elementId
            ];

          if (!element) {
            return;
          }

          if (element.type === "component-instance") {
            const overrides = element.breakpointStyleOverrides?.[breakpointId];
            if (overrides) {
              delete overrides[property];
              if (Object.keys(overrides).length === 0 && element.breakpointStyleOverrides) {
                delete element.breakpointStyleOverrides[breakpointId];
              }
            }
          } else {
            const breakpointStyles =
              element.breakpointStyles[
              breakpointId
              ];

            if (!breakpointStyles) {
              return;
            }

            delete breakpointStyles[
              property
            ];

            if (
              Object.keys(
                breakpointStyles
              ).length === 0
            ) {
              delete element
                .breakpointStyles[
                breakpointId
              ];
            }
          }
          syncStateHelpers(state);
        });
      },

      // ======================================================
      // PROJECT STYLES
      // ======================================================

      updateProjectStyles: (
        styles
      ) => {
        set((state) => {
          Object.assign(
            state.project.styles,
            styles
          );
        });
      },

      // ======================================================
      // COMPONENTS
      // ======================================================

      createComponent: ({
        name,
        rootElementId,
        elements,
        properties = [],
      }) => {
        const componentId =
          createId("component");

        set((state) => {
          state.project.components[
            componentId
          ] = {
            id: componentId,
            name,
            rootElementId,
            elements,
            properties,
          };
        });

        return componentId;
      },

      deleteComponent: (
        componentId
      ) => {
        set((state) => {
          if (
            !state.project.components[
            componentId
            ]
          ) {
            return;
          }

          delete state.project
            .components[
            componentId
          ];
        });
      },

      addComponentInstance: ({
        componentId,
        parentId,
        index,
      }) => {
        const instanceId =
          createId("instance");

        let created = false;

        set((state) => {
          const component =
            state.project.components[
            componentId
            ];

          const parent =
            state.project.elements[
            parentId
            ];

          if (
            !component ||
            !parent ||
            parent.type === "component-instance"
          ) {
            return;
          }

          const instance:
            ComponentInstanceNode =
          {
            id: instanceId,

            type:
              "component-instance",

            name:
              component.name,

            parentId,

            children: [],

            componentId,

            props: {},

            styleOverrides: {},

            breakpointStyleOverrides:
              {},
          };

          state.project.elements[
            instanceId
          ] = instance;

          if (
            index === undefined ||
            index < 0 ||
            index >
            parent.children.length
          ) {
            parent.children.push(
              instanceId
            );
          } else {
            parent.children.splice(
              index,
              0,
              instanceId
            );
          }

          state.selectedNodeId =
            instanceId;
          syncStateHelpers(state);

          created = true;
        });

        return created
          ? instanceId
          : null;
      },

      updateComponentInstanceProp: (
        instanceId,
        propertyId,
        value
      ) => {
        set((state) => {
          const node =
            state.project.elements[
            instanceId
            ];

          if (
            !node ||
            node.type !==
            "component-instance"
          ) {
            return;
          }

          const component =
            state.project.components[
            node.componentId
            ];

          if (!component) {
            return;
          }

          const property =
            component.properties.find(
              (property) =>
                property.id ===
                propertyId
            );

          if (!property) {
            return;
          }

          node.props[propertyId] =
            value;
          syncStateHelpers(state);
        });
      },

      // ======================================================
      // HISTORY
      // ======================================================

      historyCanUndo: false,

      historyCanRedo: false,
    }))
  );


// ============================================================
// Utility Functions
// ============================================================

function clamp(
  value: number,
  min: number,
  max: number
) {
  return Math.min(
    max,
    Math.max(min, value)
  );
}


function sortBreakpoints(
  breakpoints: Breakpoint[]
) {
  breakpoints.sort(
    (a, b) =>
      b.width - a.width
  );
}


function createDefaultElement(
  id: string,
  type: ElementNode["type"],
  name: string,
  parentId: string,
  style?: ElementStyle,
  props?: ElementProps
): ElementNode {
  if (type === "text") {
    return {
      id,
      type: "text",
      name,
      parentId,
      children: [],

      style: {
        fontSize: "16px",
        color: "#111827",
        ...style,
      },

      breakpointStyles: {},

      props: (props as TextProps) ?? {
        content: "Text",
        tag: "p",
      },
    };
  }

  return {
    id,
    type: "box",
    name,
    parentId,
    children: [],

    style: {
      display: "block",
      width: "100%",
      ...style,
    },

    breakpointStyles: {},

    props: (props as BoxProps) ?? {},
  };
}


function deleteElementTree(
  elements: Record<string, PageNode>,
  elementId: string
) {
  const element =
    elements[elementId];

  if (!element) {
    return;
  }

  for (const childId of element.children) {
    deleteElementTree(
      elements,
      childId
    );
  }

  delete elements[elementId];
}


function isDescendant(
  elements: Record<string, PageNode>,
  nodeId: string,
  potentialAncestorId: string
): boolean {
  let current =
    elements[nodeId];

  while (current?.parentId) {
    if (
      current.parentId ===
      potentialAncestorId
    ) {
      return true;
    }

    current =
      elements[current.parentId];
  }

  return false;
}