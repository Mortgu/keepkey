import { initDocumentArtifactStore } from "@/lib/document-artifact-store.js";
import logger from "@/utils/logger.js";

let initialized: Promise<void> | null = null;

/** Einmal pro Prozess — im kombinierten Betrieb rufen API und Worker beide auf. */
export function initObjectStorage(): Promise<void> {
    initialized ??= initDocumentArtifactStore().then(
        () => { logger.info('object_storage_ready'); },
        (error) => {
            initialized = null;
            logger.error('object_storage_init_failed', { error });
            throw error;
        },
    );
    return initialized as Promise<void>;
}
