// ============================================================
// store/project/selectors.ts
//
// Derived selectors and React hooks for querying project state
// without duplicating data into the persisted document model.
// ============================================================

import type { Breakpoint, ElementStyle, GSAPElementTrack, GSAPTimeline, ID, Project } from "@/types/project";
import { useShallow } from "zustand/react/shallow";
import { useProjectStore } from "./projectStore";

const FALLBACK_BREAKPOINT: Breakpoint = {
    id: "bp-desktop",
    name: "Desktop",
    minWidth: 1200,
    isDefault: true,
};

/**
 * Resolves the active breakpoint record, falling back to the project's
 * first breakpoint, then a hardcoded desktop default if the project has
 * none (e.g. a not-yet-fully-initialized document).
 */
export function resolveActiveBreakpoint(
    breakpoints: Breakpoint[],
    activeBreakpointId: ID | null
): Breakpoint {
    const match = breakpoints.find((b) => b.id === activeBreakpointId);
    return match || breakpoints[0] || FALLBACK_BREAKPOINT;
}

/**
 * Whether `breakpoint` is the base/desktop breakpoint that writes go to
 * `node.style` for, as opposed to `node.breakpointStyles[id]`. Falls back
 * to a width heuristic for breakpoints predating the explicit `isDefault`
 * flag.
 */
export function isDefaultBreakpoint(breakpoint: Breakpoint): boolean {
    return breakpoint.isDefault ?? breakpoint.minWidth >= 1200;
}

function styleReferencesCssVar(style: Partial<ElementStyle> | undefined, needle: string): boolean {
    if (!style) return false;
    return Object.values(style).some(
        (v) => typeof v === "string" && v.includes(needle)
    );
}

/**
 * Counts how many elements reference a design-token CSS var (e.g.
 * "--color-primary", or a shared prefix like "--typography-heading-" for
 * a token that expands to several sub-vars) anywhere in their style,
 * breakpoint overrides, interaction styles, or pseudo-elements. Used to
 * warn before deleting a token that's still in use, rather than letting
 * references silently go dangling.
 */
export function countElementsReferencingCssVar(
    elements: Project["elements"],
    needle: string
): number {
    let count = 0;

    for (const node of Object.values(elements)) {
        if (node.type !== "element") continue;

        const usesIt =
            styleReferencesCssVar(node.style, needle) ||
            Object.values(node.breakpointStyles || {}).some((s) => styleReferencesCssVar(s, needle)) ||
            (node.interactionStyles || []).some((rule) => styleReferencesCssVar(rule.style, needle)) ||
            Object.values(node.pseudoElements || {}).some((p) => styleReferencesCssVar(p?.style, needle));

        if (usesIt) count += 1;
    }

    return count;
}

/**
 * Returns all GSAP timelines that have an animation track targeting `nodeId`.
 */
export function selectTimelinesForNode(
    project: Project,
    nodeId: ID | null
): GSAPTimeline[] {
    if (!nodeId) return [];

    return Object.values(project.gsapTimelines).filter((timeline) =>
        timeline.tracks.some((track) => track.targetNodeId === nodeId)
    );
}

/**
 * Returns all tracks targeting `nodeId` along with their parent timeline.
 */
export function selectTracksForNode(
    project: Project,
    nodeId: ID | null
): Array<{ timeline: GSAPTimeline; track: GSAPElementTrack }> {
    if (!nodeId) return [];

    const results: Array<{ timeline: GSAPTimeline; track: GSAPElementTrack }> = [];

    for (const timeline of Object.values(project.gsapTimelines)) {
        for (const track of timeline.tracks) {
            if (track.targetNodeId === nodeId) {
                results.push({ timeline, track });
            }
        }
    }

    return results;
}

/**
 * React hook to get all timelines affecting a specific element node.
 *
 * Wrapped in useShallow: selectTimelinesForNode builds a fresh array every
 * call, which would otherwise fail Zustand's default Object.is check (and
 * re-render the consumer) on every store update even when the actual list
 * of timelines for this node hasn't changed.
 */
export function useNodeTimelines(nodeId: ID | null): GSAPTimeline[] {
    return useProjectStore(useShallow((state) => selectTimelinesForNode(state.project, nodeId)));
}

/**
 * React hook to get all tracks and timelines affecting a specific element
 * node. See useNodeTimelines above for why useShallow is needed here.
 */
export function useNodeTracks(
    nodeId: ID | null
): Array<{ timeline: GSAPTimeline; track: GSAPElementTrack }> {
    return useProjectStore(useShallow((state) => selectTracksForNode(state.project, nodeId)));
}
