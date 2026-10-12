/**
 * Öffentliche Schnittstelle der Dokumentverwaltung. `document-lifecycle` deckt
 * Umbenennen, Löschen, Herunterladen, Hochladen und erneutes Übertragen ab —
 * typgenerisch über alle vier Dokumenttypen. `document-replacement` deckt den
 * eigenständigen Ersetzen-Fluss ab (eigene DOCX hochladen, PDF neu erzeugen).
 */
export {
    renameDocument,
    deleteDocument,
    downloadDocument,
    uploadDocument,
    resyncDocument,
    type RenameDocumentInput,
} from "./document-lifecycle.js";
export {
    getDocumentCapabilities,
    createReplacementUpload,
    confirmReplacementUpload,
} from "./document-replacement.js";
