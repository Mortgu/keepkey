import { Button } from "@/components";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "tailwind-variants";
import { STATION, eur, stateTone } from "../flow/flow-meta";
import type { Flow, FlowStage, Phase } from "../flow/flow-mock";
import { MOCK_FLOWS, PHASE_LABELS } from "../flow/flow-mock";

/**
 * DESIGN-PROTOTYP — Reiter "Vorgänge" als Tabelle.
 *
 * Eine Zeile ist ein Vorgang (Angebot → Bestellung → Auftragsbestätigung →
 * Rechnung), eine Spalte je Beleg. Die Zeile öffnet die Vorgangs-Seite.
 * Daten kommen aus `flow-mock.ts`, Texte sind noch nicht übersetzt.
 */

const COLUMNS = "grid-cols-[minmax(240px,2.4fr)_repeat(4,minmax(124px,1fr))_112px_20px]";
const KINDS = ["offer", "order", "confirmation", "invoice"] as const;

const DERIVATION_LABEL = { renewal: "Verlängerung", extension: "Erweiterung" } as const;

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
        <div className="grid  min-w-0">
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

function FlowTableRow({ flow, customerId }: { flow: Flow; customerId: string }) {
    const cancelled = flow.phase === "cancelled";

    return (
        <Link
            to="/customers/$customerId/vorgang/$flowId"
            params={{ customerId, flowId: flow.id }}
            className={cn(
                "grid items-center gap-x-4 border-b border-(--border) px-4 py-3 outline-none transition-colors last:border-b-0",
                "hover:bg-(--page-bg) focus-visible:shadow-[inset_0_0_0_2px_var(--primary-400)]",
                COLUMNS,
                cancelled && "bg-(--page-bg)",
            )}
        >
            <div className="min-w-0">
                <p className="truncate text-[14px] font-medium">{flow.title}</p>
                <p className="mt-0.5 flex items-center gap-2 truncate text-xs text-(--fg-3)">
                    <span className="truncate">{flow.contactPerson}</span>
                    {flow.derivation && (
                        <span className="rounded bg-(--subtle-50) px-1.5 py-px text-[11px] text-(--fg-2)">
                            {DERIVATION_LABEL[flow.derivation.type]}
                        </span>
                    )}
                </p>
            </div>

            {flow.stages.map((stage) => (
                <div key={stage.kind} className="min-w-0"><StageCell stage={stage} /></div>
            ))}

            <p className={cn("text-right text-[14px] font-medium tabular-nums", cancelled && "text-(--fg-3) line-through")}>
                {eur(flow.netCents)}
            </p>

            <ChevronRight className="size-4 text-(--fg-3)" />
        </Link>
    );
}

type Filter = "all" | Phase;
const FILTERS: Array<Filter> = ["all", "open", "running", "billed", "cancelled"];

export default function CustomerFlowTab({ customerId }: { customerId: string }) {
    const [filter, setFilter] = useState<Filter>("all");

    const flows = MOCK_FLOWS.filter((flow) => filter === "all" || flow.phase === filter);
    const count = (f: Filter) => (f === "all" ? MOCK_FLOWS.length : MOCK_FLOWS.filter((x) => x.phase === f).length);

    return (
        <div className="grid gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="tablist" aria-label="Vorgänge filtern" className="flex flex-wrap gap-1.5">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            type="button"
                            role="tab"
                            aria-selected={filter === f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "flex h-8 cursor-pointer items-center gap-1.5 rounded-full border px-3 text-[13px] transition-colors outline-none focus-visible:shadow-(--focus-ring)",
                                filter === f
                                    ? "border-(--primary-600) bg-(--primary-50) font-medium text-(--primary-600)"
                                    : "border-(--border) bg-white text-(--fg-2) hover:border-(--border-200)",
                            )}
                        >
                            {f === "all" ? "Alle" : PHASE_LABELS[f]}
                            <span className="tabular-nums text-(--fg-3)">{count(f)}</span>
                        </button>
                    ))}
                </div>

                <Button size="sm" icon={<Plus />}>Angebot erstellen</Button>
            </div>

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

                    {flows.map((flow) => <FlowTableRow key={flow.id} flow={flow} customerId={customerId} />)}

                    {flows.length === 0 && (
                        <p className="py-8 text-center text-sm text-(--fg-3)">Keine Vorgänge in dieser Ansicht.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
