// ============================================================
// hooks/useAutosave.ts
//
// Autosave hook that subscribes specifically to project changes,
// debounces persistence to IndexedDB, and flushes on unmount/unload.
// Keeps ephemeral save status out of the ProjectStore.
// ============================================================

import { useEffect, useRef, useState, useCallback } from "react";
import { useProjectStore } from "@/store/project";
import { getProjectRepository } from "@/lib/repository/projectRepository";
import type { Project } from "@/types/project";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutosaveOptions {
    debounceMs?: number;
    enabled?: boolean;
}

export function useAutosave(options: UseAutosaveOptions = {}) {
    const { debounceMs = 600, enabled = true } = options;

    const [status, setStatus] = useState<SaveStatus>("idle");
    const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);

    const pendingProjectRef = useRef<Project | null>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isMountedRef = useRef(true);

    const repository = getProjectRepository();

    const executeSave = useCallback(
        async (projectToSave: Project) => {
            try {
                if (isMountedRef.current) {
                    setStatus("saving");
                }
                await repository.saveProject(projectToSave);
                if (isMountedRef.current) {
                    setStatus("saved");
                    setLastSavedAt(Date.now());
                }
            } catch (err) {
                console.error("Autosave failed:", err);
                if (isMountedRef.current) {
                    setStatus("error");
                }
            }
        },
        [repository]
    );

    const saveNow = useCallback(async () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
            debounceTimerRef.current = null;
        }

        const project = pendingProjectRef.current || useProjectStore.getState().project;
        if (project) {
            pendingProjectRef.current = null;
            await executeSave(project);
        }
    }, [executeSave]);

    useEffect(() => {
        isMountedRef.current = true;

        if (!enabled) return;

        // Subscribe specifically to state.project reference changes
        let lastProject = useProjectStore.getState().project;

        const unsubscribe = useProjectStore.subscribe((state) => {
            const currentProject = state.project;
            if (currentProject !== lastProject) {
                lastProject = currentProject;
                pendingProjectRef.current = currentProject;

                if (isMountedRef.current) {
                    setStatus("saving");
                }

                if (debounceTimerRef.current) {
                    clearTimeout(debounceTimerRef.current);
                }

                debounceTimerRef.current = setTimeout(() => {
                    if (pendingProjectRef.current) {
                        const toSave = pendingProjectRef.current;
                        pendingProjectRef.current = null;
                        executeSave(toSave);
                    }
                }, debounceMs);
            }
        });

        // Flush on beforeunload
        const handleBeforeUnload = () => {
            if (pendingProjectRef.current) {
                // Immediate synchronous/asynchronous write attempt
                repository.saveProject(pendingProjectRef.current).catch(console.error);
            }
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        return () => {
            isMountedRef.current = false;
            unsubscribe();
            window.removeEventListener("beforeunload", handleBeforeUnload);

            // Flush pending changes on unmount
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
            if (pendingProjectRef.current) {
                repository.saveProject(pendingProjectRef.current).catch(console.error);
            }
        };
    }, [debounceMs, enabled, executeSave, repository]);

    return {
        status,
        lastSavedAt,
        saveNow,
    };
}
