import { Accordion, Breadcrumbs, Button } from "@/components";
import ConfirmationModal from "@/components/modules/modals/confirmation/confirmation-modal";
import OfferModal from "@/components/modules/modals/offer/offer-modal";
import type { OfferModalMode } from "@/components/modules/modals/offer/offer-modal-policy";
import { useCancelOrder, useCreateConfirmation, useGenerateOfferDocument, useGenerateOrderDocument, useLocale, useModal, useRegenerateConfirmation } from "@/hooks";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { localized } from "@/lib/i18n-content";
import DiscountRow from "@/routes/_main/-components/card/discount-row";
import { default as DocumentCard } from "@/routes/_main/-components/card/document-card";
import FlatRateRow from "@/routes/_main/-components/card/flatrate-row";
import PositionRow from "@/routes/_main/-components/card/position-row";
import OrderModal from "@/routes/_main/orders/-components/modal/order-modal";
import OrderEditModal from "@/routes/_main/orders/-components/order-edit-modal";
import { formatEur } from "@/utils/utils";
import type { Confirmation, Customer, Offer, Order } from "@keepit/schemas";
import { vatTotals } from "@keepit/schemas";
import { Ban, Pen, Plus } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";
import { derivePhase, deriveStages } from "../../../-components/flow/flow-derive";
import { STATE_LABEL, STATION, eur, stateTone } from "../../../-components/flow/flow-meta";
import type { FlowStage } from "../../../-components/flow/flow-types";
import { DERIVATION_LABEL, PHASE_LABELS } from "../../../-components/flow/flow-types";
import { StageNode } from "../../../-components/flow/flow-ui";

/**
 * Detailseite eines Vorgangs. Links die Belege zum Angebot: Bestellung (an
 * den Zulieferer), Auftragsbestätigung und Rechnung (an den Kunden) sind
 * eigenständige, vom Angebot abhängige, aber gleichrangige Belege — keine
 * erzwungene Bearbeitungsreihenfolge. Rechts die Zusammenfassung des
 * Geschäfts. Jede Stufe bindet dieselben Bausteine ein, die auch
 * Angebots-/Bestellkarte benutzen — keine eigene Logik, nur Wiederverwendung.
 */

// AB/Rechnung benötigen technisch (DB-FK) eine angelegte Bestellung, auch wenn
// sie fachlich kein nachfolgender Schritt sind.
const LOCKED_HINT: Partial<Record<FlowStage["kind"], string>> = {
    confirmation: "Noch nicht angelegt. Dafür wird eine angelegte Bestellung benötigt.",
    invoice: "Noch nicht angelegt. Dafür wird eine angelegte Bestellung benötigt.",
};

const LOCKED_ACTION_LABEL: Partial<Record<FlowStage["kind"], string>> = {
    confirmation: "Auftragsbestätigung anlegen",
    invoice: "Rechnung anlegen",
};

/* ───────────────────────────────
   Strecke (Kurzüberblick, springt zum Abschnitt)
   ─────────────────────────────── */

function Overview({ stages }: { stages: ReadonlyArray<FlowStage> }) {
    return (
        <nav aria-label="Ablauf" className="grid grid-cols-4 rounded-md border border-(--border) bg-white">
            {stages.map((stage) => (
                <a
                    key={stage.kind}
                    href={`#${stage.kind}`}
                    className="flex min-w-0 items-center gap-3 border-l border-(--border) px-4 py-3 outline-none first:border-l-0 hover:bg-(--page-bg) focus-visible:shadow-[inset_0_0_0_2px_var(--primary-400)]"
                >
                    <StageNode kind={stage.kind} state={stage.state} />
                    <span className="min-w-0">
                        <span className="block truncate text-[11px] font-medium uppercase tracking-wide text-(--fg-3)">
                            {STATION[stage.kind].label}
                        </span>
                        <span className={cn(
                            "block truncate text-[13px]",
                            stage.number ? "font-mono text-(--text)" : stateTone(stage.state),
                            stage.state === "cancelled" && "line-through",
                        )}>
                            {stage.number ?? STATE_LABEL[stage.state]}
                        </span>
                    </span>
                </a>
            ))}
        </nav>
    );
}

/* ───────────────────────────────
   Stufen-Hülle (Kopf + Rahmen, Inhalt kommt von außen)
   ─────────────────────────────── */

