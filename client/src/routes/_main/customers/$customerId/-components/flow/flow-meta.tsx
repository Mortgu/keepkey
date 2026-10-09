import { ClipboardCheck, FileText, Receipt, ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";
import type { StageKind, StageState } from "./flow-types";

/** Beschriftungen, Icons und Formatierung für Vorgangs-Tabelle und Vorgangs-Seite (Design-Prototyp). */

export const STATION: Record<StageKind, { label: string; short: string; icon: ReactNode }> = {
    offer: { label: "Angebot", short: "Angebot", icon: <FileText className="size-3.5" /> },
    order: { label: "Bestellung", short: "Bestellung", icon: <ShoppingCart className="size-3.5" /> },
    confirmation: { label: "Auftragsbestätigung", short: "Auftragsbest.", icon: <ClipboardCheck className="size-3.5" /> },
    invoice: { label: "Rechnung", short: "Rechnung", icon: <Receipt className="size-3.5" /> },
};

export const STATE_LABEL: Record<StageState, string> = {
    done: "Angelegt",
    action: "Nächster Schritt",
    locked: "Noch nicht möglich",
    busy: "Wird erzeugt",
    failed: "Fehlgeschlagen",
    cancelled: "Storniert",
};

const TEXT_TONE: Record<StageState, string> = {
    done: "text-(--fg-3)",
    action: "text-(--primary-600)",
    locked: "text-(--fg-3)",
    busy: "text-(--info)",
    failed: "text-(--destructive)",
    cancelled: "text-(--fg-3)",
};

export const stateTone = (state: StageState) => TEXT_TONE[state];

export const eur = (cents: number) =>
    new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(cents / 100);
