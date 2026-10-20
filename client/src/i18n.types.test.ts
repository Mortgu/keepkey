import { describe, expect, it } from "vitest";
import type { TFunction } from "i18next";

/*
 * Typ-Test: wird von `tsc` geprüft, nicht zur Laufzeit. Jedes `@ts-expect-error`
 * muss einen echten Fehler tragen — greift die Schlüssel-Typisierung nicht,
 * meldet `tsc` die Direktive als unbenutzt.
 */
function keyChecks(t: TFunction, phase: "open" | "running", bogus: "open" | "nope") {
    // gültige Schlüssel kompilieren
    t("flows.phase.open");
    t(`flows.phase.${phase}`);
    t("errors.VERSION_CONFLICT");

    // @ts-expect-error unbekannter Schlüssel
    t("gibt.es.nicht");

    // @ts-expect-error Template-Schlüssel außerhalb der Union
    t(`flows.phase.${bogus}`);
}

describe("Übersetzungsschlüssel", () => {
    it("werden von tsc gegen die Sprachdateien geprüft", () => {
        expect(typeof keyChecks).toBe("function");
    });
});
