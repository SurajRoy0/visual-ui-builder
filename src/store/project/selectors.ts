// ============================================================
// store/project/selectors.ts
//
// Derived selectors and React hooks for querying project state
// without duplicating data into the persisted document model.
// ============================================================

import type { GSAPElementTrack, GSAPTimeline, ID, Project } from "@/types/project";
import { useProjectStore } from "./projectStore";

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
 */
export function useNodeTimelines(nodeId: ID | null): GSAPTimeline[] {
    return useProjectStore((state) => selectTimelinesForNode(state.project, nodeId));
}

/**
 * React hook to get all tracks and timelines affecting a specific element node.
 */
export function useNodeTracks(
    nodeId: ID | null
): Array<{ timeline: GSAPTimeline; track: GSAPElementTrack }> {
    return useProjectStore((state) => selectTracksForNode(state.project, nodeId));
}