function StageShell({ stage, headerActions, children }: {
    stage: FlowStage;
    headerActions?: ReactNode;
    children?: ReactNode;
}) {
    const { label } = STATION[stage.kind];
    const muted = stage.state === "cancelled";

    return (
        <section id={stage.kind} className={cn("scroll-mt-4 rounded-md border border-(--border) bg-white", muted && "bg-(--page-bg)")}>
            <header className="flex flex-wrap items-center justify-between gap-3 border-b border-(--border) px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <StageNode kind={stage.kind} state={stage.state} />
                    <div className="min-w-0">
                        <h2 className="text-[14px] font-medium">{label}</h2>
                        <p className="flex items-center gap-2 text-xs">
                            {stage.number && (
                                <span className={cn("font-mono text-(--text)", stage.state === "cancelled" && "line-through")}>
                                    {stage.number}
                                </span>
                            )}
                            {stage.date && <span className="text-(--fg-3)">{formatDate(stage.date)}</span>}
                            <span className={stateTone(stage.state)}>{stage.note ?? STATE_LABEL[stage.state]}</span>
                        </p>
                    </div>
                </div>

                {headerActions && <div className="flex flex-wrap gap-1.5">{headerActions}</div>}
            </header>

            {stage.state === "locked" && (
                <p className="px-4 py-4 text-[13px] text-(--fg-3)">{LOCKED_HINT[stage.kind]}</p>
            )}

            {stage.state === "cancelled" && !children && (
                <p className="px-4 py-4 text-[13px] text-(--fg-3)">Entfällt, weil die Bestellung storniert wurde.</p>
            )}

            {stage.state === "action" && !children && (
                <p className="px-4 py-4 text-[13px] text-(--fg-3)">
                    Noch nicht angelegt. Die Nummer vergeben Sie beim Anlegen; sie lässt sich danach nicht mehr ändern.
                </p>
            )}

            {children}
        </section>
    );
}

/* ───────────────────────────────
   Angebots-Stufe
   ─────────────────────────────── */

function OfferStageSection({ stage, offer }: { stage: FlowStage; offer: Offer }) {
    const offerModal = useModal<{ mode: OfferModalMode }>();
    const { generateOfferDocument, isGenerating } = useGenerateOfferDocument();
    const locked = Boolean(offer.acceptedAt);

    return (
        <StageShell
            stage={stage}
            headerActions={(
                <>
                    <Button
                        size="xs"
                        variant="border"
                        disabled={locked}
                        title={locked ? "Angenommene Angebote können nicht mehr geändert werden." : "Bearbeiten"}
                        onClick={() => offerModal.open()}
                        icon={<Pen className="size-3" />}
                        iconOnly
                    />
                    <Button size="xs" variant="secondary" onClick={() => offerModal.open({ mode: "renewal" })}>Verlängern</Button>
                    <Button size="xs" variant="secondary" onClick={() => offerModal.open({ mode: "extension" })}>Erweitern</Button>
                </>
            )}
        >
            <Accordion defaultValue={["documents"]}>
                <Accordion.Section value="products" label="Produkte">
                    {offer.offerPositions.map((position) => (
                        <PositionRow key={position.id} position={position} contract={offer.contract} durationMonths={offer.duration_months} />
                    ))}
                    {offer.offerFlatRates.map((flatrate) => (
                        <FlatRateRow key={flatrate.id} flatrate={flatrate} />
                    ))}
                    {offer.offerDiscounts.map((discount) => (
                        <DiscountRow key={discount.id} discount={discount} />
                    ))}
                </Accordion.Section>

                <Accordion.Section
                    value="documents"
                    label="Dokumente"
                    aside={(
                        <Button
                            className="min-w-fit h-auto rounded-none border-l border-(--border) px-4"
                            variant="secondary"
                            size="xs"
                            loading={isGenerating}
                            disabled={isGenerating || locked}
                            onClick={() => generateOfferDocument({ offerId: offer.id })}
                        >
                            Dokument generieren
                        </Button>
                    )}
                >
                    {offer.offerDocuments.map((document) => (
                        <DocumentCard key={document.id} type="offer" parentId={offer.id} document={document} locked={locked} />
                    ))}
                    {offer.offerDocuments.length === 0 && (
                        <p className="py-4 text-center text-sm text-(--fg-3)">Noch keine Dokumente generiert!</p>
                    )}
                </Accordion.Section>
            </Accordion>

            {offerModal.isOpen && (
                <OfferModal key={offerModal.key} mode={offerModal.data?.mode} sourceOffer={offer} onClose={offerModal.close} />
            )}
        </StageShell>
    );
}

/* ───────────────────────────────
   Bestellungs-Stufe
   ─────────────────────────────── */

