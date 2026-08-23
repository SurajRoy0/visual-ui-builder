// ============================================================
// lib/dropTargetResolution.ts
//
// Pure drop-target resolution functions for Phase 4:
// - Calculates target parent and insertion index
// - Determines insertion mode: 'inside' | 'before' | 'after'
// - Validates semantic constraints via canDropElementIntoParent
// - Produces indicator geometry for visual overlay
// ============================================================

import type { ElementNode, ID, TreeNode } from "@/types/project";
import type { ElementDefinitionItem } from "./elementDefinitions";
import { canDropElementIntoParent, isVoidElement } from "./elementRules";
import { getRelativeElementRect } from "./canvasCoordinates";

export type DropMode = "inside" | "before" | "after";

let globalDraggedDefinition: ElementDefinitionItem | null = null;

export function setGlobalDraggedDefinition(def: ElementDefinitionItem | null): void {
  globalDraggedDefinition = def;
}

export function getGlobalDraggedDefinition(): ElementDefinitionItem | null {
  return globalDraggedDefinition;
}

export interface DropIndicatorGeometry {
  type: "line" | "box";
  left: number;
  top: number;
  width: number;
  height: number;
  orientation?: "horizontal" | "vertical";
}

export interface DropTargetResult {
  allowed: boolean;
  reason?: string;
  parentId: ID;
  index: number;
  mode: DropMode;
  targetNodeId: ID;
  indicator: DropIndicatorGeometry;
}

export interface ComputeDropParams {
  clientX: number;
  clientY: number;
  viewportElement: HTMLElement;
  zoom: number;
  elements: Record<ID, TreeNode>;
  activePageRootId: ID;
  draggedItem: ElementDefinitionItem;
}

/**
 * Pure function to compute the exact drop target, insertion mode,
 * semantic validation, and indicator coordinates given client pointer coordinates.
 */
