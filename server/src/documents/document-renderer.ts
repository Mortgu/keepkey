import PizZip from 'pizzip';
import Docxtemplater from "docxtemplater";
import { customParser } from '@/pipelines/offer/utils.js';

export default async function renderDocument<T>(templateBuffer: Buffer, data: T): Promise<Buffer> {
    const template = new PizZip(templateBuffer);

    const document = new Docxtemplater(template, {
        paragraphLoop: true,
        linebreaks: true,
        parser: customParser,
    });

    document.render(data);

    return document.toBuffer();
}