function OrderStageSection({ stage, offer, order }: { stage: FlowStage; offer: Offer; order: Order | null }) {
    const orderModal = useModal();
    const [editing, setEditing] = useState(false);
    const { generateOrderDocument, isGeneratingDocument } = useGenerateOrderDocument();
    const { cancelOrder, isCancellingOrder, errorCancellingOrder } = useCancelOrder();

    if (!order) {
        return (
            <StageShell
                stage={stage}
                headerActions={(
                    <Button size="xs" icon={<Plus />} onClick={() => orderModal.open()}>Bestellung anlegen</Button>
                )}
            >
                {orderModal.isOpen && <OrderModal key={orderModal.key} offer={offer} onClose={orderModal.close} />}
            </StageShell>
        );
    }

    const cancelled = Boolean(order.cancelledAt);
    const cancel = async () => {
        if (!confirm(`Bestellung ${order.orderId} stornieren?`)) return;
        try { await cancelOrder({ orderId: order.id, expectedVersion: order.version }); } catch { /* unten gerendert */ }
    };

    return (
        <StageShell
            stage={stage}
            headerActions={(
                <>
                    <Button size="xs" variant="secondary" disabled={cancelled} onClick={() => setEditing(true)} icon={<Pen className="size-3" />}>Bearbeiten</Button>
                    <Button size="xs" variant="secondary" danger disabled={cancelled || isCancellingOrder} loading={isCancellingOrder} onClick={cancel} icon={<Ban className="size-3" />}>Stornieren</Button>
                </>
            )}
        >
            {errorCancellingOrder && (
                <p role="alert" className="px-4 pt-3 text-sm text-(--destructive)">{getErrorMessage(errorCancellingOrder)}</p>
            )}

            <Accordion defaultValue={["documents"]}>
                <Accordion.Section value="products" label="Produkte">
                    {order.orderPositions.map((position) => (
                        <PositionRow key={position.id} position={position} contract={order.contract} durationMonths={order.duration_months} />
                    ))}
                    {order.flatRates.map((flatrate) => (
                        <FlatRateRow key={flatrate.id} flatrate={flatrate} />
                    ))}
                    {order.discounts.map((discount) => (
                        <DiscountRow key={discount.id} discount={discount} />
                    ))}
                </Accordion.Section>

                <Accordion.Section value="details" label="Details">
                    <dl className="grid gap-2 py-3 text-sm">
                        <dt>Projektnummer</dt><dd>{order.projectNumber || "—"}</dd>
                        <dt>Projektbeschreibung</dt><dd>{order.projectDescription || "—"}</dd>
                        <dt>Details</dt><dd>{order.orderDetails || "—"}</dd>
                        <dt>Vertragsbeginn</dt><dd>{order.contractStartDate ? formatDate(order.contractStartDate) : "—"}</dd>
                    </dl>
                </Accordion.Section>

                <Accordion.Section
                    value="documents"
                    label="Dokumente"
                    aside={(
                        <Button
                            className="min-w-fit h-auto rounded-none border-l border-(--border) px-4"
                            variant="secondary"
                            size="xs"
                            loading={isGeneratingDocument}
                            disabled={isGeneratingDocument || cancelled}
                            onClick={() => generateOrderDocument({ orderId: order.id })}
                        >
                            Dokument generieren
                        </Button>
                    )}
                >
                    {order.documents.map((document) => (
                        <DocumentCard key={document.id} type="order" parentId={order.id} document={document} />
                    ))}
                    {order.documents.length === 0 && (
                        <p className="py-4 text-center text-sm text-(--fg-3)">Noch keine Dokumente generiert!</p>
                    )}
                </Accordion.Section>
            </Accordion>

            {editing && <OrderEditModal order={order} onClose={() => setEditing(false)} onCreated={() => setEditing(false)} />}
        </StageShell>
    );
}

/* ───────────────────────────────
   Auftragsbestätigungs-Stufe
   ─────────────────────────────── */

function ConfirmationStageSection({ stage, order, confirmation }: { stage: FlowStage; order: Order | null; confirmation: Confirmation | null }) {
    const { t } = useTranslation();
    const modal = useModal();

    const {
        createConfirmation,
        isCreatingConfirmation,
        errorCreatingConfirmation
    } = useCreateConfirmation(order?.id!);
    const {
        regenerateConfirmation,
        isRegenerating
    } = useRegenerateConfirmation(order?.id!);

    const renderHeaderActions = () => (
        <>
            <Button
                size="xs"
                variant="secondary"
                onClick={() => modal.open()}
                disabled={stage.state === "locked"}
            >
                {confirmation && (
                    <>{t("button.edit")}</>
                )}

                {!confirmation && (
                    <>{t("button.create")}</>
                )}
            </Button>

            {confirmation?.documents && (
                <Button
                    size="xs"
                    variant="primary"
                    onClick={() => regenerateConfirmation()}
                    disabled={stage.state === "locked" || isRegenerating}
                    loading={isRegenerating}
                >
                    {t("orders.confirmation.regenerate")}
                </Button>
            )}
        </>
    );

    return (
        <StageShell stage={stage} headerActions={renderHeaderActions()}>
            <div className="px-4">
                {confirmation?.documents.map(document => (
                    <DocumentCard key={document.id} type="confirmation" parentId={order!.id} document={document} />
                ))}
            </div>
            {modal.isOpen && (
                <ConfirmationModal onClose={modal.close} />
            )}
        </StageShell>
    );
}

