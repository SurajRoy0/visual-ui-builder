// ============================================================
// store/project/animationSlice.ts
//
// CSS keyframe animations live on the element (ElementNode.animation).
//
// GSAP timelines live globally on Project.gsapTimelines.
//
// A timeline contains element tracks (GSAPElementTrack), where
// GSAPElementTrack.targetNodeId is the SINGLE SOURCE OF TRUTH
// for timeline-to-element mapping. Reverse lookups are computed
// dynamically via derived selectors.
// ============================================================

import type { StateCreator } from "zustand";

import type {
    CSSKeyframeAnimation,
    GSAPElementTrack,
    GSAPKeyframe,
    GSAPTimeline,
    GSAPTimelineTrigger,
    ID,
} from "@/types/project";

import type { ProjectStoreState } from "./storeTypes";

import { makeId } from "./utils";

export interface AnimationSlice {
    // ==========================================================
    // CSS keyframe animations
    // ==========================================================

    addCssKeyframeAnimation: (
        nodeId: ID,
        animation: Omit<
            CSSKeyframeAnimation,
            "id"
        >
    ) => ID | null;

    updateCssKeyframeAnimation: (
        nodeId: ID,
        animationId: ID,
        patch: Partial<
            Omit<CSSKeyframeAnimation, "id">
        >
    ) => void;

    removeCssKeyframeAnimation: (
        nodeId: ID,
        animationId: ID
    ) => void;

    // ==========================================================
    // GSAP timelines
    // ==========================================================

    createTimeline: (params: {
        name: string;
        trigger: GSAPTimelineTrigger;
    }) => ID;

    removeTimeline: (
        timelineId: ID
    ) => void;

    updateTimelineMeta: (
        timelineId: ID,
        patch: Partial<
            Omit<
                GSAPTimeline,
                "id" | "tracks"
            >
        >
    ) => void;

    // ==========================================================
    // Timeline ↔ Element relationship (Single Source of Truth)
    // ==========================================================

    addTimelineTrack: (
        timelineId: ID,
        targetNodeId: ID
    ) => ID | null;

    removeTimelineTrack: (
        timelineId: ID,
        trackId: ID
    ) => void;

    // ==========================================================
    // Keyframes
    // ==========================================================

    addKeyframe: (
        timelineId: ID,
        trackId: ID,
        keyframe: Omit<
            GSAPKeyframe,
            "id"
        >
    ) => ID | null;

    updateKeyframe: (
        timelineId: ID,
        trackId: ID,
        keyframeId: ID,
        patch: Partial<
            Omit<GSAPKeyframe, "id">
        >
    ) => void;

    removeKeyframe: (
        timelineId: ID,
        trackId: ID,
        keyframeId: ID
    ) => void;

    // ==========================================================
    // Relationship convenience helpers
    // ==========================================================

    attachTimelineToNode: (
        nodeId: ID,
        timelineId: ID
    ) => void;

    detachTimelineFromNode: (
        nodeId: ID,
        timelineId: ID
    ) => void;
}

export const createAnimationSlice: StateCreator<
    ProjectStoreState,
    [],
    [],
    AnimationSlice
