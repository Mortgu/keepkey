import type { DocumentStatus } from "@keepit/schemas";

/**
 * BEISPIELDATEN für den Design-Prototyp des Reiters "Vorgänge".
 * Keine Verbindung zur API — Form und Texte dienen nur dazu, die Ansicht zu beurteilen.
 */

export type StageKind = "offer" | "order" | "confirmation" | "invoice";

/**
 * done      Beleg existiert
 * action    nächster möglicher Schritt (noch nicht angelegt)
 * locked    davor fehlt noch etwas
 * busy      Dokument wird gerade erzeugt
 * failed    Dokumenterzeugung fehlgeschlagen
 * cancelled Bestellung storniert
 */
export type StageState = "done" | "action" | "locked" | "busy" | "failed" | "cancelled";

export type Phase = "open" | "running" | "billed" | "cancelled";

/** Ein Dokument ist immer ein Paar aus DOCX und PDF. */
export interface FlowDocument {
    /** Dateiname ohne Endung. */
    name: string;
    status: DocumentStatus;
    /** Die Nextcloud-Kopie weicht von der lokalen ab (Aktion: neu abgleichen). */
    remoteOutdated?: boolean;
}

export interface FlowStage {
    kind: StageKind;
    state: StageState;
    number?: string;
    date?: string;
    /** Kurzer Statustext unter der Nummer. */
    note?: string;
    actionLabel?: string;
    facts?: Array<[label: string, value: string]>;
    documents?: Array<FlowDocument>;
}

export interface Flow {
    id: string;
    offerNumber: string;
    derivation?: { type: "renewal" | "extension"; from: string };
    title: string;
    positions: string;
    netCents: number;
    phase: Phase;
    contactPerson: string;
    paymentTerm: string;
    durationMonths: number;
    lines: Array<FlowLine>;
    stages: [FlowStage, FlowStage, FlowStage, FlowStage];
}

export interface FlowLine {
    name: string;
    quantity: number;
    /** € je User und Monat, in Cent. */
    unitCents: number;
}

export const getMockFlow = (id: string): Flow | undefined => MOCK_FLOWS.find((flow) => flow.id === id);

export const PHASE_LABELS: Record<Phase, string> = {
    open: "Angebot offen",
    running: "In Abwicklung",
    billed: "Abgerechnet",
    cancelled: "Storniert",
};

