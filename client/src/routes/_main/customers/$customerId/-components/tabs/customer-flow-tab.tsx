import { Button, ListSkeleton, RouteError, SearchBar, Skeleton } from "@/components";
import OfferModal from "@/components/modules/modals/offer/offer-modal";
import type { OfferModalMode } from "@/components/modules/modals/offer/offer-modal-policy";
import { useLocale, useModal, useOffers } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { Offer } from "@keepit/schemas";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";
import { derivePhase, deriveStages } from "../flow/flow-derive";
import { STATE_LABEL, STATION, eur, stateTone } from "../flow/flow-meta";
import type { FlowStage } from "../flow/flow-types";
import { DERIVATION_LABEL } from "../flow/flow-types";

/**
 * Reiter "Vorgänge" als Tabelle. Eine Zeile ist ein Vorgang: das Angebot und
 * die davon abhängigen, aber gleichrangigen Belege Bestellung (an den
 * Zulieferer), Auftragsbestätigung und Rechnung (an den Kunden) — keine
 * erzwungene Bearbeitungsreihenfolge, nur eine Übersicht je Spalte. Die
 * Zeile öffnet die Vorgangs-Seite. Zustand pro Spalte kommt aus `flow-derive.ts`,
 * berechnet aus dem Angebot samt (optional geladener) Bestellung.
 */

const COLUMNS = "grid-cols-[minmax(240px,2.4fr)_repeat(4,minmax(124px,1fr))_112px_20px]";
const KINDS = ["offer", "order", "confirmation", "invoice"] as const;

function StageCell({ stage }: { stage: FlowStage }) {
    if (stage.state === "locked" || stage.state === "action") {
        return <span className="text-xs text-(--fg-3)">{STATE_LABEL.locked}</span>;
    }

    return (
        <div className="grid min-w-0">
            <p className={cn(
                "truncate  font-mono text-sm font-medium leading-tight",
                stage.state === "cancelled" ? "text-(--fg-3) line-through" : "text-(--text)",
            )}>
                {stage.number}
            </p>
            <p className={cn("truncate text-xs leading-tight mt-0.5", stateTone(stage.state))}>
                {stage.state === "busy" ? "wird erzeugt"
                    : stage.state === "failed" ? "fehlgeschlagen"
                        : stage.state === "cancelled" ? "storniert"
                            : stage.date}
            </p>
        </div>
    );
}

function FlowTableRow({ offer, customerId }: { offer: Offer; customerId: string }) {
    const locale = useLocale();

    const stages = useMemo(() => deriveStages(offer), [offer]);

    console.log(stages);

    const phase = derivePhase(offer, stages);

    const cancelled = phase === "cancelled";

    const { customerContactPerson: ccp } = offer;
    const positions = offer.offerPositions
        .map((p) => localized(p.product.translations, locale, "name"))
        .join(", ");

    return (
        <Link
            to="/customers/$customerId/vorgang/$flowId"
            params={{ customerId, flowId: offer.id }}
            className={cn(
                "grid items-center gap-x-4 border-b border-(--border) px-4 py-3 outline-none transition-colors last:border-b-0",
                "hover:bg-(--page-bg) focus-visible:shadow-[inset_0_0_0_2px_var(--primary-400)]",
                COLUMNS,
                cancelled && "bg-(--page-bg)",
            )}
        >
            <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">{positions || `AG${offer.quoteId}`}</p>
                <p className="mt-0.5 flex items-center gap-2 truncate text-xs text-(--fg-3)">
                    <span className="truncate">{`${ccp.firstName} ${ccp.lastName}`.trim()}</span>
                    {offer.derivationType && (
                        <span className="rounded bg-(--subtle-50) px-1.5 py-px text-[11px] text-(--fg-2)">
                            {DERIVATION_LABEL[offer.derivationType]}
                        </span>
                    )}
                </p>
            </div>

            {stages.map((stage) => (
                <div key={stage.kind} className="min-w-0">
                    <StageCell stage={stage} />
                </div>
            ))}

            <p className={cn("text-right text-[14px] font-medium tabular-nums", cancelled && "text-(--fg-3) line-through")}>
                {eur(offer.net_amount)}
            </p>

            <ChevronRight className="size-4 text-(--fg-3)" />
        </Link>
    );
}

export default function CustomerFlowTab({ customerId }: { customerId: string }) {
    const { t } = useTranslation();
    const modal = useModal<{ mode: OfferModalMode }>();

    const [searchQuery, setSearchQuery] = useState<string>('');

    const { items: offers, isPending, error } = useOffers({
        companyIds: [customerId]
    });

    if (error) {
        return <RouteError error={error} />;
    }

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={t("common.search")} />

                <Button size="sm" onClick={() => modal.open()}>
                    {t("offers.create")}
                </Button>

                {/* Bestandsverträge ohne Ursprungsangebot im System. */}
                <Button size="sm" variant="secondary" onClick={() => modal.open({ mode: "renewal" })}>
                    {t("offers.createRenewal")}
                </Button>

                <Button size="sm" variant="secondary" onClick={() => modal.open({ mode: "extension" })}>
                    {t("offers.createExtension")}
                </Button>
            </div>

            {isPending && (
                <ListSkeleton rows={3} skeleton={<Skeleton shape="rect" className="h-16" />} />
            )}

            {!isPending && (
                <div className="overflow-x-auto rounded-md border border-(--border) bg-white">
                    <div className="min-w-[940px]">
                        <div className={cn(
                            "grid gap-x-4 border-b border-(--border) bg-(--page-bg) px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-(--fg-3)",
                            COLUMNS,
                        )}>
                            <span>Vorgang</span>
                            {KINDS.map((kind) => <span key={kind}>{STATION[kind].short}</span>)}
                            <span className="text-right">Netto</span>
                            <span />
                        </div>

                        {offers.map(offer => <FlowTableRow key={offer.id} offer={offer} customerId={customerId} />)}

                        {offers.length === 0 && (
                            <p className="py-8 text-center text-sm text-(--fg-3)">Keine Vorgänge in dieser Ansicht.</p>
                        )}
                    </div>
                </div>
            )}

            {modal.isOpen && (
                <OfferModal
                    key={modal.key}
                    mode={modal.data?.mode}
                    onClose={modal.close}
                />
            )}
        </div>
    );
}