> = (_set, get) => ({
    // ==========================================================
    // CSS KEYFRAME ANIMATION
    // ==========================================================

    addCssKeyframeAnimation: (
        nodeId,
        animation
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

        const animationId =
            makeId("keyframeanim");

        get().mutate((draft) => {
            const draftNode =
                draft.elements[nodeId];

            if (
                !draftNode ||
                draftNode.type !== "element"
            ) {
                return;
            }

            if (!draftNode.animation) {
                draftNode.animation = {};
            }

            if (
                !draftNode.animation
                    .cssKeyframeAnimations
            ) {
                draftNode.animation
                    .cssKeyframeAnimations = [];
            }

            draftNode.animation
                .cssKeyframeAnimations.push({
                    id: animationId,
                    ...animation,
                });
        });

        return animationId;
    },

    // ==========================================================
    // UPDATE CSS KEYFRAME ANIMATION
    // ==========================================================

    updateCssKeyframeAnimation: (
        nodeId,
        animationId,
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

            const animations =
                node.animation
                    ?.cssKeyframeAnimations;

            const animation =
                animations?.find(
                    (item) =>
                        item.id === animationId
                );

            if (animation) {
                Object.assign(
                    animation,
                    patch
                );
            }
        });
    },

    // ==========================================================
    // REMOVE CSS KEYFRAME ANIMATION
    // ==========================================================

    removeCssKeyframeAnimation: (
        nodeId,
        animationId
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element" ||
                !node.animation
                    ?.cssKeyframeAnimations
            ) {
                return;
            }

            node.animation
                .cssKeyframeAnimations =
                node.animation
                    .cssKeyframeAnimations
                    .filter(
                        (item) =>
                            item.id !== animationId
                    );
        });
    },

    // ==========================================================
    // CREATE TIMELINE
    // ==========================================================

    createTimeline: ({
        name,
        trigger,
    }) => {
        const timelineId =
            makeId("timeline");

        get().mutate((draft) => {
            const timeline: GSAPTimeline = {
                id: timelineId,
                name,
                trigger,
                tracks: [],
            };

            draft.gsapTimelines[
                timelineId
            ] = timeline;
        });

        return timelineId;
    },

    // ==========================================================
    // REMOVE TIMELINE
    // ==========================================================

    removeTimeline: (
        timelineId
    ) => {
        get().mutate((draft) => {
            delete draft.gsapTimelines[
                timelineId
            ];
        });
    },

    // ==========================================================
    // UPDATE TIMELINE META
    // ==========================================================

    updateTimelineMeta: (
        timelineId,
        patch
    ) => {
        get().mutate((draft) => {
            const timeline =
                draft.gsapTimelines[
                timelineId
                ];

            if (!timeline) {
                return;
            }

            Object.assign(
                timeline,
                patch
            );
        });
    },

    // ==========================================================
    // ADD TIMELINE TRACK (Single Source of Truth)
    // ==========================================================

    addTimelineTrack: (
        timelineId,
        targetNodeId
    ) => {
        const state = get();

        const timeline =
            state.project.gsapTimelines[
            timelineId
            ];

        const node =
            state.project.elements[
            targetNodeId
            ];

        if (!timeline || !node) {
            return null;
        }

        // Prevent duplicate track for the same element in this timeline
        if (
            timeline.tracks.some(
                (track) =>
                    track.targetNodeId ===
                    targetNodeId
            )
        ) {
            return null;
        }

        const trackId =
            makeId("track");

        get().mutate((draft) => {
            const draftTimeline =
                draft.gsapTimelines[
                timelineId
                ];

            if (!draftTimeline) {
                return;
            }

            if (
                draftTimeline.tracks.some(
                    (track) =>
                        track.targetNodeId ===
                        targetNodeId
                )
            ) {
                return;
            }

            const track: GSAPElementTrack = {
                id: trackId,
                targetNodeId,
                keyframes: [],
            };

            draftTimeline.tracks.push(
                track
            );
        });

        return trackId;
    },

    // ==========================================================
    // REMOVE TIMELINE TRACK
    // ==========================================================

    removeTimelineTrack: (
        timelineId,
        trackId
    ) => {
        get().mutate((draft) => {
            const timeline =
                draft.gsapTimelines[
                timelineId
                ];

            if (!timeline) {
                return;
            }

            timeline.tracks =
                timeline.tracks.filter(
                    (item) =>
                        item.id !== trackId
                );
        });
    },

    // ==========================================================
    // ADD KEYFRAME
    // ==========================================================

    addKeyframe: (
        timelineId,
        trackId,
        keyframe
    ) => {
        const state = get();

        const track =
            state.project
                .gsapTimelines[
                timelineId
            ]?.tracks.find(
                (item) =>
                    item.id === trackId
            );

        if (!track) {
            return null;
        }

        const keyframeId =
            makeId("kf");

        get().mutate((draft) => {
            const draftTrack =
                draft.gsapTimelines[
                    timelineId
                ]?.tracks.find(
                    (item) =>
                        item.id === trackId
                );

            if (!draftTrack) {
                return;
            }

            draftTrack.keyframes.push({
                id: keyframeId,
                ...keyframe,
            });

            draftTrack.keyframes.sort(
                (a, b) =>
                    a.time - b.time
            );
        });

        return keyframeId;
    },

    // ==========================================================
    // UPDATE KEYFRAME
    // ==========================================================

    updateKeyframe: (
        timelineId,
        trackId,
        keyframeId,
        patch
    ) => {
        get().mutate((draft) => {
            const track =
                draft.gsapTimelines[
                    timelineId
                ]?.tracks.find(
                    (item) =>
                        item.id === trackId
                );

            if (!track) {
                return;
            }

            const keyframe =
                track.keyframes.find(
                    (item) =>
                        item.id ===
                        keyframeId
                );

            if (!keyframe) {
                return;
            }

            Object.assign(
                keyframe,
                patch
            );

            if (
                patch.time !== undefined
            ) {
                track.keyframes.sort(
                    (a, b) =>
                        a.time - b.time
                );
            }
        });
    },

    // ==========================================================
    // REMOVE KEYFRAME
    // ==========================================================

    removeKeyframe: (
        timelineId,
        trackId,
        keyframeId
    ) => {
        get().mutate((draft) => {
            const track =
                draft.gsapTimelines[
                    timelineId
                ]?.tracks.find(
                    (item) =>
                        item.id === trackId
                );

            if (!track) {
                return;
            }

            track.keyframes =
                track.keyframes.filter(
                    (item) =>
                        item.id !== keyframeId
                );
        });
    },

    // ==========================================================
    // RELATIONSHIP CONVENIENCE HELPERS
    // ==========================================================

    attachTimelineToNode: (
        nodeId,
        timelineId
    ) => {
        get().addTimelineTrack(timelineId, nodeId);
    },

    detachTimelineFromNode: (
        nodeId,
        timelineId
    ) => {
        const state = get();
        const timeline = state.project.gsapTimelines[timelineId];
        if (!timeline) return;

        const track = timeline.tracks.find(
            (t) => t.targetNodeId === nodeId
        );
        if (track) {
            get().removeTimelineTrack(timelineId, track.id);
        }
    },
});