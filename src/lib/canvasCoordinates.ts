// ============================================================
// lib/canvasCoordinates.ts
//
// Pure coordinate conversion utilities for the visual editor.
// Converts Screen/Client (clientX, clientY) coordinates into
// Canvas/Document space, accounting for:
// - Zoom scale
// - Viewport container bounding rect
// - Scroll offsets
// ============================================================

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
  right: number;
  bottom: number;
}

/**
 * Converts a screen/client pointer coordinate (e.g. e.clientX, e.clientY)
 * into coordinate space relative to the simulated viewport element.
 *
 * @param screenPoint - The raw browser client point { x, y }
 * @param containerRect - The bounding rect of the viewport element (from getBoundingClientRect())
 * @param zoom - The active canvas zoom factor (e.g. 1.0, 0.75, 1.5)
 */
export function screenToCanvasDocument(
  screenPoint: Point,
  containerRect: DOMRect | Rect,
  zoom: number
): Point {
  const safeZoom = Math.max(0.01, zoom || 1);
  return {
    x: (screenPoint.x - containerRect.left) / safeZoom,
    y: (screenPoint.y - containerRect.top) / safeZoom,
  };
}

/**
 * Converts a screen-space delta (e.g. a pointermove distance in raw
 * client pixels) into document-space, accounting for zoom. The scalar
 * counterpart to screenToCanvasDocument's point conversion — for drags
 * that only need "how far did the pointer move," not a full position.
 */
export function screenDeltaToDocumentDelta(screenDelta: number, zoom: number): number {
  const safeZoom = Math.max(0.01, zoom || 1);
  return screenDelta / safeZoom;
}

/**
 * Checks if a point is within a given rectangle.
 */
export function isPointInsideRect(point: Point, rect: Rect): boolean {
  return (
    point.x >= rect.left &&
    point.x <= rect.right &&
    point.y >= rect.top &&
    point.y <= rect.bottom
  );
}

/**
 * Calculates the bounding box of an element in document coordinate space
 * relative to the canvas container origin.
 */
export function getRelativeElementRect(
  elementRect: DOMRect | Rect,
  canvasContainerRect: DOMRect | Rect,
  zoom: number
): Rect {
  const safeZoom = Math.max(0.01, zoom || 1);
  const left = (elementRect.left - canvasContainerRect.left) / safeZoom;
  const top = (elementRect.top - canvasContainerRect.top) / safeZoom;
  const width = elementRect.width / safeZoom;
  const height = elementRect.height / safeZoom;

  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}
