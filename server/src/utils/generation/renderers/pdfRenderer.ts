import puppeteer from "puppeteer";
import Handlebars from "handlebars";
import fs from "fs/promises";

export async function renderPdf(templatePath: string, data: Record<string, unknown>): Promise<Buffer> {
    const source = await fs.readFile(templatePath, "utf-8");
    const template = Handlebars.compile(source);
    const html = template(data);

    const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        const pdf = await page.pdf({
            format: "A4",
            margin: { top: "20mm", right: "15mm", bottom: "20mm", left: "15mm" },
            printBackground: true,
        });
        return Buffer.from(pdf);
    } finally {
        await browser.close();
    }
}
