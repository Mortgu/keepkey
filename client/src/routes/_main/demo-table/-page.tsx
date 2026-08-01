import { useState } from "react";
import { ChevronRight } from "lucide-react";
import type { Column } from "@/components/table";
import { Badge, DataTable, PageWidth } from "@/components";
import { Drawer } from "@/components/drawer";
import { formatDate } from "@/lib/format";

interface Contact {
    name: string;
    role: string;
}

interface Customer {
    id: string;
    name: string;
    contacts: Array<Contact>;
    status: "aktiv" | "neu" | "inaktiv";
    orders: number;
    umsatz: number;
    date: string;
}

const CUSTOMERS: Array<Customer> = [
    { id: "C-1001", name: "Musterfirma GmbH", contacts: [{ name: "Sarah Kessler", role: "Einkauf" }, { name: "Sarah Kessler", role: "Einkauf" }], status: "aktiv", orders: 1, umsatz: 12450, date: "2026-07-15" },
    { id: "C-1002", name: "Beispiel AG", contacts: [], status: "aktiv", orders: 0, umsatz: 0, date: "2026-07-15" },
    { id: "C-1003", name: "dwad", contacts: [], status: "neu", orders: 0, umsatz: 0, date: "2026-07-29" },
    { id: "C-1004", name: "Bahlsen GmbH", contacts: [{ name: "Michael Otto", role: "Ansprechpartner" }], status: "aktiv", orders: 8, umsatz: 64200, date: "2026-06-02" },
    { id: "C-1005", name: "Ferrero Deutschland", contacts: [{ name: "Julia Nowak", role: "Einkaufsleitung" }, { name: "Tom Reiter", role: "Buchhaltung" }], status: "aktiv", orders: 14, umsatz: 112800, date: "2026-04-21" },
    { id: "C-1006", name: "Katjes International", contacts: [{ name: "Anna Berg", role: "Ansprechpartner" }], status: "inaktiv", orders: 3, umsatz: 9750, date: "2025-11-08" },
];

const fmtEur = (n: number) => `${n.toLocaleString("de-DE", { minimumFractionDigits: 0 })} €`;
const initials = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

function StatusBadge({ status }: { status: Customer["status"] }) {
    if (status === "aktiv") return <Badge variant="generated" size="xs">Aktiv</Badge>;
    if (status === "neu") return <Badge variant="pending" size="xs">Neu</Badge>;
    return <Badge variant="draft" size="xs">Inaktiv</Badge>;
}

function Avatar({ name, size = 30 }: { name: string; size?: number }) {
    return (
        <span
            className="rounded-full bg-[#E6F2EC] text-(--primary) flex items-center justify-center font-semibold shrink-0"
            style={{ width: size, height: size, fontSize: size === 30 ? 12 : 10.5 }}
        >
            {initials(name)}
        </span>
    );
}

const COLUMNS: Array<Column<Customer>> = [
    {
        key: "name",
        header: "Kunde",
        sortable: true,
        sortValue: (c) => c.name.toLowerCase(),
        render: (c) => (
            <div className="flex items-center gap-2.5">
                <Avatar name={c.name} />
                <div className="flex flex-col gap-px">
                    <span className="font-semibold">{c.name}</span>
                    <span className="font-mono text-[11.5px] text-(--text-secondary)">{c.id}</span>
                </div>
            </div>
        ),
    },
    {
        key: "ansprechpartner",
        header: "Ansprechpartner",
        sortable: true,
        sortValue: (c) => c.contacts[0]?.name ?? "",
        render: (c) =>
            c.contacts.length ? (
                <span>
                    {c.contacts[0].name}
                    {c.contacts.length > 1 && (
                        <span className="text-(--text-secondary)"> +{c.contacts.length - 1}</span>
                    )}
                </span>
            ) : (
                <span className="text-(--border-200)">—</span>
            ),
    },
    {
        key: "status",
        header: "Status",
        sortable: false,
        render: (c) => <StatusBadge status={c.status} />,
    },
    {
        key: "orders",
        header: "Bestellungen",
        align: "right",
        sortable: true,
        sortValue: (c) => c.orders,
        render: (c) => c.orders,
    },
    {
        key: "umsatz",
        header: "Umsatz",
        align: "right",
        sortable: true,
        sortValue: (c) => c.umsatz,
        render: (c) => (c.umsatz ? fmtEur(c.umsatz) : <span className="text-(--border-200)">—</span>),
    },
    {
        key: "date",
        header: "Erstellt",
        sortable: true,
        sortValue: (c) => new Date(c.date),
        render: (c) => formatDate(c.date),
    },
    {
        key: "chevron",
        header: "",
        sortable: false,
        width: "36px",
        render: () => (
            <div className="flex justify-center">
                <ChevronRight className="size-4 text-(--border-200)" />
            </div>
        ),
    },
];

