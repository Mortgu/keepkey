import { Link } from "@tanstack/react-router";
import {
    columnFilteringFeature,
    createFilteredRowModel,
    createSortedRowModel,
    filterFns,
    globalFilteringFeature,
    rowSortingFeature,
    sortFns,
    tableFeatures,
    useTable,
} from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ChevronRight, ChevronsUpDown } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";
import { derivePhase, deriveStages } from "../flow/flow-derive";
import { STATE_LABEL, STATION, eur, stateTone } from "../flow/flow-meta";
import { PHASE_LABELS } from "../flow/flow-types";
import type { ReactNode } from "react";
import type { Column, ColumnDef, FilterFn } from "@tanstack/react-table";
import type { FlowStage, Phase, StageKind } from "../flow/flow-types";
import type { Offer } from "@keepit/schemas";
import type { OfferModalMode } from "@/components/modules/modals/offer/offer-modal-policy";
import { useModal, useOffers } from "@/hooks";
import OfferModal from "@/components/modules/modals/offer/offer-modal";
import { Button, ListSkeleton, MultiDropdown, RouteError, SearchBar, Skeleton } from "@/components";

/**
 * Reiter "Vorgänge" als Tabelle. Eine Zeile ist ein Vorgang: das Angebot und
 * die davon abhängigen, aber gleichrangigen Belege Bestellung (an den
 * Zulieferer), Auftragsbestätigung und Rechnung (an den Kunden) — keine
 * erzwungene Bearbeitungsreihenfolge, nur eine Übersicht je Spalte. Die
 * Zeile öffnet die Vorgangs-Seite. Zustand pro Spalte kommt aus `flow-derive.ts`,
 * berechnet aus dem Angebot samt (optional geladener) Bestellung.
 *
 * Suche, Sortierung und Phasen-Filter laufen client-seitig über TanStack Table:
 * Vorgänge eines Kunden passen in eine Seite, und die Suche trifft so auch
 * BE/AB/RE-Nummern, die der Server nicht durchsucht. Das Markup bleibt eigenes
 * Grid — die Tabelle liefert nur Zustand und Zeilenmodell.
 */

/** Obergrenze des Servers (`offerFilterSchema.limit`); mehr lädt der Reiter nicht nach. */
const PAGE_LIMIT = 100;

const COLUMNS = "grid-cols-[repeat(4,minmax(104px,1fr)_minmax(104px,1fr))_96px_16px]";
const KINDS = ["offer", "order", "confirmation", "invoice"] as const;

type Stages = ReturnType<typeof deriveStages>;

interface FlowRow {
    offer: Offer;
    stages: Stages;
    phase: Phase;
    /** Alles, was die Zeile anzeigt, kleingeschrieben — Grundlage der Suche. */
    searchText: string;
}

/** Ungeformtes ISO-Datum je Beleg, damit die Sortierung nicht am Anzeigeformat hängt. */
function rawDate(offer: Offer, kind: StageKind): string | undefined {
    const order = offer.order ?? null;
    switch (kind) {
        case "offer": return offer.date;
        case "order": return order?.date;
        case "confirmation": return order?.confirmation?.date;
        case "invoice": return order?.invoice?.date;
    }
}

function toFlowRow(offer: Offer): FlowRow {
    const stages = deriveStages(offer);
    const phase = derivePhase(offer, stages);
    const searchText = [
        ...stages.flatMap((stage) => [stage.number, stage.date]),
        eur(offer.net_amount),
        PHASE_LABELS[phase],
    ].filter(Boolean).join(" ").toLowerCase();

    return { offer, stages, phase, searchText };
}

const features = tableFeatures({
    rowSortingFeature,
    columnFilteringFeature,
    globalFilteringFeature,
    sortedRowModel: createSortedRowModel(),
    filteredRowModel: createFilteredRowModel(),
    sortFns,
    filterFns,
});

type FlowColumn = Column<typeof features, FlowRow>;

const matchesSearch: FilterFn<typeof features, FlowRow> = (row, _columnId, value: string) =>
    row.original.searchText.includes(value.trim().toLowerCase());

const columns: Array<ColumnDef<typeof features, FlowRow>> = [
    ...KINDS.flatMap((kind, i): Array<ColumnDef<typeof features, FlowRow>> => [
        { id: `${kind}Number`, accessorFn: (row) => row.stages[i].number, sortFn: "alphanumeric", sortUndefined: "last" },
        // ISO-Strings sortieren lexikografisch chronologisch.
        { id: `${kind}Date`, accessorFn: (row) => rawDate(row.offer, kind), sortFn: "text", sortUndefined: "last" },
    ]),
    { id: "net", accessorFn: (row) => row.offer.net_amount, sortFn: "basic" },
    { id: "phase", accessorFn: (row) => row.phase, filterFn: "arrIncludesSome", enableSorting: false },
];

const PHASE_OPTIONS = (Object.keys(PHASE_LABELS) as Array<Phase>).map((phase) => ({ value: phase, label: PHASE_LABELS[phase] }));

