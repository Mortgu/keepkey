import logger from "@/utils/logger.js";
import env from "./env.js";

const CONVERT_ROUTE = "/forms/libreoffice/convert";
const REQUEST_TIMEOUT_MS = 60_000;

/**
 * Rendert eine DOCX nach PDF.
 *
 * Läuft über eine HTTP-Anfrage an den Gotenberg-Sidecar (`GOTENBERG_URL`),
 * der die eigentliche LibreOffice-Konvertierung übernimmt — statt, wie
 * vorher, einen lokalen `soffice`-Unterprozess zu starten. Bricht nach
 * {@link REQUEST_TIMEOUT_MS} ab, damit ein hängender oder überlasteter
 * Gotenberg keinen Worker-Slot dauerhaft belegt; ein Scheitern hier fällt in
 * das bestehende BullMQ-Retry (`attempts: 3`).
 */
export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    const form = new FormData();
    // `Blob` erwartet eine konkrete `ArrayBuffer`-Sicht; `Buffer.buffer` lässt
    // sich typseitig nicht darauf einschränken, da Node auch ein geteiltes
    // `SharedArrayBuffer` zulässt. `new Uint8Array(docxBuffer)` kopiert in
    // einen frischen, eindeutigen Puffer und löst das sauber auf.
    form.append("files", new Blob([new Uint8Array(docxBuffer)]), "document.docx");

    const url = new URL(CONVERT_ROUTE, env.GOTENBERG_URL);

    let response: Response;
    try {
        response = await fetch(url, {
            method: "POST",
            body: form,
            signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
    } catch (error) {
        // Netzwerkfehler oder Timeout: Gotenberg selbst ist nicht erreichbar,
        // nicht zu verwechseln mit einem Dokument, das Gotenberg ablehnt.
        logger.error("gotenberg_unreachable", {
            url: url.toString(),
            error: (error as Error).message,
        });
        throw error;
    }

    if (!response.ok) {
        const body = await response.text().catch(() => "<unreadable>");
        logger.error("gotenberg_conversion_failed", {
            url: url.toString(),
            status: response.status,
            body,
        });
        throw new Error(`Gotenberg hat die Konvertierung abgelehnt (Status ${response.status}).`);
    }

    return Buffer.from(await response.arrayBuffer());
}
