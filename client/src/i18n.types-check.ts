import type { TFunction } from "i18next";

/*
 * Reine Typ-Prüfung: `tsc` ist der Test, vitest führt diese Datei nicht aus und
 * nichts importiert sie. Jedes `@ts-expect-error` muss einen echten Fehler tragen —
 * greift die Schlüssel-Typisierung nicht, meldet `tsc` die Direktive als unbenutzt.
 */
export function keyChecks(t: TFunction, phase: "open" | "running", bogus: "open" | "nope") {
    // gültige Schlüssel kompilieren
    t("flows.phase.open");
    t(`flows.phase.${phase}`);
    t("errors.VERSION_CONFLICT");

    // @ts-expect-error unbekannter Schlüssel
    t("gibt.es.nicht");

    // @ts-expect-error Template-Schlüssel außerhalb der Union
    t(`flows.phase.${bogus}`);
}
