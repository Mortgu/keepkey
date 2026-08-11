import { createClient, FileStat, type WebDAVClient } from "webdav";
import { Readable } from "stream";
import env from "./env.js";
import logger from "@/utils/logger.js";
import { AppException } from "./exceptions.js";

let client: WebDAVClient | null = null;
export let isNextcloudAvailable = false;
let nextcloudInitError: string | null = null;

type DirectoryCache = {
    data: FileStat[];
    timestamp: number;
};

const directoryCache = new Map<string, DirectoryCache>();
const CACHE_TTL = 60_000;

export type NextcloudFileMetadata = {
    basename: string;
    filename: string;
    size: number;
    lastmod: string;
    mime: string | null;
};

export type FindFilesByIdResult = {
    id: string;
    found: boolean;
    files: Record<string, NextcloudFileMetadata[]>;
    /** false, wenn mindestens ein Verzeichnis nicht gelesen werden konnte — `found` ist dann kein Beweis. */
    complete: boolean;
};

/** Alle belegten Praefixe aus einer Verzeichnisgruppe. */
export type ListUsedIdsResult = {
    ids: Set<string>;
    /** false, wenn mindestens ein Verzeichnis nicht gelesen werden konnte. */
    complete: boolean;
};

type DirectoryConfig = {
    path: string;
    label: string;
};

async function getCachedDirectoryContents(path: string): Promise<FileStat[]> {
    const cached = directoryCache.get(path);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.data;
    }

    const ncClient = getNextCloudClient();
    const contents: FileStat[] = await ncClient.getDirectoryContents(path);
    directoryCache.set(path, { data: contents, timestamp: Date.now() });
    return contents;
}

export function clearDirectoryCache(path?: string): void {
    if (path) {
        directoryCache.delete(path);
    } else {
        directoryCache.clear();
    }
}

export async function findFilesById(
    id: string,
    directories: DirectoryConfig[]
): Promise<FindFilesByIdResult> {
    const files: Record<string, NextcloudFileMetadata[]> = {};
    let anyFound = false;
    let complete = true;

    const results = await Promise.all(
        directories.map(async (dir) => {
            try {
                const contents = await getCachedDirectoryContents(dir.path);
                const matches = contents.filter(
                    (f) => f.type === "file" && f.basename.startsWith(`${id}_`)
                );
                return { label: dir.label, matches, ok: true };
            } catch (exception: any) {
                logger.error('nextcloud_find_files_error', { label: dir.label, error: exception.message });
                return { label: dir.label, matches: [] as FileStat[], ok: false };
            }
        })
    );

    for (const { label, matches, ok } of results) {
        files[label] = matches.map((f) => ({
            basename: f.basename,
            filename: f.filename,
            size: f.size,
            lastmod: f.lastmod,
            mime: (f as any).mime ?? null,
        }));
        if (matches.length > 0) anyFound = true;
        if (!ok) complete = false;
    }

    return { id, found: anyFound, files, complete };
}

/**
 * Sammelt alle Praefixe, die in den angegebenen Verzeichnissen bereits als Dateiname vergeben sind.
 *
 * Gegenstueck zu `findFilesById`: statt eine bekannte Nummer zu suchen, wird der gesamte Bestand
 * einmal gelesen, damit der Nummernkreis-Allocator ohne N Einzelabfragen auskommt. Ein nicht
 * lesbares Verzeichnis wird geloggt und ueber `complete: false` gemeldet — der Aufrufer entscheidet,
 * ob er mit einem unvollstaendigen Bild weiterarbeitet.
 */
