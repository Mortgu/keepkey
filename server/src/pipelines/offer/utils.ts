import {createRequire} from "module";
import type {DXT} from "docxtemplater";
import {Language} from "@prisma/client";
import path from "path";
import env from "../../lib/env.js";
import fs from "fs";

// Require-Workaround für den Expression-Parser
const require = createRequire(import.meta.url);
const expressionParser = require("docxtemplater/expressions.js");

export function interpolate(template: string, ctx: Record<string, unknown>): string {
    return template.replace(/\{([\w.]+)\}/g, (_, key: string) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const value = key.split('.').reduce((obj: any, k: string) => obj?.[k], ctx);
        return value != null ? String(value) : `{${key}}`;
    });
}

export const deepIterate = (obj: Record<string, unknown>, root: Record<string, unknown>, local: Record<string, unknown> = {}): Record<string, unknown> => {
    const ctx = {...root, ...local};

    for (const key in obj) {
        const value = obj[key];

        if (Array.isArray(value)) {
            value.forEach((item, i) => {
                if (item !== null && typeof item === 'object') {
                    deepIterate(item as Record<string, unknown>, root, item as Record<string, unknown>);
                } else if (typeof item === 'string') {
                    value[i] = interpolate(item, ctx);
                }
            });
        } else if (value !== null && typeof value === 'object') {
            deepIterate(value as Record<string, unknown>, root, obj);
        } else if (typeof value === 'string') {
            obj[key] = interpolate(value, ctx);
        }
    }

    return obj;
};

// Parser einmalig außerhalb der Funktion konfigurieren
const parser = expressionParser.configure({});

type ParserResult = { get: (scope: any, context: DXT.ParserContext) => any };

export const customParser = function (tag: string): ParserResult {
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

export function resolveTemplateName(baseName: string, language: Language): string {
    const langSuffix = language === "DE" ? "" : `.${language.toLowerCase()}`;
    const templatePath = path.join(env.TEMPLATES_DIR, `${baseName}${langSuffix}.docx`);

    // Prüfe ob sprachspezifisches Template existiert, sonst Fallback
    try {
        fs.accessSync(templatePath);
        return templatePath;
    } catch {
        return path.join(env.TEMPLATES_DIR, `${baseName}.docx`);
    }
}