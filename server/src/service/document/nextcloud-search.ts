// src/documents/NextcloudSearch.ts
import {FileStat, WebDAVClient} from "webdav";

export interface FoundFile {
    filename: string;
    path: string;
}

export interface SearchResult {
    found: boolean;
    files: FoundFile[];
}

// ─── Cache ────────────────────────────────────────────────────────────────────

interface CacheEntry {
    files: FoundFile[];
    fetchedAt: number;
}

// ─── NextcloudSearch ──────────────────────────────────────────────────────────

export class NextCloudSearch {
    /**
     * Sucht Dateien deren Name mit `{docId}_` beginnt.
     * Lädt den Ordnerinhalt via PROPFIND und cached ihn.
     *
     * @param docId      Die Dokument-ID (z.B. "12345")
     * @param searchPath Ordner in dem gesucht wird (z.B. "/Angebotsausgang/PDF")
     */
    private readonly client: WebDAVClient;
    private readonly cache = new Map<string, CacheEntry>();
    private readonly cacheTtlMs: number;

    constructor(client: WebDAVClient, cacheTtlSeconds = 60) {
        this.client = client;
        this.cacheTtlMs = cacheTtlSeconds * 1000;
    }

    async reserve(id: string, path: string): Promise<void> {
        try {
            await this.client.putFileContents(`${path}/${id}.lock`, JSON.stringify({
                reservedAt: new Date().toISOString(),
                status: "pending"
            }), {
                overwrite: false,
                headers: {"Content-Type": "application/json"}
            });
        } catch (exception: any) {
            if (exception?.status === 412 || exception?.status === 405) {
                throw new Error("DUPLICATED");
            }

            throw exception;
        }
    }

    async findById(id: string, searchPath: string): Promise<SearchResult> {
        const allFiles = await this.listDirectory(searchPath);
        const prefix = `${id}_`;
        const matched = allFiles.filter((f) => f.filename.startsWith(prefix));

        return {found: matched.length > 0, files: matched};
    }

    async idExists(docId: string, searchPath: string): Promise<boolean> {
        const result = await this.findById(docId, searchPath);
        return result.found;
    }

    /**
     * Cache für einen bestimmten Ordner invalidieren —
     * aufrufen nachdem ein Upload in diesen Ordner stattgefunden hat.
     */
    invalidate(searchPath: string): void {
        this.cache.delete(searchPath);
    }

    private async listDirectory(path: string): Promise<FoundFile[]> {
        const cached = this.cache.get(path);
        const now = Date.now();

        if (cached && now - cached.fetchedAt < this.cacheTtlMs) {
            return cached.files;
        }

        // PROPFIND Depth:1 — nur direkter Inhalt, keine Rekursion
        const contents: FileStat[] = await this.client.getDirectoryContents(path, {
            deep: false,
        }) as FileStat[];

        const files: FoundFile[] = contents
            .filter((f) => f.type === "file")
            .map((f) => ({
                filename: f.basename,
                path: f.filename,
            }));

        this.cache.set(path, {files, fetchedAt: now});
        return files;
    }
}