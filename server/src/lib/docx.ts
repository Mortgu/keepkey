import PizZip from "pizzip";

import { AppException } from "./exceptions.js";

/** Mehr als das ist weder eine Vorlage noch ein Angebotsdokument. */
export const MAX_DOCX_BYTES = 25 * 1024 * 1024;

/**
 * Stellt sicher, dass ein hochgeladener Puffer wirklich ein Word-Dokument ist.
 *
 * Die Endung sagt über eine hochgeladene Datei nichts aus, und ein kaputtes
 * Dokument fällt sonst viel später auf. Die Umwandlung nach PDF taugt dabei
 * ausdrücklich **nicht** als Prüfung: LibreOffice nimmt auch eine reine
 * Textdatei entgegen und rendert sie klaglos — eine Nicht-DOCX käme so
 * unbemerkt durch.
 *
 * Ein DOCX ist ein ZIP mit `PK\x03\x04` am Anfang und einer
 * `word/document.xml` darin; genau das prüft `pizzip`, das die Pipeline ohnehin
 * schon benutzt.
 */
export function assertDocxBuffer(content: Buffer): void {
    if (content.length === 0) {
        throw new AppException("Die Datei ist leer.", 400, "EMPTY_FILE");
    }

    if (content.length > MAX_DOCX_BYTES) {
        throw new AppException(
            `Die Datei ist größer als ${MAX_DOCX_BYTES / 1024 / 1024} MB.`,
            413,
            "FILE_TOO_LARGE",
        );
    }

    try {
        const zip = new PizZip(content);
        if (!zip.file("word/document.xml")) {
            throw new Error("missing word/document.xml");
        }
    } catch {
        throw new AppException(
            "Die Datei ist kein gültiges Word-Dokument (.docx).",
            400,
            "INVALID_DOCX",
        );
    }
}
