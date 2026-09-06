import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import type { DocumentTemplateKind, Language } from "@prisma/client";
import env from "../src/lib/env.js";
import { prisma } from "../src/lib/prismaClient.js";
import { createTemplate, setActiveTemplate } from "../src/services/document-template.service.js";

/**
 * Übernimmt die mitgelieferten Vorlagen aus `TEMPLATES_DIR` in den
 * Objektspeicher und setzt sie je Slot aktiv.
 *
 * Der Aufruf ist **optional**: solange die Tabelle leer ist, rendert die
 * Pipeline weiter direkt aus `TEMPLATES_DIR`. Das Script hebt den Bestand
 * lediglich in die Verwaltung, damit er dort bearbeitet und ersetzt werden
 * kann.
 *
 * Bewusst eine feste Liste statt eines Verzeichnis-Scans: neben den vier
 * echten Vorlagen liegen dort Sicherungskopien, eine ODT-Datei und ein PDF.
 *
 * Wiederholte Läufe sind harmlos — eine Vorlage mit gleicher Prüfsumme im
 * selben Slot wird übersprungen.
 *
 * Aufruf: `npm --prefix server run templates:import [-- --dry-run]`
 */
const LEGACY_TEMPLATES: Array<{
    file: string;
    kind: DocumentTemplateKind;
    language: Language;
    name: string;
}> = [
    { file: "offer.docx", kind: "OFFER", language: "DE", name: "Angebot (Standard)" },
    { file: "offer.en.docx", kind: "OFFER", language: "EN", name: "Offer (default)" },
    { file: "order.docx", kind: "ORDER", language: "DE", name: "Bestellung (Standard)" },
    { file: "order.en.docx", kind: "ORDER", language: "EN", name: "Order (default)" },
];

const dryRun = process.argv.includes("--dry-run");

async function main() {
    console.log(`[templates] Quelle: ${path.resolve(env.TEMPLATES_DIR)}${dryRun ? " (dry run)" : ""}`);

    for (const entry of LEGACY_TEMPLATES) {
        const filePath = path.join(env.TEMPLATES_DIR, entry.file);

        let content: Buffer;
        try {
            content = await fs.readFile(filePath);
        } catch {
            console.warn(`[templates] ${entry.file}: nicht vorhanden, übersprungen.`);
            continue;
        }

        const sha256 = createHash("sha256").update(content).digest("hex");
        const sizeKb = Math.round(content.length / 1024);

        const existing = await prisma.documentTemplate.findFirst({
            where: { kind: entry.kind, language: entry.language, sha256 },
        });

        if (existing) {
            console.log(`[templates] ${entry.file}: bereits vorhanden (${existing.id}), übersprungen.`);
            continue;
        }

        if (dryRun) {
            console.log(`[templates] ${entry.file}: würde angelegt — ${entry.kind}/${entry.language}, ${sizeKb} KB, ${sha256.slice(0, 12)}…`);
            continue;
        }

        const template = await createTemplate({
            kind: entry.kind,
            language: entry.language,
            name: entry.name,
            fileName: entry.file,
            content,
        });

        console.log(`[templates] ${entry.file}: angelegt (${template.id}) — ${entry.kind}/${entry.language}, ${sizeKb} KB`);

        // Nur einspringen, wenn der Slot noch leer ist: ein bereits gesetztes
        // Template darf ein Import nicht verdrängen.
        const active = await prisma.documentTemplate.findFirst({
            where: { kind: entry.kind, language: entry.language, isActive: true },
        });

        if (!active) {
            await setActiveTemplate(template.id);
            console.log(`[templates] ${entry.file}: als aktive Vorlage gesetzt.`);
        }
    }
}

main()
    .catch((error) => {
        console.error("[templates] Import fehlgeschlagen:", error);
        process.exitCode = 1;
    })
    .finally(() => prisma.$disconnect());
