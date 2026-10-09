import { cn } from "tailwind-variants";
import { Menu } from "@base-ui/react";
import {
    Download,
    EllipsisVertical,
    ExternalLink,
    Eye,
    LoaderCircle,
    Pencil,
    Plus,
    RefreshCw,
    Replace,
    Trash2,
    UploadCloud,
} from "lucide-react";
import { PHASE_LABELS } from "../../../-components/flow/flow-mock";
import { STATE_LABEL, STATION, eur, stateTone } from "../../../-components/flow/flow-meta";
import { StageNode } from "../../../-components/flow/flow-ui";
import type { Flow, FlowDocument, FlowStage } from "../../../-components/flow/flow-mock";
import { Accordion, Badge, Breadcrumbs, Button, menuStyles } from "@/components";

/**
 * DESIGN-PROTOTYP — Detailseite eines Vorgangs.
 *
 * Links die vier Belege untereinander in Reihenfolge des Ablaufs, rechts die
 * Zusammenfassung des Geschäfts. Keine Logik: Buttons tun
 * nichts, Zahlen kommen aus den Beispieldaten.
 */

const DERIVATION_LABEL = { renewal: "Verlängerung", extension: "Erweiterung" } as const;

const STAGE_ACTIONS: Record<FlowStage["kind"], Array<string>> = {
    offer: ["Verlängern", "Erweitern"],
    order: ["Bearbeiten", "Stornieren"],
    confirmation: [],
    invoice: [],
};

const LOCKED_HINT: Record<FlowStage["kind"], string> = {
    offer: "",
    order: "Wird möglich, sobald das Angebot angenommen ist.",
    confirmation: "Wird möglich, sobald die Bestellung angelegt ist.",
    invoice: "Wird möglich, sobald die Bestellung angelegt ist.",
};

/* ───────────────────────────────
   Strecke (Kurzüberblick, springt zum Abschnitt)
   ─────────────────────────────── */

