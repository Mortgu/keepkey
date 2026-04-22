import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs/promises";

export async function renderDocx(templatePath: string, data: Record<string, unknown>): Promise<Buffer> {
    const content = await fs.readFile(templatePath);
    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, { paragraphLoop: true, linebreaks: true });
    doc.render(data);
    const output = doc.getZip().generate({ type: "nodebuffer", compression: "DEFLATE" });
    return output;
}
