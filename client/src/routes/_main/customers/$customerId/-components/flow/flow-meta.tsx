import { ClipboardCheck, FileText, Receipt, ShoppingCart } from "lucide-react";
import type { ReactNode } from "react";
import type { StageKind, StageState } from "./flow-types";

/**
 * Icons und Formatierung für Vorgangs-Tabelle und Vorgangs-Seite (Design-Prototyp).
 * Die Texte liegen in `flows.json`: `flows.station.<kind>.label|short`, `flows.state.<state>`.
 */

export const STATION_ICON: Record<StageKind, ReactNode> = {
    offer: <FileText className="size-3.5" />,
    order: <ShoppingCart className="size-3.5" />,
    confirmation: <ClipboardCheck className="size-3.5" />,
    invoice: <Receipt className="size-3.5" />,
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
