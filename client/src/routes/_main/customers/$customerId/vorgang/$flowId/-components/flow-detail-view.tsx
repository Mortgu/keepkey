import type { Confirmation, Customer, Invoice, Offer, Order } from "@keepit/schemas";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";
import { deriveStages } from "../../../-components/flow/flow-derive";
import { stateTone } from "../../../-components/flow/flow-meta";
import type { FlowStage } from "../../../-components/flow/flow-types";
import { StageNode } from "../../../-components/flow/flow-ui";
import FlowSummary from "./flow-summary";
import StageShell from "./flow-stage-shell";
import OfferStageSection from "./stages/offer-stage-section";
import OrderStageSection from "./stages/order-stage-section";
import ConfirmationStageSection from "./stages/confirmation-stage-section";
import InvoiceStageSection from "./stages/invpice-stage-section";

/**
 * Detailseite eines Vorgangs. Links die Belege zum Angebot: Bestellung (an
 * den Zulieferer), Auftragsbestätigung und Rechnung (an den Kunden) sind
 * eigenständige, vom Angebot abhängige, aber gleichrangige Belege — keine
 * erzwungene Bearbeitungsreihenfolge. Rechts die Zusammenfassung des
 * Geschäfts. Jede Stufe bindet dieselben Bausteine ein, die auch
 * Angebots-/Bestellkarte benutzen — keine eigene Logik, nur Wiederverwendung.
 */

/* ───────────────────────────────
   Strecke (Kurzüberblick, springt zum Abschnitt)
   ─────────────────────────────── */

function Overview({ stages }: { stages: ReadonlyArray<FlowStage> }) {
    const { t } = useTranslation();

    return (
        <nav aria-label={t("flows.detail.overview")} className="grid grid-cols-4 rounded-md border border-(--border) bg-white">
            {stages.map((stage) => (
                <a
                    key={stage.kind}
                    href={`#${stage.kind}`}
                    className="flex min-w-0 items-center gap-3 border-l border-(--border) px-4 py-3 outline-none first:border-l-0 hover:bg-(--page-bg) focus-visible:shadow-[inset_0_0_0_2px_var(--primary-400)]"
                >
                    <StageNode kind={stage.kind} state={stage.state} />
                    <span className="min-w-0">
                        <span className="block truncate text-[11px] font-medium uppercase tracking-wide text-(--fg-3)">
                            {t(`flows.station.${stage.kind}.label`)}
                        </span>
                        <span className={cn(
                            "block truncate text-[13px]",
                            stage.number ? "font-mono text-(--text)" : stateTone(stage.state),
                            stage.state === "cancelled" && "line-through",
                        )}>
                            {stage.number ?? t(`flows.state.${stage.state}`)}
                        </span>
                    </span>
                </a>
            ))}
        </nav>
    );
}

/** Storniert und nie angelegt (siehe deriveDerivedDoc): kein Inhalt, StageShell zeigt den "Entfällt"-Hinweis. */
export function cancelledStageShell(stage: FlowStage): ReactNode | null {
    return stage.state === "cancelled" ? <StageShell stage={stage} /> : null;
}

export default function FlowDetailView({ offer, order, confirmation, invoice }: {
    offer: Offer;
    order: Order | null;
    confirmation: Confirmation | null;
    invoice: Invoice | null;
}) {
    const stages = deriveStages(offer);
    const [offerStage, orderStage, confirmationStage, invoiceStage] = stages;

    return (
        <div className="grid gap-5">
            <Overview stages={stages} />

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid gap-4">
                    {/* Angebot / Offer */}
                    <OfferStageSection stage={offerStage} offer={offer} />

                    {/* Bestellung / Order */}
                    <OrderStageSection stage={orderStage} offer={offer} order={order} />

                    {/* Auftragsbestätigung / Confirmation */}
                    <ConfirmationStageSection stage={confirmationStage} order={order} confirmation={confirmation} />

                    {/* Rechnung / Invoice */}
                    <InvoiceStageSection stage={invoiceStage} order={order} invoice={invoice} />
                </div>

                <FlowSummary offer={offer} customer={offer.customer} />
            </div>
        </div>
    );
}