function Overview({ stages }: { stages: Flow["stages"] }) {
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
   Dokument
   ─────────────────────────────── */

/**
 * Aktionen wie in der heutigen Dokumentkarte (`DocumentCard`): Hochladen,
 * Vorschau, Download (PDF/DOCX) und das Menü mit Nextcloud, Ersetzen,
 * Bearbeiten, Umbenennen und Löschen. Hier nur als Attrappe.
 */
function DocumentRow({ doc }: { doc: FlowDocument }) {
    const busy = doc.status === "PENDING" || doc.status === "PROCESSING";
    const ready = doc.status === "GENERATED" || doc.status === "UPLOADED";
    const menu = menuStyles();

    return (
        <div className="flex items-center justify-between gap-3 border-b border-(--border) py-2 last:border-b-0">
            <div className="flex min-w-0 items-center gap-2">
                <span className="truncate font-mono text-[13px]">{doc.name}</span>
                <Badge variant="GENERATED" format="pdf" size="xs" />
                <Badge variant="GENERATED" format="docx" size="xs" />
                <Badge variant={doc.status} size="xs" />
                {doc.remoteOutdated && (
                    <span className="shrink-0 rounded bg-(--warning-subtle) px-1.5 py-px text-[11px] text-(--warning)">
                        Nextcloud weicht ab
                    </span>
                )}
            </div>

            <div className="flex shrink-0 items-center">
                {doc.remoteOutdated && (
                    <Button size="xs" variant="ghost" iconOnly icon={<RefreshCw size={14} />} title="Mit Nextcloud abgleichen" />
                )}

                {(doc.status === "GENERATED" || doc.status === "UPLOADING") && (
                    <Button size="xs" variant="ghost" iconOnly icon={<UploadCloud size={14} />}
                        title="In Nextcloud hochladen" disabled={doc.status === "UPLOADING"} />
                )}

                {ready && <Button size="xs" variant="ghost" iconOnly icon={<Eye size={14} />} title="Vorschau" />}

                {ready && (
                    <Menu.Root>
                        <Menu.Trigger className={menu.Trigger()}
                            render={<Button size="xs" variant="ghost" iconOnly icon={<Download size={14} />} title="Herunterladen" />} />
                        <Menu.Portal>
                            <Menu.Positioner className={menu.Positioner()} align="end">
                                <Menu.Popup className={menu.Popup()}>
                                    <Menu.Item className={menu.Item()}><Download size={14} /> PDF herunterladen</Menu.Item>
                                    <Menu.Item className={menu.Item()}><Download size={14} /> DOCX herunterladen</Menu.Item>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                )}

                {!busy && doc.status !== "UPLOADING" && (
                    <Menu.Root>
                        <Menu.Trigger className={menu.Trigger()}
                            render={<Button size="xs" variant="ghost" iconOnly icon={<EllipsisVertical size={14} />} title="Weitere Aktionen" />} />
                        <Menu.Portal>
                            <Menu.Positioner className={menu.Positioner()} align="end">
                                <Menu.Popup className={menu.Popup()}>
                                    <Menu.Item className={menu.Item()} disabled><ExternalLink size={14} /> In Nextcloud öffnen</Menu.Item>
                                    <Menu.Item className={menu.Item()}><Replace size={14} /> Datei ersetzen</Menu.Item>
                                    {ready && <Menu.Item className={menu.Item()}><Eye size={14} /> Vorschau</Menu.Item>}
                                    <Menu.Item className={menu.Item()}><Pencil size={14} /> Bearbeiten</Menu.Item>
                                    <Menu.Item className={menu.Item()}><Pencil size={14} /> Umbenennen</Menu.Item>
                                    <Menu.Item className={menu.Item()} data-danger><Trash2 size={14} /> Löschen</Menu.Item>
                                </Menu.Popup>
                            </Menu.Positioner>
                        </Menu.Portal>
                    </Menu.Root>
                )}

                {busy && (
                    <span className="grid size-8 place-items-center text-(--info)" title="Wird erzeugt">
                        <LoaderCircle size={16} className="motion-safe:animate-spin" />
                    </span>
                )}
            </div>
        </div>
    );
}

/* ───────────────────────────────
   Beleg-Abschnitt
   ─────────────────────────────── */

function StageSection({ stage, flow }: { stage: FlowStage; flow: Flow }) {
    const { label } = STATION[stage.kind];
    const muted = stage.state === "locked" || stage.state === "cancelled";
    const total = flow.lines.reduce((sum, line) => sum + line.quantity * line.unitCents * flow.durationMonths, 0);
    const hasContent = stage.state === "done" || stage.state === "failed" || stage.state === "busy"
        || (stage.state === "cancelled" && Boolean(stage.facts));
    const canGenerate = stage.state === "done" || stage.state === "failed";

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
                            {stage.date && <span className="text-(--fg-3)">{stage.date}</span>}
                            <span className={stateTone(stage.state)}>{stage.note ?? STATE_LABEL[stage.state]}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {stage.state === "action" && stage.actionLabel && (
                        <Button size="xs" icon={<Plus />}>{stage.actionLabel}</Button>
                    )}
                    {(stage.state === "done" || stage.state === "failed") &&
                        STAGE_ACTIONS[stage.kind].map((action) => (
                            <Button key={action} size="xs" variant="secondary">{action}</Button>
                        ))}
                </div>
            </header>

            {stage.state === "locked" && (
                <p className="px-4 py-4 text-[13px] text-(--fg-3)">{LOCKED_HINT[stage.kind]}</p>
            )}

            {stage.state === "cancelled" && !stage.facts && (
                <p className="px-4 py-4 text-[13px] text-(--fg-3)">Entfällt, weil die Bestellung storniert wurde.</p>
            )}

            {stage.state === "action" && (
                <p className="px-4 py-4 text-[13px] text-(--fg-3)">
                    Noch nicht angelegt. Die Nummer vergeben Sie beim Anlegen; sie lässt sich danach nicht mehr ändern.
                </p>
            )}

            {hasContent && (
                <Accordion defaultValue={["documents"]}>
                    {stage.kind === "offer" ? (
                        <Accordion.Section value="products" label="Produkte">
                            <div className="-mx-4 overflow-x-auto">
                                <table className="w-full min-w-[480px] border-collapse text-[13px]">
                                    <thead>
                                        <tr className="text-left text-[11px] font-medium uppercase tracking-wide text-(--fg-3)">
                                            <th className="px-4 py-2 font-medium">Position</th>
                                            <th className="px-2 py-2 text-right font-medium">Menge</th>
                                            <th className="px-2 py-2 text-right font-medium">€ / User / Monat</th>
                                            <th className="px-4 py-2 text-right font-medium">Summe</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {flow.lines.map((line) => (
                                            <tr key={line.name} className="border-t border-(--border)">
                                                <td className="px-4 py-2">{line.name}</td>
                                                <td className="px-2 py-2 text-right tabular-nums">{line.quantity}</td>
                                                <td className="px-2 py-2 text-right tabular-nums">{eur(line.unitCents)}</td>
                                                <td className="px-4 py-2 text-right font-medium tabular-nums">
                                                    {eur(line.quantity * line.unitCents * flow.durationMonths)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="border-t border-(--border) bg-(--page-bg)">
                                            <td colSpan={3} className="px-4 py-2 text-right text-(--fg-3)">Summe</td>
                                            <td className="px-4 py-2 text-right font-medium tabular-nums">{eur(total)}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </Accordion.Section>
                    ) : (
                        stage.facts && (
                            <Accordion.Section value="details" label="Details">
                                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 py-3 sm:grid-cols-3">
                                    {stage.facts.map(([term, value]) => (
                                        <div key={term}>
                                            <dt className="text-[11px] font-medium uppercase tracking-wide text-(--fg-3)">{term}</dt>
                                            <dd className="mt-0.5 text-[14px] tabular-nums">{value}</dd>
                                        </div>
                                    ))}
                                </dl>
                            </Accordion.Section>
                        )
                    )}

                    {stage.documents && stage.documents.length > 0 && (
                        <Accordion.Section
                            value="documents"
                            label="Dokumente"
                            aside={canGenerate ? (
                                <Button
                                    className="min-w-fit h-auto rounded-none border-l border-(--border) px-4"
                                    variant="secondary"
                                    size="xs"
                                >
                                    Dokument generieren
                                </Button>
                            ) : undefined}
                        >
                            {stage.documents.map((doc) => <DocumentRow key={doc.name} doc={doc} />)}
                        </Accordion.Section>
                    )}
                </Accordion>
            )}
        </section>
    );
}

/* ───────────────────────────────
   Seitenleiste
   ─────────────────────────────── */

function Summary({ flow, customerName }: { flow: Flow; customerName: string }) {
    const vat = Math.round(flow.netCents * 0.19);
    const rows: Array<[string, string]> = [
        ["Kunde", customerName],
        ["Ansprechpartner", flow.contactPerson],
        ["Laufzeit", `${flow.durationMonths} Monate`],
        ["Zahlungsziel", flow.paymentTerm],
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
                <div className="flex justify-between"><dt className="text-(--fg-3)">Netto</dt><dd>{eur(flow.netCents)}</dd></div>
                <div className="flex justify-between"><dt className="text-(--fg-3)">MwSt. 19 %</dt><dd>{eur(vat)}</dd></div>
                <div className="flex justify-between text-[15px] font-medium">
                    <dt>Brutto</dt><dd>{eur(flow.netCents + vat)}</dd>
                </div>
            </dl>
        </section>
    );
}

/* ───────────────────────────────
   Seite
   ─────────────────────────────── */

export default function FlowDetailView({ flow, customerId, customerName }: {
    flow: Flow;
    customerId: string;
    customerName: string;
}) {
    return (
        <div className="grid gap-5 mx-4 pb-10">
            <div className="flex h-14 items-center border-b border-(--border)">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: "Kunden", to: "/customers" },
                        { label: customerName, to: "/customers/$customerId", params: { customerId } },
                        { label: flow.title },
                    ]}
                />
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="flex flex-wrap items-center gap-2">
                        <h1 className="text-xl font-medium">{flow.title}</h1>
                        {flow.derivation && (
                            <span className="rounded bg-(--subtle-50) px-1.5 py-px text-xs text-(--fg-2)">
                                {DERIVATION_LABEL[flow.derivation.type]} von <span className="font-mono">{flow.derivation.from}</span>
                            </span>
                        )}
                    </div>
                    <p className="mt-1 text-sm text-(--fg-3)">
                        {flow.contactPerson} · {flow.positions} · {PHASE_LABELS[flow.phase]}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xl font-medium tabular-nums">{eur(flow.netCents)}</p>
                    <p className="text-xs text-(--fg-3)">netto</p>
                </div>
            </div>

            <Overview stages={flow.stages} />

            <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid gap-4">
                    {flow.stages.map((stage) => <StageSection key={stage.kind} stage={stage} flow={flow} />)}
                </div>

                <aside className="grid gap-4 lg:sticky lg:top-4">
                    <Summary flow={flow} customerName={customerName} />
                </aside>
            </div>
        </div>
    );
}
