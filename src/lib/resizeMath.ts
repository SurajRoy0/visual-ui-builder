// ============================================================
// lib/resizeMath.ts
//
// Pure resize calculations for 8-directional resize handles:
// - n, s, e, w, ne, nw, se, sw
// - Accounts for canvas zoom factor
// - Clamps to minimum & maximum constraints
// ============================================================

export type ResizeHandleDirection =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

export interface InitialBounds {
  width: number;
  height: number;
  left: number;
  top: number;
}

export interface ResizeDelta {
  dx: number;
  dy: number;
}

export interface ComputedResizeResult {
  width: number;
  height: number;
  leftDelta: number;
  topDelta: number;
}

export interface ComputeResizeParams {
  direction: ResizeHandleDirection;
  initialBounds: InitialBounds;
  delta: ResizeDelta;
  zoom: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

/**
 * Pure function to compute updated dimensions from handle direction and pointer delta.
 */
export function computeResize({
  direction,
  initialBounds,
  delta,
  zoom,
  minWidth = 16,
  minHeight = 16,
  maxWidth = 4000,
  maxHeight = 4000,
}: ComputeResizeParams): ComputedResizeResult {
  const safeZoom = Math.max(0.01, zoom || 1);
  const docDx = delta.dx / safeZoom;
  const docDy = delta.dy / safeZoom;

  let newWidth = initialBounds.width;
  let newHeight = initialBounds.height;
  let leftDelta = 0;
  let topDelta = 0;

  // Horizontal calculation
  if (direction.includes("e")) {
    newWidth = Math.min(
      maxWidth,
      Math.max(minWidth, Math.round(initialBounds.width + docDx))
    );
  } else if (direction.includes("w")) {
    const rawWidth = Math.round(initialBounds.width - docDx);
    newWidth = Math.min(maxWidth, Math.max(minWidth, rawWidth));
    leftDelta = initialBounds.width - newWidth;
  }

  // Vertical calculation
  if (direction.includes("s")) {
    newHeight = Math.min(
      maxHeight,
      Math.max(minHeight, Math.round(initialBounds.height + docDy))
    );
  } else if (direction.includes("n")) {
    const rawHeight = Math.round(initialBounds.height - docDy);
    newHeight = Math.min(maxHeight, Math.max(minHeight, rawHeight));
    topDelta = initialBounds.height - newHeight;
  }

  return {
    width: newWidth,
    height: newHeight,
    leftDelta,
    topDelta,
  };
}

/**
 * Formats dimension tooltip string (e.g. "480 × 320 px").
 */
export function formatDimensions(width: number, height: number): string {
  return `${Math.round(width)} × ${Math.round(height)} px`;
}
