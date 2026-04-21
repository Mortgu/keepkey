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
export const generateOfferPdf = async () => {

};