function SortHeader({ column, children, className }: { column: FlowColumn; children: ReactNode; className?: string }) {
    const sorted = column.getIsSorted();
    const Icon = sorted === "asc" ? ArrowUp : sorted === "desc" ? ArrowDown : ChevronsUpDown;

    return (
        <button
            type="button"
            onClick={column.getToggleSortingHandler()}
            className={cn(
                "group flex min-w-0 items-center gap-1 text-left uppercase tracking-wide hover:text-(--text)",
                sorted && "text-(--text)",
                className,
            )}
        >
            <span className="truncate">{children}</span>
            <Icon className={cn("size-3 shrink-0", !sorted && "opacity-0 group-hover:opacity-100")} />
        </button>
    );
}

function StageCells({ stage }: { stage: FlowStage }) {
    const inactive = stage.state === "locked" || stage.state === "action";

    return (
        <>
            <p className={cn(
                "min-w-0 truncate pr-2 font-mono text-sm font-medium",
                inactive && "font-sans text-sm font-normal text-(--fg-3)",
                stage.state === "cancelled" ? "text-(--fg-3) line-through" : !inactive && "text-(--text)",
            )}>
                {inactive ? STATE_LABEL.locked : stage.number}
            </p>
            <p className={cn("min-w-0 truncate pr-6 text-sm", stateTone(stage.state))}>
                {inactive ? "-"
                    : stage.state === "busy" ? "wird erzeugt"
                        : stage.state === "failed" ? "fehlgeschlagen"
                            : stage.state === "cancelled" ? "storniert"
                                : stage.date}
            </p>
        </>
    );
}

function FlowTableRow({ row, customerId }: { row: FlowRow; customerId: string }) {
    const cancelled = row.phase === "cancelled";

    return (
        <Link
            to="/customers/$customerId/vorgang/$flowId"
            params={{ customerId, flowId: row.offer.id }}
            className={cn(
                "grid items-center border-b border-(--border) px-4 py-3 outline-none transition-colors last:border-b-0",
                "hover:bg-(--page-bg) focus-visible:shadow-[inset_0_0_0_2px_var(--primary-400)]",
                COLUMNS,
                cancelled && "bg-(--page-bg)",
            )}
        >
            {row.stages.map((stage) => (
                <StageCells key={stage.kind} stage={stage} />
            ))}

            <p className={cn("pr-3 text-right text-[14px] font-medium tabular-nums", cancelled && "text-(--fg-3) line-through")}>
                {eur(row.offer.net_amount)}
            </p>

            <ChevronRight className="size-4 text-(--fg-3)" />
        </Link>
    );
}

export default function CustomerFlowTab({ customerId }: { customerId: string }) {
    const { t } = useTranslation();
    const modal = useModal<{ mode: OfferModalMode }>();

    const { items: offers, nextCursor, isPending, error } = useOffers({
        companyIds: [customerId],
        limit: PAGE_LIMIT,
    });

    const data = useMemo(() => offers.map(toFlowRow), [offers]);

    const table = useTable({
        features,
        columns,
        data,
        globalFilterFn: matchesSearch,
        // Die Suche prüft `searchText` der ganzen Zeile — eine Spalte genügt als Einstieg.
        getColumnCanGlobalFilter: (column) => column.id === "offerNumber",
    });

    if (error) {
        return <RouteError error={error} />;
    }

    const column = (id: string) => table.getColumn(id)!;
    const phaseColumn = column("phase");
    const rows = table.getRowModel().rows;

    return (
        <div className="w-full grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <MultiDropdown
                    label="Status"
                    options={PHASE_OPTIONS}
                    values={(phaseColumn.getFilterValue() as Array<string> | undefined) ?? []}
                    onChange={(values) => phaseColumn.setFilterValue(values.length > 0 ? values : undefined)}
                />

                <SearchBar
                    value={(table.state.globalFilter as string | undefined) ?? ""}
                    onChange={(value) => table.setGlobalFilter(value)}
                    placeholder={t("common.search")}
                />



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
                            "grid border-b border-(--border) bg-(--page-bg) px-4 py-2 text-[11px] font-medium text-(--fg-3)",
                            COLUMNS,
                        )}>
                            {KINDS.map((kind) => [
                                <SortHeader key={`${kind}Number`} column={column(`${kind}Number`)} className="pr-2">
                                    {STATION[kind].short} Nr.
                                </SortHeader>,
                                <SortHeader key={`${kind}Date`} column={column(`${kind}Date`)} className="pr-6">
                                    Datum
                                </SortHeader>,
                            ])}
                            <SortHeader column={column("net")} className="justify-end pr-3">Netto</SortHeader>
                            <span />
                        </div>

                        {rows.map((row) => <FlowTableRow key={row.original.offer.id} row={row.original} customerId={customerId} />)}

                        {rows.length === 0 && (
                            <p className="py-8 text-center text-sm text-(--fg-3)">
                                {data.length === 0 ? "Keine Vorgänge in dieser Ansicht." : "Keine Vorgänge passen zu Suche oder Filter."}
                            </p>
                        )}
                    </div>
                </div>
            )}

            {nextCursor && (
                <p className="text-xs text-(--fg-3)">
                    Es werden die neuesten {PAGE_LIMIT} Vorgänge angezeigt; Suche und Filter berücksichtigen ältere nicht.
                </p>
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
