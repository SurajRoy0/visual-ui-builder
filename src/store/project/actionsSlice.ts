// ============================================================
// store/project/actionsSlice.ts
// ============================================================

import type { StateCreator } from "zustand";

import type {
    Action,
    ActionConfigMap,
    ActionTrigger,
    ActionType,
    ID,
} from "@/types/project";

import type { ProjectStoreState } from "./storeTypes";

import { makeId } from "./utils";

export interface ActionsSlice {
    createAction: <T extends ActionType>(
        type: T,
        config: ActionConfigMap[T]
    ) => ID;

    updateAction: {
        <T extends ActionType>(
            actionId: ID,
            type: T,
            config: Partial<ActionConfigMap[T]>
        ): void;
        (
            actionId: ID,
            updater: (action: Action) => void
        ): void;
    };

    removeAction: (
        actionId: ID
    ) => void;

    bindAction: (
        nodeId: ID,
        trigger: ActionTrigger,
        actionId: ID
    ) => ID | null;

    unbindAction: (
        nodeId: ID,
        bindingId: ID
    ) => void;
}

export const createActionsSlice: StateCreator<
    ProjectStoreState,
    [],
    [],
    ActionsSlice
> = (_set, get) => ({
    // ==========================================================
    // Create action
    // ==========================================================

    createAction: (
        type,
        config
    ) => {
        const actionId =
            makeId("action");

        get().mutate((draft) => {
            const action = {
                id: actionId,
                type,
                config,
            } as Action;

            draft.actions[actionId] =
                action;
        });

        return actionId;
    },

    // ==========================================================
    // Update action
    // ==========================================================

    updateAction: ((
        actionId: ID,
        typeOrUpdater: ActionType | ((action: Action) => void),
        configPatch?: Partial<ActionConfigMap[ActionType]>
    ) => {
        get().mutate((draft) => {
            const action =
                draft.actions[
                actionId
                ];

            if (!action) {
                return;
            }

            if (typeof typeOrUpdater === "function") {
                typeOrUpdater(action);
                return;
            }

            if (action.type === typeOrUpdater && configPatch) {
                Object.assign(action.config, configPatch);
            }
        });
    }) as ActionsSlice["updateAction"],

    // ==========================================================
    // Remove action
    // ==========================================================

    removeAction: (
        actionId
    ) => {
        get().mutate((draft) => {
            delete draft.actions[
                actionId
            ];

            /**
             * Remove all bindings pointing
             * to the deleted action.
             */
            for (const node of Object.values(
                draft.elements
            )) {
                if (
                    node.type !== "element" ||
                    !node.actions
                ) {
                    continue;
                }

                node.actions =
                    node.actions.filter(
                        (binding) =>
                            binding.actionId !==
                            actionId
                    );
            }
        });
    },

    // ==========================================================
    // Bind action
    // ==========================================================

    bindAction: (
        nodeId,
        trigger,
        actionId
    ) => {
        const state = get();

        const node =
            state.project.elements[
            nodeId
            ];

        const action =
            state.project.actions[
            actionId
            ];

        if (
            !node ||
            node.type !== "element" ||
            !action
        ) {
            return null;
        }

        const bindingId =
            makeId("binding");

        get().mutate((draft) => {
            const draftNode =
                draft.elements[nodeId];

            if (
                !draftNode ||
                draftNode.type !==
                "element"
            ) {
                return;
            }

            if (!draftNode.actions) {
                draftNode.actions = [];
            }

            draftNode.actions.push({
                id: bindingId,
                trigger,
                actionId,
            });
        });

        return bindingId;
    },

    // ==========================================================
    // Unbind action
    // ==========================================================

    unbindAction: (
        nodeId,
        bindingId
    ) => {
        get().mutate((draft) => {
            const node =
                draft.elements[nodeId];

            if (
                !node ||
                node.type !== "element" ||
                !node.actions
            ) {
                return;
            }

            node.actions =
                node.actions.filter(
                    (binding) =>
                        binding.id !==
                        bindingId
                );
        });
    },
});