import { convert as libconvert } from "libreoffice-convert";

/**
 * Rendert eine DOCX nach PDF.
 *
 * Läuft über einen `soffice`-Unterprozess und dauert deshalb Sekunden — ein
 * kalter Start auch deutlich länger. Aufrufer müssen damit rechnen.
 */
export function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        libconvert(docxBuffer, ".pdf", undefined, (error: Error | null, result: Buffer) => {
            if (error) reject(error);
            else resolve(result);
        });
    });
}
