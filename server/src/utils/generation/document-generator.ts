import puppeteer from "puppeteer";
import fs from 'fs';
import Handlebars from 'handlebars';
import mammoth from 'mammoth';

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    customerContactPerson: string;
    contactPerson: string;
    contactPhone: string;
    contactEmail: string;
    companyName: string;
    contactFull: string;
    street: string;
    plzCity: string;
    products: string;
    alternativeOffers: Array<{
        rows: Array<{
            pos: number;
            tariff: string;
            tariffDescription: string;
            runtime: string;
        }>;
    }>;
    productDescriptions: string[];
    enterprise: Array<{
        rows: Array<{
            tariff: string;
            name: string;
            quantity: number;
            pricePerUnit: string;
            price12: string;
            price36: string;
        }>;
        total: string;
    }>;
    essentials: Array<{
        rows: Array<{
            tariff: string;
            name: string;
            quantity: number;
            pricePerUnit: string;
            price12: string;
            price36: string;
        }>;
        total: string;
    }>;
}

/*
 * Generate Invoice PDF from HTML template with data (alternative method)
 */
export const generatedOfferPdf = async (data: InvoiceData, outputPath: string = "output.pdf", htmlTemplatePath: string = "template-invoice.html"): Promise<Uint8Array> => {
    try {
        // Read HTML template
        const htmlTemplate = fs.readFileSync(htmlTemplatePath, "utf8");

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