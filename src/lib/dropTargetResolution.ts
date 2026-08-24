// ============================================================
// lib/dropTargetResolution.ts
//
// Drop-target resolution for Phase 4, split into two layers:
//
// - gatherDropContext(): the ONLY DOM-touching function here.
//   Walks the rendered viewport and returns plain-data rects
//   (+ resolved flex-row-ness) for every candidate node.
// - computeDropResult(): pure — takes pointer coordinates and the
//   gathered candidates, returns the drop decision. No DOM access,
//   so it's directly unit-testable with plain numbers/rects.
//
// Decides target parent + insertion index, 'inside' | 'before' |
// 'after' mode, semantic validation via canDropElementIntoParent,
// and indicator geometry for the visual overlay.
// ============================================================

import type { ElementNode, HTMLTagName, ID, TreeNode } from "@/types/project";
import type { ElementDefinitionItem } from "./elementDefinitions";
import { canDropElementIntoParent, isVoidElement } from "./elementRules";
import { getRelativeElementRect, screenToCanvasDocument, type Rect } from "./canvasCoordinates";

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

/** One rendered node's geometry + resolved layout, as plain data (no DOM handle). */
export interface DropCandidate {
  nodeId: ID;
  rect: Rect;
  /** Whether this node's own container lays its children out as a row. */
  isFlexRow: boolean;
}

export interface GatheredDropContext {
  containerRect: Rect;
  candidates: DropCandidate[];
}

/**
 * Pure: inspects a node's own JSON style for explicit flex-row-ness.
 * Returns null when the style doesn't declare it either way — callers
 * fall back to computed style (DOM-dependent) only in that case.
 */
function resolveFlexRowFromStyle(node: ElementNode | null | undefined): boolean | null {
  if (!node) return null;
  const style = node.style || {};
  if (style.flexDirection === "column" || style.flexDirection === "column-reverse") return false;
  if (style.flexDirection === "row" || style.flexDirection === "row-reverse") return true;
  if (style.display === "flex" || style.display === "inline-flex") return true;
  return null;
}

/**
 * IMPURE — the only function in this module that touches the DOM.
 * Collects every rendered node's rect inside the viewport, resolving
 * flex-row-ness from the node's own style first and falling back to
 * computed style only when that's inconclusive (e.g. flex applied via
 * a Tailwind class rather than the node's JSON style).
 */
export function gatherDropContext(
  viewportElement: HTMLElement,
  elements: Record<ID, TreeNode>
): GatheredDropContext {
  const containerRect = viewportElement.getBoundingClientRect();
  const domNodes = Array.from(
    viewportElement.querySelectorAll<HTMLElement>("[data-node-id]")
  );

  const candidates: DropCandidate[] = [];

  for (const dom of domNodes) {
    const nodeId = dom.getAttribute("data-node-id") as ID;
    const node = elements[nodeId] as ElementNode | undefined;
    if (!nodeId || !node) continue;

    let isFlexRow = resolveFlexRowFromStyle(node);
    if (isFlexRow === null) {
      try {
        const computed = window.getComputedStyle(dom);
        isFlexRow =
          (computed.display === "flex" || computed.display === "inline-flex") &&
          !computed.flexDirection.includes("column");
      } catch {
        isFlexRow = false;
      }
    }

    candidates.push({ nodeId, rect: dom.getBoundingClientRect(), isFlexRow });
  }

  return { containerRect, candidates };
}

export interface ComputeDropParams {
  clientX: number;
  clientY: number;
  containerRect: Rect;
  candidates: DropCandidate[];
  zoom: number;
  elements: Record<ID, TreeNode>;
  activePageRootId: ID;
  /**
   * A toolbox definition (creating a new node) or a bare tag (moving an
   * existing one) — canDropElementIntoParent accepts either.
   */
  draggedItem: ElementDefinitionItem | HTMLTagName;
  /**
   * Node ids to treat as if they weren't rendered at all — used when
   * dragging an EXISTING node so it (and its own descendants) can't be
   * offered as a drop target for itself.
   */
  excludeNodeIds?: ReadonlySet<ID>;
}

const CONTAINER_TAGS = [
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
];

/**
 * Pure function to compute the exact drop target, insertion mode,
 * semantic validation, and indicator coordinates given pointer
 * coordinates and pre-gathered candidate rects. No DOM access —
 * testable with plain numbers and fabricated candidates.
 */
export function computeDropResult({
  clientX,
  clientY,
  containerRect,
  candidates,
  zoom,
  elements,
  activePageRootId,
  draggedItem,
  excludeNodeIds,
}: ComputeDropParams): DropTargetResult | null {
  const safeZoom = Math.max(0.01, zoom || 1);

  // 1. Find all candidates whose rect contains the pointer
  const matching = candidates.filter(
    (c) =>
      !excludeNodeIds?.has(c.nodeId) &&
      clientX >= c.rect.left &&
      clientX <= c.rect.right &&
      clientY >= c.rect.top &&
      clientY <= c.rect.bottom
  );

  // 2. If no direct element was hovered or canvas is empty, fallback to active page root
  if (matching.length === 0) {
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

  // 3. Select the deepest/innermost matching candidate (smallest area)
  matching.sort((a, b) => a.rect.width * a.rect.height - b.rect.width * b.rect.height);

  const hit = matching[0];
  const hitNode = elements[hit.nodeId] as ElementNode | undefined;

  if (!hitNode || hitNode.type !== "element") {
    return null;
  }

  const isHitRoot = hit.nodeId === activePageRootId;
  const isHitVoid = isVoidElement(hitNode.tag);
  const isHitEmptyContainer = hitNode.children.length === 0 && !isHitVoid;
  const isContainerTag = CONTAINER_TAGS.includes(hitNode.tag);

  const parentNode = hitNode.parentId ? (elements[hitNode.parentId] as ElementNode | undefined) : null;
  const parentCandidate = parentNode ? candidates.find((c) => c.nodeId === parentNode.id) : undefined;
  const isParentFlexRow = parentCandidate?.isFlexRow ?? false;

  const relRect = getRelativeElementRect(hit.rect, containerRect, safeZoom);
  const relPointer = screenToCanvasDocument({ x: clientX, y: clientY }, hit.rect, safeZoom);
  const relPointerX = relPointer.x;
  const relPointerY = relPointer.y;

  // When hit node is root, or empty, allow dropping INSIDE the container.
  if (isHitRoot || isHitEmptyContainer) {
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

  // When hit node is a container with children and cursor is near the edge/empty area of the container
  if (isContainerTag && !isHitVoid && hitNode.children.length > 0) {
    const isInnerContainerFlexRow = hit.isFlexRow;
    const isAtEnd = isInnerContainerFlexRow
      ? relPointerX > relRect.width * 0.75
      : relPointerY > relRect.height * 0.75;

    // If cursor is deep inside the container (not directly hovering an existing child's tight bounds)
    if (isAtEnd) {
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
