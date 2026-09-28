import { initDocumentArtifactStore } from "@/lib/document-artifact-store.js";
import logger from "@/utils/logger.js";

export async function initObjectStorage(): Promise<void> {
    try {
        await initDocumentArtifactStore();
        logger.info('object_storage_ready');
    } catch (error) {
        logger.error('object_storage_init_failed', { error });
        throw error;
    }
}
