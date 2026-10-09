import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "tailwind-variants";
import { derivePhase, deriveStages } from "../flow/flow-derive";
import { STATION, eur, stateTone } from "../flow/flow-meta";
import { DERIVATION_LABEL, PHASE_LABELS } from "../flow/flow-types";
import type { Offer } from "@keepit/schemas";
import type { FlowStage, Phase } from "../flow/flow-types";
import { Button, FilterTabBar, ListSkeleton, RouteError, Skeleton } from "@/components";
import { useLocale, useModal, useOffers } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import OfferModal from "@/routes/_main/offers/-components/modals/offer-modal";

/**
 * Reiter "Vorgänge" als Tabelle. Eine Zeile ist ein Vorgang (Angebot →
 * Bestellung → Auftragsbestätigung → Rechnung), eine Spalte je Beleg. Die
 * Zeile öffnet die Vorgangs-Seite. Zustand pro Spalte kommt aus `flow-derive.ts`,
 * berechnet aus dem Angebot samt (optional geladener) Bestellung.
 */

const COLUMNS = "grid-cols-[minmax(240px,2.4fr)_repeat(4,minmax(124px,1fr))_112px_20px]";
const KINDS = ["offer", "order", "confirmation", "invoice"] as const;

function StageCell({ stage }: { stage: FlowStage }) {
    if (stage.state === "locked") {
        return <span className="text-(--border-200)">—</span>;
    }

    if (stage.state === "action") {
        return (
            <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-(--primary-400) bg-(--primary-50) px-2 py-0.5 text-xs font-medium text-(--primary-600)">
                <Plus className="size-3" /> anlegen
            </span>
        );
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
                <div key={stage.kind} className="min-w-0"><StageCell stage={stage} /></div>
            ))}

            <p className={cn("text-right text-[14px] font-medium tabular-nums", cancelled && "text-(--fg-3) line-through")}>
                {eur(offer.net_amount)}
            </p>

            <ChevronRight className="size-4 text-(--fg-3)" />
        </Link>
    );
}

type Filter = "all" | Phase;

const FILTERS: Array<Filter> = ["all", "open", "running", "billed", "cancelled"];

export default function CustomerFlowTab({ customerId }: { customerId: string }) {
    const [filter, setFilter] = useState<Filter>("all");
    const modal = useModal();

    const { items: offers, isPending, error } = useOffers({ companyIds: [customerId], includeOrder: "true" });

    const withPhase = useMemo(
        () => offers.map((offer) => {
            const stages = deriveStages(offer);
            return { offer, phase: derivePhase(offer, stages) };
        }),
        [offers],
    );

    const count = (f: Filter) => (f === "all" ? withPhase.length : withPhase.filter((x) => x.phase === f).length);
    const visible = withPhase.filter((x) => filter === "all" || x.phase === filter);

    const filterTabs = FILTERS.map((f) => ({
        value: f,
        label: `${f === "all" ? "Alle" : PHASE_LABELS[f]} · ${count(f)}`,
    }));

    if (error) return <RouteError error={error} />;

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <FilterTabBar
                    tabs={filterTabs}
                    value={filter}
                    onChange={(value) => setFilter(value as Filter)}
                />

                <Button size="sm" icon={<Plus />} onClick={() => modal.open()}>Angebot erstellen</Button>
            </div>

            {isPending ? (
                <ListSkeleton rows={3} skeleton={<Skeleton shape="rect" className="h-16" />} />
            ) : (
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

                        {visible.map(({ offer }) => <FlowTableRow key={offer.id} offer={offer} customerId={customerId} />)}

                        {visible.length === 0 && (
                            <p className="py-8 text-center text-sm text-(--fg-3)">Keine Vorgänge in dieser Ansicht.</p>
                        )}
                    </div>
                </div>
            )}

            {modal.isOpen && (
                <OfferModal key={modal.key} preselectedCustomerId={customerId} onClose={modal.close} />
            )}
        </div>
    );
}
