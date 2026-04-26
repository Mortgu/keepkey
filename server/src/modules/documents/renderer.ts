import fs from 'fs/promises';
import PizZip from 'pizzip';
import DocxTemplater, { DXT } from 'docxtemplater';
import { createRequire } from "module";

import { TemplateBaseData } from "../../utils/generation/types.js";

// Require-Workaround für den Expression-Parser
const require = createRequire(import.meta.url);
const expressionParser = require("docxtemplater/expressions.js");

const parser = expressionParser.configure({});

type DocumentRendererProps = {
    templatePath: string;
    data: TemplateBaseData;
}

type ParserResult = {
    get: (scope: any, context: DXT.ParserContext) => any;
}

const Parser = (tag: string): ParserResult => {
    if (tag === ".") return {
        get: (s) => s,
    };

    const expression = parser(tag);

    return {
        get: (scope: any, context: DXT.ParserContext) => {
            return expression.get(scope, context);
        }
    }
}

const DocumentRenderer = async ({ templatePath, data }: DocumentRendererProps): Promise<Buffer> => {
    const fileTemplateContent = fs.readFile(templatePath, "binary");
    const zip = new PizZip(await fileTemplateContent);

    const document = new DocxTemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        parser: Parser,
    });

    document.render(data);

    return document.toBuffer();
}

export default DocumentRenderer;