export const MOCK_FLOWS: Array<Flow> = [
    {
        id: "f1",
        offerNumber: "AG-2026-033",
        derivation: { type: "renewal", from: "AG-2025-019" },
        title: "Verlängerung Backup & Security",
        positions: "Backup Pro, Security Suite · 12 Monate",
        netCents: 2_184_000,
        phase: "open",
        contactPerson: "Dr. Anna Berger",
        paymentTerm: "30 Tage",
        durationMonths: 12,
        lines: [{ name: "Backup Pro", quantity: 60, unitCents: 1_900 }, { name: "Security Suite", quantity: 60, unitCents: 1_700 }],
        stages: [
            {
                kind: "offer", state: "busy", number: "AG-2026-033", date: "08.10.2026", note: "Dokument wird erzeugt",
                facts: [["Netto", "21.840,00 €"], ["Laufzeit", "12 Monate"], ["Gültig bis", "07.11.2026"]],
                documents: [{ name: "AG-2026-033_v1", status: "PROCESSING" }],
            },
            { kind: "order", state: "locked", note: "Erst nach Annahme" },
            { kind: "confirmation", state: "locked" },
            { kind: "invoice", state: "locked" },
        ],
    },
    {
        id: "f2",
        offerNumber: "AG-2026-031",
        title: "Endpoint Protection für 3 Standorte",
        positions: "Endpoint Protection · 60 Seats · 24 Monate",
        netCents: 3_456_000,
        phase: "open",
        contactPerson: "Dr. Anna Berger",
        paymentTerm: "30 Tage",
        durationMonths: 24,
        lines: [{ name: "Endpoint Protection", quantity: 60, unitCents: 2_400 }],
        stages: [
            {
                kind: "offer", state: "done", number: "AG-2026-031", date: "02.10.2026", note: "Offen · gültig bis 01.11.",
                facts: [["Netto", "34.560,00 €"], ["Laufzeit", "24 Monate"], ["Freimonate", "2"]],
                documents: [{ name: "AG-2026-031_v2", status: "UPLOADED" }],
            },
            { kind: "order", state: "action", actionLabel: "Bestellung anlegen" },
            { kind: "confirmation", state: "locked" },
            { kind: "invoice", state: "locked" },
        ],
    },
    {
        id: "f3",
        offerNumber: "AG-2026-027",
        title: "Cloud Backup M365",
        positions: "Backup M365 · 120 Seats · 12 Monate",
        netCents: 1_872_000,
        phase: "running",
        contactPerson: "Markus Vogel",
        paymentTerm: "30 Tage",
        durationMonths: 12,
        lines: [{ name: "Backup M365", quantity: 120, unitCents: 1_300 }],
        stages: [
            {
                kind: "offer", state: "done", number: "AG-2026-027", date: "21.09.2026", note: "Angenommen 25.09.",
                facts: [["Netto", "18.720,00 €"], ["Laufzeit", "12 Monate"]],
                documents: [{ name: "AG-2026-027_v1", status: "UPLOADED" }],
            },
            {
                kind: "order", state: "done", number: "BE-2026-046", date: "25.09.2026", note: "Beim Zulieferer bestellt",
                facts: [["Einkauf", "14.976,00 €"], ["Marge", "3.744,00 € (20 %)"], ["Vertragsbeginn", "01.11.2026"]],
                documents: [{ name: "BE-2026-046_v1", status: "GENERATED", remoteOutdated: true }],
            },
            { kind: "confirmation", state: "action", actionLabel: "Auftragsbestätigung anlegen" },
            { kind: "invoice", state: "locked" },
        ],
    },
    {
        id: "f4",
        offerNumber: "AG-2026-021",
        title: "Security Suite & Backup",
        positions: "Security Suite, Backup Pro · 85 Seats · 12 Monate",
        netCents: 1_845_000,
        phase: "billed",
        contactPerson: "Dr. Anna Berger",
        paymentTerm: "30 Tage",
        durationMonths: 12,
        lines: [{ name: "Security Suite", quantity: 85, unitCents: 1_100 }, { name: "Backup Pro", quantity: 85, unitCents: 1_000 }],
        stages: [
            {
                kind: "offer", state: "done", number: "AG-2026-021", date: "03.08.2026", note: "Angenommen 11.08.",
                facts: [["Netto", "18.450,00 €"], ["Laufzeit", "12 Monate"], ["Rabatt", "−500,00 €"]],
                documents: [{ name: "AG-2026-021_v3", status: "UPLOADED" }],
            },
            {
                kind: "order", state: "done", number: "BE-2026-038", date: "11.08.2026", note: "Beim Zulieferer bestellt",
                facts: [["Einkauf", "14.760,00 €"], ["Marge", "3.690,00 € (20 %)"], ["Vertragsbeginn", "01.09.2026"]],
                documents: [{ name: "BE-2026-038_v1", status: "UPLOADED" }],
            },
            {
                kind: "confirmation", state: "done", number: "AB-2026-033", date: "12.08.2026", note: "Versendet",
                facts: [["Netto", "18.450,00 €"], ["MwSt. 19 %", "3.505,50 €"], ["Brutto", "21.955,50 €"]],
                documents: [{ name: "AB-2026-033", status: "UPLOADED" }],
            },
            {
                kind: "invoice", state: "done", number: "RE-2026-0112", date: "01.09.2026", note: "Fällig 01.10.",
                facts: [["Brutto", "21.955,50 €"], ["Zahlungsziel", "30 Tage"], ["Leistungszeitraum", "09/2026 – 08/2027"]],
                documents: [{ name: "RE-2026-0112", status: "UPLOADED" }],
            },
        ],
    },
    {
        id: "f5",
        offerNumber: "AG-2026-024",
        derivation: { type: "extension", from: "AG-2026-021" },
        title: "Lizenzerweiterung +15 Seats",
        positions: "Security Suite · 15 Seats · 12 Monate",
        netCents: 324_000,
        phase: "running",
        contactPerson: "Dr. Anna Berger",
        paymentTerm: "30 Tage",
        durationMonths: 12,
        lines: [{ name: "Security Suite", quantity: 15, unitCents: 1_800 }],
        stages: [
            {
                kind: "offer", state: "done", number: "AG-2026-024", date: "19.08.2026", note: "Angenommen 22.08.",
                facts: [["Netto", "3.240,00 €"], ["Laufzeit", "12 Monate"]],
                documents: [{ name: "AG-2026-024_v1", status: "UPLOADED" }],
            },
            {
                kind: "order", state: "done", number: "BE-2026-041", date: "22.08.2026", note: "Beim Zulieferer bestellt",
                facts: [["Einkauf", "2.592,00 €"], ["Marge", "648,00 € (20 %)"]],
                documents: [{ name: "BE-2026-041_v1", status: "UPLOADED" }],
            },
            {
                kind: "confirmation", state: "done", number: "AB-2026-035", date: "23.08.2026", note: "Versendet",
                facts: [["Brutto", "3.855,60 €"]],
                documents: [{ name: "AB-2026-035", status: "UPLOADED" }],
            },
            {
                kind: "invoice", state: "failed", number: "RE-2026-0118", date: "05.10.2026", note: "Dokument fehlgeschlagen",
                facts: [["Brutto", "3.855,60 €"], ["Zahlungsziel", "30 Tage"]],
                documents: [{ name: "RE-2026-0118", status: "FAILED" }],
            },
        ],
    },
    {
        id: "f6",
        offerNumber: "AG-2025-052",
        title: "Monitoring Starter",
        positions: "Monitoring · 40 Seats · 12 Monate",
        netCents: 576_000,
        phase: "cancelled",
        contactPerson: "Markus Vogel",
        paymentTerm: "30 Tage",
        durationMonths: 12,
        lines: [{ name: "Monitoring", quantity: 40, unitCents: 1_200 }],
        stages: [
            {
                kind: "offer", state: "done", number: "AG-2025-052", date: "14.11.2025", note: "Angenommen 20.11.",
                facts: [["Netto", "5.760,00 €"], ["Laufzeit", "12 Monate"]],
                documents: [{ name: "AG-2025-052_v1", status: "UPLOADED" }],
            },
            {
                kind: "order", state: "cancelled", number: "BE-2025-071", date: "20.11.2025", note: "Storniert 02.12.2025",
                facts: [["Einkauf", "4.608,00 €"], ["Storniert am", "02.12.2025"]],
                documents: [{ name: "BE-2025-071_v1", status: "UPLOADED" }],
            },
            { kind: "confirmation", state: "cancelled" },
            { kind: "invoice", state: "cancelled" },
        ],
    },
];
