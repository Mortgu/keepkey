import puppeteer from "puppeteer";
import fs from 'fs';
import Handlebars from 'handlebars';
import { OfferData } from "./types.js";

type Props = {
    data: OfferData;
    outputPath: string;
    templatePath: string;
};

/*
 * Generate Invoice PDF from HTML template with data (alternative method)
 */
export const generateOfferPdf = async ({ data, outputPath, templatePath }: Props): Promise<Uint8Array> => {
    try {
        // Read HTML template
        const htmlTemplate = fs.readFileSync(templatePath, "utf8");

        // Compile Handlebars template
        const template = Handlebars.compile(htmlTemplate);
        const compiledHtml = template(data);

        // Launch Puppeteer and generate PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(compiledHtml, {
            waitUntil: "networkidle0"
        });

        const pdf = await page.pdf({
            path: outputPath,
            format: "A4",
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm',
            },
        });

        await browser.close();
        console.log("Invoice PDF generated successfully");

        return pdf;
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        throw error;
    }
};