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

        await page.emulateMediaType('screen');

        await page.setViewport({
            width: 794,
            height: 1122,
            deviceScaleFactor: 1,
        })

        const pdf = await page.pdf({
            path: outputPath,
            format: "A4",
            printBackground: true,
            scale: 0.85,
            width: "8.27in",
            height: "11.69in",
            margin: {
                top: '0.49in',
                right: '0.5in',
                bottom: '0.32in',
                left: '0.5in',
            },
            preferCSSPageSize: false,
        });

        await browser.close();
        console.log("Invoice PDF generated successfully");

        return pdf;
    } catch (error) {
        console.error('Error generating invoice PDF:', error);
        throw error;
    }
};