export function computeDropResult({
  clientX,
  clientY,
  viewportElement,
  zoom,
  elements,
  activePageRootId,
  draggedItem,
}: ComputeDropParams): DropTargetResult | null {
  const containerRect = viewportElement.getBoundingClientRect();
  const safeZoom = Math.max(0.01, zoom || 1);

  // 1. Gather all rendered DOM element nodes inside the canvas viewport
  const domNodes = Array.from(
    viewportElement.querySelectorAll<HTMLElement>("[data-node-id]")
  );

  // Find all elements whose bounding client rect contains the pointer
  const matchingDomElements: { dom: HTMLElement; nodeId: ID; rect: DOMRect }[] = [];

  for (const dom of domNodes) {
    const nodeId = dom.getAttribute("data-node-id") as ID;
    if (!nodeId || !elements[nodeId]) continue;

    const rect = dom.getBoundingClientRect();
    if (
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom
    ) {
      matchingDomElements.push({ dom, nodeId, rect });
    }
  }

  // 2. If no direct element was hovered or canvas is empty, fallback to active page root
  if (matchingDomElements.length === 0) {
    const rootNode = elements[activePageRootId] as ElementNode | undefined;
    const rootParentId = rootNode ? rootNode.id : activePageRootId;
    const rootChildrenLength = rootNode && rootNode.type === "element" ? rootNode.children.length : 0;

    const validation = canDropElementIntoParent(draggedItem, rootNode);
    const rootRect = getRelativeElementRect(containerRect, containerRect, safeZoom);

    return {
      allowed: validation.allowed,
      reason: validation.reason,
      parentId: rootParentId,
      index: rootChildrenLength,
      mode: "inside",
      targetNodeId: rootParentId,
      indicator: {
        type: "box",
        left: 8,
        top: 8,
        width: Math.max(40, rootRect.width - 16),
        height: Math.max(40, rootRect.height - 16),
      },
    };
  }

  // 3. Select the deepest/innermost matching DOM element (smallest area)
  matchingDomElements.sort((a, b) => {
    const areaA = a.rect.width * a.rect.height;
    const areaB = b.rect.width * b.rect.height;
    return areaA - areaB;
  });

  const hit = matchingDomElements[0];
  const hitNode = elements[hit.nodeId] as ElementNode | undefined;

  if (!hitNode || hitNode.type !== "element") {
    return null;
  }

  const isHitRoot = hit.nodeId === activePageRootId;
  const isHitVoid = isVoidElement(hitNode.tag);
  const isHitEmptyContainer = hitNode.children.length === 0 && !isHitVoid;

  // Determine if parent is flex row
  const parentNode = hitNode.parentId ? (elements[hitNode.parentId] as ElementNode | undefined) : null;
  const isParentFlexRow = parentNode?.type === "element" && parentNode.style?.flexDirection === "row";

  // Check if hit element should receive "inside" mode:
  // - Hit is root
  // - Hit is an empty container
  // - Pointer is within inner 40% margin of a container with children
  const relRect = getRelativeElementRect(hit.rect, containerRect, safeZoom);
  const relPointerX = (clientX - hit.rect.left) / safeZoom;
  const relPointerY = (clientY - hit.rect.top) / safeZoom;

  const isContainerTag = [
    "div",
    "section",
    "main",
    "header",
    "footer",
    "nav",
    "article",
    "aside",
    "form",
    "ul",
    "ol",
    "fieldset",
    "figure",
  ].includes(hitNode.tag);

  // When to drop INSIDE the hit node:
  if (isHitRoot || isHitEmptyContainer || (isContainerTag && hitNode.children.length === 0)) {
    const validation = canDropElementIntoParent(draggedItem, hitNode);
    return {
      allowed: validation.allowed,
      reason: validation.reason,
      parentId: hitNode.id,
      index: hitNode.children.length,
      mode: "inside",
      targetNodeId: hitNode.id,
      indicator: {
        type: "box",
        left: relRect.left + 2,
        top: relRect.top + 2,
        width: Math.max(30, relRect.width - 4),
        height: Math.max(30, relRect.height - 4),
      },
    };
  }

  // When hit node is a sibling inside a parent:
  // Decide 'before' vs 'after' relative to this child node
  const targetParent = parentNode || (elements[activePageRootId] as ElementNode);
  const targetParentId = targetParent ? targetParent.id : activePageRootId;
  const siblings = targetParent.type === "element" ? targetParent.children : [];
  const hitIndex = siblings.indexOf(hit.nodeId);
  const safeHitIndex = hitIndex !== -1 ? hitIndex : siblings.length;

  let mode: DropMode;
  let insertionIndex: number;
  let indicator: DropIndicatorGeometry;

  if (isParentFlexRow) {
    // Horizontal layout: left half is before, right half is after
    const isLeftHalf = relPointerX < relRect.width / 2;
    mode = isLeftHalf ? "before" : "after";
    insertionIndex = isLeftHalf ? safeHitIndex : safeHitIndex + 1;

    indicator = {
      type: "line",
      orientation: "vertical",
      left: isLeftHalf ? relRect.left : relRect.right,
      top: relRect.top,
      width: 3,
      height: relRect.height,
    };
  } else {
    // Vertical / Block layout: top half is before, bottom half is after
    const isTopHalf = relPointerY < relRect.height / 2;
    mode = isTopHalf ? "before" : "after";
    insertionIndex = isTopHalf ? safeHitIndex : safeHitIndex + 1;

    indicator = {
      type: "line",
      orientation: "horizontal",
      left: relRect.left,
      top: isTopHalf ? relRect.top : relRect.bottom,
      width: relRect.width,
      height: 3,
    };
  }

  const validation = canDropElementIntoParent(draggedItem, targetParent);

  return {
    allowed: validation.allowed,
    reason: validation.reason,
    parentId: targetParentId,
    index: insertionIndex,
    mode,
    targetNodeId: hit.nodeId,
    indicator,
  };
}
