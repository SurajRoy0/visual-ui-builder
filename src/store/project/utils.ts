// ============================================================
// store/project/utils.ts
// ============================================================

import { nanoid } from "nanoid";
import type { ID, TreeNode } from "@/types/project";

export function makeId(prefix: string): ID {
    return `${prefix}-${nanoid(10)}`;
}

/**
 * Returns a node and every descendant ID.
 */
export function collectDescendantIds(
    elements: Record<ID, TreeNode>,
    nodeId: ID
): ID[] {
    const ids: ID[] = [];
    const visited = new Set<ID>();

    const visit = (id: ID) => {
        if (visited.has(id)) return;

        const node = elements[id];
        if (!node) return;

        visited.add(id);
        ids.push(id);

        if (node.type === "element") {
            for (const childId of node.children) {
                visit(childId);
            }
        }
    };

    visit(nodeId);

    return ids;
}

/**
 * Returns true when `possibleDescendantId`
 * exists somewhere inside `nodeId`.
 *
 * Used to prevent:
 *
 *   Parent → Child
 *
 * from becoming:
 *
 *   Parent
 *      └── Child
 *             └── Parent
 */
export function isDescendant(
    elements: Record<ID, TreeNode>,
    nodeId: ID,
    possibleDescendantId: ID
): boolean {
    const node = elements[nodeId];

    if (!node) return false;

    const visited = new Set<ID>();

    const visit = (currentId: ID): boolean => {
        if (visited.has(currentId)) {
            return false;
        }

        visited.add(currentId);

        const current = elements[currentId];

        if (!current) {
            return false;
        }

        if (current.type === "element") {
            if (current.children.includes(possibleDescendantId)) {
                return true;
            }

            return current.children.some(visit);
        }

        return false;
    };

    return visit(nodeId);
}

/**
 * Checks whether a node is the root node of any page.
 */
export function isPageRoot(
    pages: Record<ID, { rootElementId: ID }>,
    nodeId: ID
): boolean {
    return Object.values(pages).some(
        (page) => page.rootElementId === nodeId
    );
}