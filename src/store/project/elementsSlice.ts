// ============================================================
// store/project/elementsSlice.ts
//
// Element tree + styles + attributes + interactions +
// pseudo-elements + text.
// ============================================================

import type { StateCreator } from "zustand";

import type {
    ElementNode,
    ElementStyle,
    HTMLTagName,
    ID,
    InteractionStyleRule,
    PseudoElement,
    PseudoElementStyle,
} from "@/types/project";

import type { ProjectStoreState } from "./storeTypes";

import {
    collectDescendantIds,
    isDescendant,
    isPageRoot,
    makeId,
} from "./utils";

export interface ElementsSlice {
    addElementNode: (params: {
        tag: HTMLTagName;
        parentId: ID;
        index?: number;
        name?: string;
    }) => ID | null;

    removeNode: (
        nodeId: ID
    ) => void;

    duplicateNode: (
        nodeId: ID
    ) => ID | null;

    moveNode: (params: {
        nodeId: ID;
        newParentId: ID;
        index: number;
    }) => boolean;

    updateNodeStyle: (
        nodeId: ID,
        patch: Partial<ElementStyle>
    ) => void;

    updateBreakpointStyle: (
        nodeId: ID,
        breakpointId: ID,
        patch: Partial<ElementStyle>
    ) => void;

    removeBreakpointStyleProperty: (
        nodeId: ID,
        breakpointId: ID,
        propertyKey: string
    ) => void;

    clearBreakpointOverrides: (
        nodeId: ID,
        breakpointId: ID
    ) => void;

    updateNodeAttributes: (
        nodeId: ID,
        patch: Record<string, unknown>
    ) => void;

    renameNode: (
        nodeId: ID,
        name: string
    ) => void;

    updateTextContent: (
        nodeId: ID,
        content: string
    ) => void;

    addInteractionStyle: (
        nodeId: ID,
        rule: Omit<InteractionStyleRule, "id">
    ) => ID | null;

    updateInteractionStyle: (
        nodeId: ID,
        ruleId: ID,
        patch: Partial<
            Omit<InteractionStyleRule, "id">
        >
    ) => void;

    removeInteractionStyle: (
        nodeId: ID,
        ruleId: ID
    ) => void;

    setPseudoElement: (
        nodeId: ID,
        pseudo: PseudoElement,
        value: PseudoElementStyle
    ) => void;

    removePseudoElement: (
        nodeId: ID,
        pseudo: PseudoElement
    ) => void;
}

export const createElementsSlice: StateCreator<
    ProjectStoreState,
    [],
    [],
    ElementsSlice