/* ───────────────────────────────
   Seitenleiste
   ─────────────────────────────── */

function Summary({ offer, customer }: { offer: Offer; customer: Customer | undefined }) {
    const preview = vatTotals(offer.net_amount, customer?.taxRate ?? 0);
    const rows: Array<[string, string]> = [
        ["Kunde", offer.customer.companyName],
        ["Ansprechpartner", `${offer.customerContactPerson.firstName} ${offer.customerContactPerson.lastName}`.trim()],
        ["Laufzeit", `${offer.duration_months} Monate`],
        ["Zahlungsziel", offer.paymentTerm],
    ];

    return (
        <section className="rounded-md border border-(--border) bg-white">
            <h2 className="border-b border-(--border) px-4 py-3 text-[14px] font-medium">Zusammenfassung</h2>
            <dl className="grid gap-2 px-4 py-3 text-[13px]">
                {rows.map(([term, value]) => (
                    <div key={term} className="flex justify-between gap-3">
                        <dt className="text-(--fg-3)">{term}</dt>
                        <dd className="text-right">{value}</dd>
                    </div>
                ))}
            </dl>
            <dl className="grid gap-1.5 border-t border-(--border) px-4 py-3 text-[13px] tabular-nums">
                <div className="flex justify-between"><dt className="text-(--fg-3)">Netto</dt><dd>{formatEur(offer.net_amount)}</dd></div>
                <div className="flex justify-between">
                    <dt className="text-(--fg-3)">MwSt. (akt. Satz)</dt><dd>{formatEur(preview.vatCents)}</dd>
                </div>
                <div className="flex justify-between text-[15px] font-medium">
                    <dt>Brutto (geschätzt)</dt><dd>{formatEur(preview.grossCents)}</dd>
                </div>
            </dl>
        </section>
    );
}

/* ───────────────────────────────
   Seite
   ─────────────────────────────── */

export default function FlowDetailView({ offer, order, confirmation, customerId, customer }: {
    offer: Offer;
    order: Order | null;
    confirmation: Confirmation | null;
    customerId: string;
    customer: Customer | undefined;
}) {
    const locale = useLocale();
    const stages = deriveStages(offer);
    const phase = derivePhase(offer, stages);
    const [offerStage, orderStage, confirmationStage, invoiceStage] = stages;

    const positions = offer.offerPositions
        .map((p) => localized(p.product.translations, locale, "name"))
        .join(", ");

    const orderSummary = offer.order ?? null;
    // Historische AB/Rechnung bleiben auch nach Stornierung sichtbar — nur wenn
    // nie eine angelegt wurde, entfällt die Sektion ganz (statischer Hinweis).
    const mountConfirmation = Boolean(order) && !(orderSummary?.cancelledAt && !orderSummary.confirmation);
    const mountInvoice = Boolean(order) && !(orderSummary?.cancelledAt && !orderSummary.invoice);

    return (
        <div className="grid gap-5 mx-4 pb-10">
            <div className="flex h-14 items-center border-b border-(--border)">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: "Kunden", to: "/customers" },
                        { label: customer?.companyName ?? "…", to: "/customers/$customerId", params: { customerId } },
                        { label: positions || `AG${offer.quoteId}` },
                    ]}
                />
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-medium">{positions || `AG${offer.quoteId}`}</h1>
                        {offer.derivationType && (
                            <span className="rounded bg-(--subtle-50) px-1.5 py-px text-xs text-(--fg-2)">
                                {DERIVATION_LABEL[offer.derivationType]}
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-(--fg-3)">
                        {`${offer.customerContactPerson.firstName} ${offer.customerContactPerson.lastName}`.trim()} · {PHASE_LABELS[phase]}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-medium tabular-nums">{eur(offer.net_amount)}</p>
                    <p className="text-xs text-(--fg-3)">netto</p>
                </div>
            </div>

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

                </div>

                <aside className="grid gap-4 lg:sticky lg:top-4">
                    <Summary offer={offer} customer={customer} />
                </aside>
            </div>
        </div>
    );
}