export async function listUsedIdsInDirectories(
    directories: DirectoryConfig[],
    pattern: RegExp,
): Promise<ListUsedIdsResult> {
    const ids = new Set<string>();
    let complete = true;

    // Ein /g-Pattern haette einen wandernden lastIndex und wuerde bei jedem zweiten
    // Dateinamen danebengreifen — deshalb hier entschaerfen statt darauf zu vertrauen.
    const matcher = pattern.global
        ? new RegExp(pattern.source, pattern.flags.replace("g", ""))
        : pattern;

    const results = await Promise.all(
        directories.map(async (dir) => {
            try {
                const contents = await getCachedDirectoryContents(dir.path);
                return { label: dir.label, contents, ok: true };
            } catch (exception: any) {
                logger.error('nextcloud_list_used_ids_error', { label: dir.label, error: exception.message });
                return { label: dir.label, contents: [] as FileStat[], ok: false };
            }
        })
    );

    for (const { contents, ok } of results) {
        if (!ok) {
            complete = false;
            continue;
        }

        for (const file of contents) {
            if (file.type !== "file") continue;

            const match = matcher.exec(file.basename);
            if (match?.[1]) ids.add(match[1]);
        }
    }

    return { ids, complete };
}

export function isNextcloudConfigured(): boolean {
    return Boolean(env.NEXTCLOUD_URL && env.NEXTCLOUD_USER && env.NEXTCLOUD_PASSWORD);
}

export function getNextcloudInitError(): string | null {
    return nextcloudInitError;
}

export async function initNextcloud(): Promise<boolean> {
    if (!isNextcloudConfigured()) {
        nextcloudInitError = "Nextcloud is not configured. Set NEXTCLOUD_URL, NEXTCLOUD_USER, and NEXTCLOUD_PASSWORD.";
        isNextcloudAvailable = false;
        return false;
    }

    try {
        const testClient = createClient(`${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`, {
            username: env.NEXTCLOUD_USER,
            password: env.NEXTCLOUD_PASSWORD,
        });
        await testClient.getDirectoryContents("/");
        isNextcloudAvailable = true;
        nextcloudInitError = null;
        logger.info('nextcloud_connected');
        return true;
    } catch (exception: any) {
        isNextcloudAvailable = false;
        nextcloudInitError = `Nextcloud connection failed: ${exception.message}`;
        logger.error('nextcloud_connection_failed', { error: exception.message });
        return false;
    }
}

export function getNextCloudClient(): WebDAVClient {
    if (!isNextcloudConfigured()) {
        throw new AppException("Nextcloud is not configured!", 503, "NEXTCLOUD_NOT_CONFIGURED");
    }
    if (!isNextcloudAvailable) {
        throw new AppException("Nextcloud is not available!", 503, "NEXTCLOUD_UNAVAILABLE");
    }
    if (!client) {
        client = createClient(`${env.NEXTCLOUD_URL}/remote.php/dav/files/${env.NEXTCLOUD_USER}/`, {
            username: env.NEXTCLOUD_USER,
            password: env.NEXTCLOUD_PASSWORD,
        });
    }
    return client;
}

export async function fileExists(filePath: string): Promise<boolean> {
    if (!isNextcloudAvailable) {
        throw new AppException("Nextcloud is not available!", 503, "NEXTCLOUD_UNAVAILABLE");
    }
    try {
        await getNextCloudClient().stat(filePath);
        return true;
    } catch {
        return false;
    }
}

export async function getFilesInDirectory(path: string): Promise<Array<string>> {
    const client = getNextCloudClient();

    try {
        const fileStats: Array<FileStat> = await client.getDirectoryContents(path);
        return fileStats.map(fs => fs.basename);
    } catch (exception: any) {
        logger.error('nextcloud_list_directory_error', { path, error: exception.message });
        return [];
    }
}

export async function downloadDocumentStream(remotePath: string): Promise<Readable> {
    const client = getNextCloudClient();
    try {
        return client.createReadStream(remotePath);
    } catch (exception: any) {
        logger.error('nextcloud_download_error', { path: remotePath, error: exception.message });
        throw new AppException("Nextcloud download failed!", 503, "NEXTCLOUD_DOWNLOAD_FAILED");
    }
}