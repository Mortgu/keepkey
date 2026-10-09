export type StageKind = "offer" | "order" | "confirmation" | "invoice";

/**
 * done      Beleg existiert
 * action    noch nicht angelegt, aber direkt anlegbar
 * locked    noch nicht angelegt — technisch (DB-FK) wird zuerst eine Bestellung
 *           benötigt; fachlich sind Bestellung/AB/Rechnung aber gleichrangige,
 *           unabhängige Belege, keine erzwungene Bearbeitungsreihenfolge
 * busy      Dokument wird gerade erzeugt
 * failed    Dokumenterzeugung fehlgeschlagen
 * cancelled Bestellung storniert
 */
export type StageState = "done" | "action" | "locked" | "busy" | "failed" | "cancelled";

export type Phase = "open" | "running" | "billed" | "cancelled";

export const DERIVATION_LABEL = { RENEWAL: "Verlängerung", LICENSE_EXTENSION: "Erweiterung" } as const;

export interface FlowStage {
    kind: StageKind;
    state: StageState;
    number?: string;
    date?: string;
    /** Kurzer Statustext unter der Nummer. */
    note?: string;
    actionLabel?: string;
}

export const PHASE_LABELS: Record<Phase, string> = {
    open: "Angebot offen",
    running: "In Abwicklung",
    billed: "Abgerechnet",
    cancelled: "Storniert",
};
