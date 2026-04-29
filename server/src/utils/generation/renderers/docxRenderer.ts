import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import fs from "fs";
import { createRequire } from "module";
import { TemplateBaseData } from "../types.js";
import { compileExpression, useDotAccessOperator } from "filtrex";
import path from "path";

// Require-Workaround für den Expression-Parser
const require = createRequire(import.meta.url);
const expressionParser = require("docxtemplater/expressions.js");

// Parser einmalig außerhalb der Funktion konfigurieren
const parser = expressionParser.configure({});

import type { DXT } from "docxtemplater";

type ParserResult = { get: (scope: any, context: DXT.ParserContext) => any };

const customParser = function (tag: string): ParserResult {
    if (tag === ".") {
        return {
            get: (s) => s,
        };
    }

    const expr = parser(tag);

    return {
        get: (scope: any, context: DXT.ParserContext) => {
            return expr.get(scope, context);
        },
    };
};

const simpleNestedParser = (tag: string): ParserResult => {
    return {
        get: (scope: Record<string, unknown>) => {
            if (tag === ".") return scope;
            // Löst "customer.name" auf, indem es den Pfad durchgeht
            return tag.split('.').reduce((current: unknown, part: string) => {
                return current && typeof current === "object" && part in current
                    ? (current as Record<string, unknown>)[part]
                    : undefined;
            }, scope as unknown);
        }
    };
};

export async function renderDocx(templatePath: string, data: any): Promise<Buffer> {
    const content = fs.readFileSync(templatePath, "binary");

    const zip = new PizZip(content);

    const doc = new Docxtemplater(zip, {
        paragraphLoop: true, linebreaks: true, parser: customParser
    });

    doc.render(data);

    return doc.toBuffer();
}