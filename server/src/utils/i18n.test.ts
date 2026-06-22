import { describe, it, expect } from "vitest";
import type { Language } from "@prisma/client";
import { pickTranslation } from "./i18n.js";

type Translation = { language: Language; name: string };

const en: Translation = { language: "EN", name: "Backup" };
const de: Translation = { language: "DE", name: "Sicherung" };

describe("pickTranslation", () => {
  it("nimmt die exakt passende Sprache", () => {
    expect(pickTranslation([en, de], "EN")).toBe(en);
  });

  it("fällt auf DE zurück, wenn die Sprache fehlt", () => {
    expect(pickTranslation([en, de], "FR" as Language)).toBe(de);
  });

  it("nimmt die erste Übersetzung, wenn weder Sprache noch DE vorhanden", () => {
    expect(pickTranslation([en], "FR" as Language)).toBe(en);
  });

  it("nutzt DE als Default, wenn keine Sprache übergeben wird", () => {
    expect(pickTranslation([en, de])).toBe(de);
  });

  it("gibt undefined bei leerer Liste zurück", () => {
    expect(pickTranslation([], "DE")).toBeUndefined();
  });
});
