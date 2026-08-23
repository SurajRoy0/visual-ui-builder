// ============================================================
// lib/repository/projectRepository.ts
//
// IndexedDB implementation of the ProjectRepository interface.
// Components and stores interact exclusively through this interface,
// ensuring an easy swap for a cloud/backend API in the future.
// ============================================================

import { nanoid } from "nanoid";
import type { ID, Project, ProjectRepository, ProjectSummary } from "@/types/project";
import { createInitialProject } from "@/store/project/createInitialProject";

const DB_NAME = "playfull_db";
const DB_VERSION = 1;
const STORE_NAME = "projects";

/**
 * Helper to get or initialize the IndexedDB database instance.
 */
function openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined" || !window.indexedDB) {
            reject(new Error("IndexedDB is not supported or not available in this environment."));
            return;
        }

        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("updatedAt", "updatedAt", { unique: false });
                store.createIndex("name", "name", { unique: false });
            }
        };

        request.onsuccess = () => {
            resolve(request.result);
        };

        request.onerror = () => {
            reject(request.error || new Error("Failed to open IndexedDB database."));
        };
    });
}

export class IndexedDBProjectRepository implements ProjectRepository {
    async listProjects(): Promise<ProjectSummary[]> {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const projects = (request.result || []) as Project[];
                const summaries: ProjectSummary[] = projects.map((p) => ({
                    id: p.id,
                    name: p.name || "Untitled Project",
                    description: p.description || "",
                    updatedAt: p.updatedAt || p.createdAt || Date.now(),
                    createdAt: p.createdAt || Date.now(),
                }));

                // Sort newest first
                summaries.sort((a, b) => b.updatedAt - a.updatedAt);
                resolve(summaries);
            };

            request.onerror = () => {
                reject(request.error || new Error("Failed to list projects from IndexedDB."));
            };
        });
    }

    async createProject(details: { name: string; description?: string }): Promise<Project> {
        const id: ID = `proj_${nanoid(10)}`;
        const project = createInitialProject({
            id,
            name: details.name.trim() || "Untitled Project",
            description: details.description?.trim() || "",
        });

        await this.saveProject(project);
        return project;
    }

    async loadProject(id: ID): Promise<Project | null> {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readonly");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.get(id);

            request.onsuccess = () => {
                const result = request.result as Project | undefined;
                resolve(result || null);
            };

            request.onerror = () => {
                reject(request.error || new Error(`Failed to load project '${id}' from IndexedDB.`));
            };
        });
    }

    async saveProject(project: Project): Promise<void> {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);

            const projectToSave: Project = {
                ...project,
                updatedAt: Date.now(),
            };

            const request = store.put(projectToSave);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error || new Error(`Failed to save project '${project.id}' to IndexedDB.`));
            };
        });
    }

    async deleteProject(id: ID): Promise<void> {
        const db = await openDatabase();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(STORE_NAME, "readwrite");
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                resolve();
            };

            request.onerror = () => {
                reject(request.error || new Error(`Failed to delete project '${id}' from IndexedDB.`));
            };
        });
    }
}

// Singleton repository instance
let repositoryInstance: ProjectRepository | null = null;

export function getProjectRepository(): ProjectRepository {
    if (!repositoryInstance) {
        repositoryInstance = new IndexedDBProjectRepository();
    }
    return repositoryInstance;
}
