import { describe, expect, it } from "vitest";

type Tree = { [key: string]: string | Tree };

const modules = import.meta.glob<Tree>("../locales/*/*.json", { eager: true, import: "default" });

/** `../locales/de/flows.json` → `{ language: "de", file: "flows.json" }` */
const entries = Object.entries(modules).map(([path, tree]) => {
    const [language, file] = path.split("/").slice(-2);
    return { language, file, tree };
});

function keyPaths(tree: Tree, prefix = ""): Array<string> {
    return Object.entries(tree).flatMap(([key, value]) =>
        typeof value === "string" ? [`${prefix}${key}`] : keyPaths(value, `${prefix}${key}.`),
    );
}

function keysOf(language: string, file: string): Array<string> {
    const entry = entries.find((e) => e.language === language && e.file === file);
    return entry ? keyPaths(entry.tree).sort() : [];
}

const filesOf = (language: string) => entries.filter((e) => e.language === language).map((e) => e.file).sort();

describe("Sprachdateien", () => {
    it("liegen für DE und EN in denselben Dateien vor", () => {
        expect(filesOf("en")).toEqual(filesOf("de"));
    });

    it.each(filesOf("de"))("%s hat in DE und EN dieselben Schlüssel", (file) => {
        expect(keysOf("en", file)).toEqual(keysOf("de", file));
    });

    it("enthalten die Vorgangs-Texte", () => {
        expect(filesOf("de")).toContain("flows.json");
    });
});
