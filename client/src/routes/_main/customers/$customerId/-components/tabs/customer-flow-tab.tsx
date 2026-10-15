import { Button, ListSkeleton, RouteError, SearchBar, Skeleton } from "@/components";
import OfferModal from "@/components/modules/modals/offer/offer-modal";
import type { OfferModalMode } from "@/components/modules/modals/offer/offer-modal-policy";
import { useModal, useOffers } from "@/hooks";
import type { Offer } from "@keepit/schemas";
import { Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Fragment, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";
import { derivePhase, deriveStages } from "../flow/flow-derive";
import { STATE_LABEL, STATION, eur, stateTone } from "../flow/flow-meta";
import type { FlowStage } from "../flow/flow-types";

/**
 * Reiter "Vorgänge" als Tabelle. Eine Zeile ist ein Vorgang: das Angebot und
 * die davon abhängigen, aber gleichrangigen Belege Bestellung (an den
 * Zulieferer), Auftragsbestätigung und Rechnung (an den Kunden) — keine
 * erzwungene Bearbeitungsreihenfolge, nur eine Übersicht je Spalte. Die
 * Zeile öffnet die Vorgangs-Seite. Zustand pro Spalte kommt aus `flow-derive.ts`,
 * berechnet aus dem Angebot samt (optional geladener) Bestellung.
 */

const COLUMNS = "grid-cols-[repeat(4,minmax(104px,1fr)_minmax(84px,0.8fr))_96px_16px]";
const KINDS = ["offer", "order", "confirmation", "invoice"] as const;

function StageCells({ stage }: { stage: FlowStage }) {
    const inactive = stage.state === "locked" || stage.state === "action";

    return (
        <>
            <p className={cn(
                "min-w-0 truncate pr-2 font-mono text-sm font-medium",
                inactive && "font-sans text-xs font-normal text-(--fg-3)",
                stage.state === "cancelled" ? "text-(--fg-3) line-through" : !inactive && "text-(--text)",
            )}>
                {inactive ? STATE_LABEL.locked : stage.number}
            </p>
            <p className={cn("min-w-0 truncate pr-6 text-xs", stateTone(stage.state))}>
                {inactive ? null
                    : stage.state === "busy" ? "wird erzeugt"
                        : stage.state === "failed" ? "fehlgeschlagen"
                            : stage.state === "cancelled" ? "storniert"
                                : stage.date}
            </p>
        </>
    );
}

function FlowTableRow({ offer, customerId }: { offer: Offer; customerId: string }) {
    const stages = useMemo(() => deriveStages(offer), [offer]);

    const phase = derivePhase(offer, stages);

    const cancelled = phase === "cancelled";

    return (
        <Link
            to="/customers/$customerId/vorgang/$flowId"
            params={{ customerId, flowId: offer.id }}
            className={cn(
                "grid items-center border-b border-(--border) px-4 py-3 outline-none transition-colors last:border-b-0",
                "hover:bg-(--page-bg) focus-visible:shadow-[inset_0_0_0_2px_var(--primary-400)]",
                COLUMNS,
                cancelled && "bg-(--page-bg)",
            )}
        >
            {stages.map((stage) => (
                <StageCells key={stage.kind} stage={stage} />
            ))}

            <p className={cn("pr-3 text-right text-[14px] font-medium tabular-nums", cancelled && "text-(--fg-3) line-through")}>
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
                    <div className="min-w-[1000px]">
                        <div className={cn(
                            "grid border-b border-(--border) bg-(--page-bg) px-4 py-2 text-[11px] font-medium uppercase tracking-wide text-(--fg-3)",
                            COLUMNS,
                        )}>
                            {KINDS.map((kind) => (
                                <Fragment key={kind}>
                                    <span className="truncate pr-2">{STATION[kind].short} Nr.</span>
                                    <span className="pr-6">Datum</span>
                                </Fragment>
                            ))}
                            <span className="pr-3 text-right">Netto</span>
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
