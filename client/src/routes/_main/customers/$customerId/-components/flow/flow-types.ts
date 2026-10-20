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

export interface FlowStage {
    kind: StageKind;
    state: StageState;
    number?: string;
    date?: string;
    /** Kurzer Statustext unter der Nummer. */
    note?: string;
}
