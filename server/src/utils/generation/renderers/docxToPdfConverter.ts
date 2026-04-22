import { convert } from "libreoffice-convert";
import { promisify } from "util";

const convertAsync = promisify(convert);

export async function convertDocxToPdf(docxBuffer: Buffer): Promise<Buffer> {
    return convertAsync(docxBuffer, ".pdf", undefined) as Promise<Buffer>;
}