> = (_set, get) => ({
    // ==========================================================
    // Add element
    // ==========================================================

    addElementNode: ({
        tag,
        parentId,
        index,
        name,
    }) => {
        const state = get();

        const parent =
            state.project.elements[
            parentId
            ];

        if (
            !parent ||
            parent.type !== "element"
        ) {
            return null;
        }

        const newId = makeId("el");

        get().mutate((draft) => {
            const draftParent =
                draft.elements[parentId];

            if (
                !draftParent ||
                draftParent.type !== "element"
            ) {
                return;
            }

            /**
             * Because ElementNode is a discriminated
             * union, construct the common node first
             * and use the tag-specific switch where
             * required.
             */
            let newNode: ElementNode;

            switch (tag) {
                case "p":
                case "span":
                case "h1":
                case "h2":
                case "h3":
                case "h4":
                case "h5":
                case "h6":
                case "strong":
                case "em":
                    newNode = {
                        id: newId,
                        type: "element",
                        name: name ?? tag,
                        parentId,
                        children: [],
                        tag,
                        attributes: {},
                        style: {},
                        breakpointStyles: {},
                        content: "",
                    } as ElementNode;
                    break;

                default:
                    newNode = {
                        id: newId,
                        type: "element",
                        name: name ?? tag,
                        parentId,
                        children: [],
                        tag,
                        attributes: {},
                        style: {},
                        breakpointStyles: {},
                    } as ElementNode;
            }

            draft.elements[newId] =
                newNode;

            const targetIndex =
                index === undefined
                    ? draftParent.children.length
                    : Math.max(
                        0,
                        Math.min(
                            index,
                            draftParent.children.length
                        )
                    );

            draftParent.children.splice(
                targetIndex,
                0,
                newId
            );
        });

        return newId;
    },

    // ==========================================================
    // Remove node
    // ==========================================================

    removeNode: (nodeId) => {
        const state = get();

        const node =
            state.project.elements[
            nodeId
            ];

        if (!node) {
            return;
        }

        /**
         * Page roots cannot be deleted.
         */
        if (
            isPageRoot(
                state.project.pages,
                nodeId
            )
        ) {
            return;
        }

        get().mutate((draft) => {
            const draftNode =
                draft.elements[nodeId];

            if (!draftNode) {
                return;
            }

            /**
             * Remove the node from its
             * parent's child array.
             */
            if (draftNode.parentId) {
                const parent =
                    draft.elements[
                    draftNode.parentId
                    ];

                if (
                    parent &&
                    parent.type === "element"
                ) {
                    parent.children =
                        parent.children.filter(
                            (id) =>
                                id !== nodeId
                        );
                }
            }

            /**
             * Delete the entire subtree.
             */
            const ids =
                collectDescendantIds(
                    draft.elements,
                    nodeId
                );

            const deletedIdsSet = new Set(ids);

            for (const id of ids) {
                delete draft.elements[id];
            }

            /**
             * Clean up any timeline tracks / scroll-trigger references
             * targeting the deleted elements.
             */
            for (const timeline of Object.values(draft.gsapTimelines)) {
                timeline.tracks = timeline.tracks.filter(
                    (track) => !deletedIdsSet.has(track.targetNodeId)
                );

                if (
                    timeline.scrollTrigger?.triggerNodeId &&
                    deletedIdsSet.has(
                        timeline.scrollTrigger.triggerNodeId
                    )
                ) {
                    delete timeline.scrollTrigger.triggerNodeId;
                }
            }

            /**
             * Delete any actions that targeted the deleted elements,
             * then sweep bindings pointing at those now-deleted actions
             * (same pattern as removeAction).
             */
            const orphanedActionIds = new Set<string>();

            for (const action of Object.values(draft.actions)) {
                let targetNodeId: string | undefined;

                switch (action.type) {
                    case "scrollTo":
                    case "toggle":
                    case "openModal":
                    case "closeModal":
                        targetNodeId = action.config.targetNodeId;
                        break;
                    case "submitForm":
                        targetNodeId = action.config.formNodeId;
                        break;
                    default:
                        targetNodeId = undefined;
                }

                if (targetNodeId && deletedIdsSet.has(targetNodeId)) {
                    orphanedActionIds.add(action.id);
                    delete draft.actions[action.id];
                }
            }

            if (orphanedActionIds.size > 0) {
                for (const otherNode of Object.values(draft.elements)) {
                    if (
                        otherNode.type !== "element" ||
                        !otherNode.actions
                    ) {
                        continue;
                    }

                    otherNode.actions = otherNode.actions.filter(
                        (binding) =>
                            !orphanedActionIds.has(binding.actionId)
                    );
                }
            }
        });
    },

    // ==========================================================
    // Duplicate node
    // ==========================================================

    duplicateNode: (nodeId) => {
        const state = get();
        const originalNode = state.project.elements[nodeId];
        if (!originalNode || isPageRoot(state.project.pages, nodeId) || !originalNode.parentId) {
            return null;
        }

        const parent = state.project.elements[originalNode.parentId];
        if (!parent || parent.type !== "element") {
            return null;
        }

        let newRootId: ID | null = null;

        get().mutate((draft) => {
            const draftParent = draft.elements[originalNode.parentId!];
            if (!draftParent || draftParent.type !== "element") return;

            const cloneSubtree = (currentId: ID, parentId: ID, isRoot: boolean): ID | null => {
                const source = draft.elements[currentId];
                if (!source) return null;

                const newId = makeId(source.type === "element" ? "el" : "comp");
                const newName = isRoot ? `${source.name} (Copy)` : source.name;

                if (source.type === "element") {
                    const clonedChildren: ID[] = [];
                    const clonedNode: ElementNode = {
                        ...JSON.parse(JSON.stringify(source)),
                        id: newId,
                        name: newName,
                        parentId,
                        children: [],
                    };

                    draft.elements[newId] = clonedNode;

                    for (const childId of source.children) {
                        const clonedChildId = cloneSubtree(childId, newId, false);
                        if (clonedChildId) {
                            clonedChildren.push(clonedChildId);
                        }
                    }

                    (draft.elements[newId] as ElementNode).children = clonedChildren;
                    return newId;
                } else {
                    const clonedInstance = {
                        ...JSON.parse(JSON.stringify(source)),
                        id: newId,
                        name: newName,
                        parentId,
                    };
                    draft.elements[newId] = clonedInstance;
                    return newId;
                }
            };

            newRootId = cloneSubtree(nodeId, originalNode.parentId!, true);
            if (newRootId) {
                const originalIndex = draftParent.children.indexOf(nodeId);
                const insertIndex = originalIndex !== -1 ? originalIndex + 1 : draftParent.children.length;
                draftParent.children.splice(insertIndex, 0, newRootId);
            }
        });

        return newRootId;
    },

    // ==========================================================
    // Move node
    // ==========================================================

    moveNode: ({
        nodeId,
        newParentId,
        index,
    }) => {
        const state = get();

        const node =
            state.project.elements[
            nodeId
            ];

        const newParent =
            state.project.elements[
            newParentId
            ];

        if (!node || !newParent) {
            return false;
        }

        if (newParent.type !== "element") {
            return false;
        }

        /**
         * Can't move into itself.
         */
        if (nodeId === newParentId) {
            return false;
        }

        /**
         * Can't move into a descendant.
         */
        if (
            isDescendant(
                state.project.elements,
                nodeId,
                newParentId
            )
        ) {
            return false;
        }

        /**
         * Don't move page roots.
         */
        if (
            isPageRoot(
                state.project.pages,
                nodeId
            )
        ) {
            return false;
        }

        let moved = false;

        get().mutate((draft) => {
            const draftNode =
                draft.elements[nodeId];

            const draftNewParent =
                draft.elements[
                newParentId
                ];

            if (
                !draftNode ||
                !draftNewParent ||
                draftNewParent.type !== "element"
            ) {
                return;
            }

            const oldParentId =
                draftNode.parentId;

            const oldParent =
                oldParentId
                    ? draft.elements[
                    oldParentId
                    ]
                    : null;

            const sameParent =
                oldParentId ===
                newParentId;

            /**
             * Remove from old parent.
             */
            if (
                oldParent &&
                oldParent.type === "element"
            ) {
                const oldIndex =
                    oldParent.children.indexOf(
                        nodeId
                    );

                if (oldIndex !== -1) {
                    oldParent.children.splice(
                        oldIndex,
                        1
                    );

                    /**
                     * index represents the final
                     * destination index.
                     */
                    if (
                        sameParent &&
                        oldIndex < index
                    ) {
                        index -= 1;
                    }
                }
            }

            const targetIndex =
                Math.max(
                    0,
                    Math.min(
                        index,
                        draftNewParent.children.length
                    )
                );

            draftNode.parentId =
                newParentId;

            draftNewParent.children.splice(
                targetIndex,
                0,
                nodeId
            );

            moved = true;
        });

        return moved;
    },

    // ==========================================================
    // Base style
    // ==========================================================

    updateNodeStyle: (
        nodeId,
        patch
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element"
            ) {
                return;
            }

            Object.assign(
                node.style,
                patch
            );
        });
    },

    // ==========================================================
    // Breakpoint style
    // ==========================================================

    updateBreakpointStyle: (
        nodeId,
        breakpointId,
        patch
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element"
            ) {
                return;
            }

            node.breakpointStyles[
                breakpointId
            ] = {
                ...node.breakpointStyles[
                breakpointId
                ],
                ...patch,
            };
        });
    },

    // ==========================================================
    // Remove breakpoint style property
    // ==========================================================

    removeBreakpointStyleProperty: (
        nodeId,
        breakpointId,
        propertyKey
    ) => {
        get().mutate((draft) => {
            const node = draft.elements[nodeId];
            if (!node || node.type !== "element") return;

            if (node.breakpointStyles?.[breakpointId]) {
                delete (node.breakpointStyles[breakpointId] as Record<string, unknown>)[propertyKey];

                // If empty, clean up the breakpoint key
                if (Object.keys(node.breakpointStyles[breakpointId]).length === 0) {
                    delete node.breakpointStyles[breakpointId];
                }
            }
        });
    },

    // ==========================================================
    // Clear all breakpoint overrides for a node
    // ==========================================================

    clearBreakpointOverrides: (
        nodeId,
        breakpointId
    ) => {
        get().mutate((draft) => {
            const node = draft.elements[nodeId];
            if (!node || node.type !== "element") return;

            if (node.breakpointStyles?.[breakpointId]) {
                delete node.breakpointStyles[breakpointId];
            }
        });
    },

    // ==========================================================
    // HTML attributes
    // ==========================================================

    updateNodeAttributes: (
        nodeId,
        patch
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element"
            ) {
                return;
            }

            Object.assign(
                node.attributes,
                patch
            );
        });
    },

    // ==========================================================
    // Rename
    // ==========================================================

    renameNode: (
        nodeId,
        name
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (!node) {
                return;
            }

            node.name = name;
        });
    },

    // ==========================================================
    // Text content
    // ==========================================================

    updateTextContent: (
        nodeId,
        content
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element"
            ) {
                return;
            }

            /**
             * Only TextTagName nodes can have
             * content according to the frozen schema.
             */
            if (
                !(
                    node.tag === "p" ||
                    node.tag === "span" ||
                    node.tag === "h1" ||
                    node.tag === "h2" ||
                    node.tag === "h3" ||
                    node.tag === "h4" ||
                    node.tag === "h5" ||
                    node.tag === "h6" ||
                    node.tag === "strong" ||
                    node.tag === "em"
                )
            ) {
                return;
            }

            node.content = content;
        });
    },

    // ==========================================================
    // Add interaction style
    // ==========================================================

    addInteractionStyle: (
        nodeId,
        rule
    ) => {
        const state = get();

        const node =
            state.project.elements[
            nodeId
            ];

        if (
            !node ||
            node.type !== "element"
        ) {
            return null;
        }

        const ruleId =
            makeId("interaction");

        get().mutate((draft) => {
            const draftNode =
                draft.elements[nodeId];

            if (
                !draftNode ||
                draftNode.type !== "element"
            ) {
                return;
            }

            if (
                !draftNode.interactionStyles
            ) {
                draftNode.interactionStyles =
                    [];
            }

            draftNode.interactionStyles.push({
                id: ruleId,
                ...rule,
            });
        });

        return ruleId;
    },

    // ==========================================================
    // Update interaction style
    // ==========================================================

    updateInteractionStyle: (
        nodeId,
        ruleId,
        patch
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element" ||
                !node.interactionStyles
            ) {
                return;
            }

            const rule =
                node.interactionStyles.find(
                    (item) =>
                        item.id === ruleId
                );

            if (rule) {
                Object.assign(
                    rule,
                    patch
                );
            }
        });
    },

    // ==========================================================
    // Remove interaction style
    // ==========================================================

    removeInteractionStyle: (
        nodeId,
        ruleId
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element" ||
                !node.interactionStyles
            ) {
                return;
            }

            node.interactionStyles =
                node.interactionStyles.filter(
                    (rule) =>
                        rule.id !== ruleId
                );
        });
    },

    // ==========================================================
    // Pseudo element
    // ==========================================================

    setPseudoElement: (
        nodeId,
        pseudo,
        value
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element"
            ) {
                return;
            }

            if (!node.pseudoElements) {
                node.pseudoElements = {};
            }

            node.pseudoElements[pseudo] =
                value;
        });
    },

    // ==========================================================
    // Remove pseudo element
    // ==========================================================

    removePseudoElement: (
        nodeId,
        pseudo
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element" ||
                !node.pseudoElements
            ) {
                return;
            }

            delete node.pseudoElements[
                pseudo
            ];
        });
    },
});