import puppeteer from "puppeteer";
import fs from 'fs';

/* 
 * This function should generate the invoice pdf from given data
 */
export const generateInvoicePDF = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    let html = fs.readFileSync("template.html", "utf8");

    html = html.replace("{{test}}", "test");

    await page.setContent(html, {
        waitUntil: "networkidle0"
    });

    const pdf = await page.pdf({
        path: "output.pdf",
        format: "A4",
        printBackground: true,
    });

    await browser.close();
    console.log("PDF generated successfully");

    return pdf;
}