export default function DataTableDemo() {
    const [activeId, setActiveId] = useState<string | null>(null);
    const active = CUSTOMERS.find((c) => c.id === activeId) ?? null;

    return (
        <PageWidth>
            <div className="grid gap-5">
                <div>
                    <h1 className="text-xl font-semibold tracking-[-0.01em] mb-1">Kunden</h1>
                    <p className="text-[13px] text-(--text-secondary)">
                        Spaltenüberschriften anklicken zum Sortieren (auf- / absteigend) · Zeile anklicken für Details.
                    </p>
                </div>

                <DataTable
                    data={CUSTOMERS}
                    columns={COLUMNS}
                    rowKey={(c) => c.id}
                    onRowClick={(c) => setActiveId(c.id)}
                    activeRowKey={activeId}
                    initialSort={{ key: "date", dir: "desc" }}
                />
            </div>

            <Drawer open={active !== null} onClose={() => setActiveId(null)}>
                {active && (
                    <>
                        <Drawer.Header
                            eyebrow="Kunde"
                            title={active.name}
                            subtitle={
                                active.contacts.length
                                    ? `${active.contacts.length} Ansprechpartner`
                                    : "Keine Ansprechpartner hinterlegt"
                            }
                        />
                        <Drawer.Body>
                            <div className="flex flex-col gap-[18px]">
                                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 items-baseline">
                                    <dt className="text-xs text-(--text-secondary)">Kunden-Nr.</dt>
                                    <dd className="text-[13px] font-medium text-right font-mono">{active.id}</dd>
                                    <dt className="text-xs text-(--text-secondary)">Status</dt>
                                    <dd className="text-right"><StatusBadge status={active.status} /></dd>
                                    <dt className="text-xs text-(--text-secondary)">Bestellungen</dt>
                                    <dd className="text-[13px] font-medium text-right">{active.orders}</dd>
                                    <dt className="text-xs text-(--text-secondary)">Umsatz</dt>
                                    <dd className="text-[13px] font-medium text-right">
                                        {active.umsatz ? fmtEur(active.umsatz) : "—"}
                                    </dd>
                                    <dt className="text-xs text-(--text-secondary)">Erstellt</dt>
                                    <dd className="text-[13px] font-medium text-right">{formatDate(active.date)}</dd>
                                </dl>

                                <div className="h-px bg-(--border)" />

                                <div>
                                    <div className="text-[10px] font-semibold text-(--text-secondary) uppercase tracking-[0.06em] mb-2.5">
                                        Ansprechpartner
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        {active.contacts.length ? (
                                            active.contacts.map((p) => (
                                                <div key={p.name} className="flex items-center gap-2.5">
                                                    <Avatar name={p.name} size={26} />
                                                    <div>
                                                        <div className="text-[13.5px] font-medium">{p.name}</div>
                                                        <div className="text-xs text-(--text-secondary)">{p.role}</div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <span className="text-[13px] text-(--text-secondary)">
                                                Keine Ansprechpartner hinterlegt.
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </Drawer.Body>
                        <Drawer.Footer>
                            <button
                                type="button"
                                onClick={() => setActiveId(null)}
                                className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-[13px] font-medium text-(--primary) hover:bg-[#E6F2EC] transition-colors"
                            >
                                Schließen
                            </button>
                            <span className="ml-auto" />
                            <button
                                type="button"
                                className="inline-flex items-center gap-1.5 rounded-md bg-(--primary) text-white text-[13px] font-medium px-4 py-2 hover:bg-[#005432] transition-colors"
                            >
                                Kunde öffnen
                            </button>
                        </Drawer.Footer>
                    </>
                )}
            </Drawer>
        </PageWidth>
    );
}
