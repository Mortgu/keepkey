import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { Customer } from "@keepit/schemas";
import type { Column } from "@/components";
import { ActionMenu, Button, DataTable, Drawer } from "@/components";
import { useDeleteCustomer } from "@/hooks";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";

interface Props {
    customers: Array<Customer>;
    onEdit: (customer: Customer) => void;
}

interface TableFields {
    id: string;
    name: string;
    email: string;
    contacts: Array<string>;
    revenue: number;
    createdAt: string;
    customer: Customer;
}

const initials = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

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

export default function CustomerTable({ customers, onEdit }: Props) {
    const navigate = useNavigate();
    const { deleteCustomer, isDeletingCustomer } = useDeleteCustomer();

    const [activeId, setActiveId] = useState<string | null>(null);

    const rows: Array<TableFields> = customers.map((customer) => ({
        id: customer.id,
        name: customer.companyName,
        email: customer.email ?? "",
        contacts: customer.contactPersons.map((contact) => `${contact.firstName} ${contact.lastName}`),
        revenue: customer.orders.reduce((sum, i) => sum + i.net_amount, 0),
        createdAt: customer.createdAt,
        customer,
    }));

    const active = rows.find((c) => c.id === activeId) ?? null;

    const openDetail = (id: string) =>
        navigate({ to: "/customers/$customerId", params: { customerId: id } });

    const COLUMNS: Array<Column<TableFields>> = [
        {
            key: "name",
            header: "Kunde",
            sortable: true,
            sortValue: (c) => c.name.toLowerCase(),
            render: (c) => (
                <div className="flex items-center gap-2.5">
                    <Avatar name={c.name} />
                    <div className="flex flex-col gap-px">
                        <span className="font-normal">{c.name}</span>
                        <span className="text-xs text-gray-400">{c.email}</span>
                    </div>
                </div>
            ),
        },
        {
            key: "ansprechpartner",
            header: "Ansprechpartner",
            sortable: true,
            sortValue: (c) => c.contacts[0] ?? "",
            render: (c) =>
                c.contacts.length ? (
                    <span>
                        {c.contacts[0]}
                        {c.contacts.length > 1 && (
                            <span className="text-(--text-secondary)"> +{c.contacts.length - 1}</span>
                        )}
                    </span>
                ) : (
                    <span className="text-(--border)">—</span>
                ),
        },
        {
            key: "revenue",
            header: "Jahresumsatz",
            align: "right",
            sortable: true,
            sortValue: (c) => c.revenue,
            render: (c) => formatEur(c.revenue),
        },
        {
            key: "createdAt",
            header: "Erstellt Am",
            align: "left",
            sortable: true,
            sortValue: (c) => new Date(c.createdAt),
            render: (c) => formatDate(c.createdAt),
        },
        {
            key: "actions",
            header: "",
            sortable: false,
            width: "36px",
            render: (c) => (
                <ActionMenu
                    label={`Aktionen für ${c.name}`}
                    items={[
                        {
                            label: "Kunde öffnen",
                            icon: <ExternalLink className="size-3.5" />,
                            onSelect: () => openDetail(c.id),
                        },
                        {
                            label: "Bearbeiten",
                            icon: <Pencil className="size-3.5" />,
                            onSelect: () => onEdit(c.customer),
                        },
                        {
                            label: "Löschen",
                            icon: <Trash2 className="size-3.5" />,
                            danger: true,
                            disabled: isDeletingCustomer,
                            onSelect: () => deleteCustomer({ customerId: c.id }),
                        },
                    ]}
                />
            ),
        },
    ];

    console.log(active);

    return (
        <>
            <DataTable
                data={rows}
                columns={COLUMNS}
                rowKey={(c) => c.id}
                initialSort={{ key: "createdAt", dir: "desc" }}
                activeRowKey={activeId}
                onRowClick={(c) => setActiveId(c.id)}
                emptyLabel="Keine Kunden gefunden."
            />

            <Drawer open={active !== null} onClose={() => setActiveId(null)} wide>
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
                                    {active.customer.customerId && (
                                        <>
                                            <dt className="text-xs text-(--text-secondary)">Kunden-Nr.</dt>
                                            <dd className="text-[13px] font-medium text-right font-mono">
                                                {active.customer.customerId}
                                            </dd>
                                        </>
                                    )}
                                    <dt className="text-xs text-(--text-secondary)">E-Mail</dt>
                                    <dd className="text-[13px] font-medium text-right">{active.email || "—"}</dd>
                                    <dt className="text-xs text-(--text-secondary)">Telefon</dt>
                                    <dd className="text-[13px] font-medium text-right">
                                        {active.customer.phone || "—"}
                                    </dd>
                                    <dt className="text-xs text-(--text-secondary)">Adresse</dt>
                                    <dd className="text-[13px] font-medium text-right">
                                        {[active.customer.street, [active.customer.zip, active.customer.city].filter(Boolean).join(" ")]
                                            .filter(Boolean)
                                            .join(", ") || "—"}
                                    </dd>
                                    <dt className="text-xs text-(--text-secondary)">Land</dt>
                                    <dd className="text-[13px] font-medium text-right">{active.customer.country}</dd>
                                    <dt className="text-xs text-(--text-secondary)">Sprache</dt>
                                    <dd className="text-[13px] font-medium text-right">{active.customer.language}</dd>
                                    <dt className="text-xs text-(--text-secondary)">Bestellungen</dt>
                                    <dd className="text-[13px] font-medium text-right">
                                        {active.customer.orders.length}
                                    </dd>
                                    <dt className="text-xs text-(--text-secondary)">Jahresumsatz</dt>
                                    <dd className="text-[13px] font-medium text-right">{formatEur(active.revenue)}</dd>
                                    <dt className="text-xs text-(--text-secondary)">Erstellt</dt>
                                    <dd className="text-[13px] font-medium text-right">
                                        {formatDate(active.createdAt)}
                                    </dd>
                                </dl>

                                <div className="h-px bg-(--border)" />

                                <div>
                                    <div className="text-[10px] font-semibold text-(--text-secondary) uppercase tracking-[0.06em] mb-2.5">
                                        Ansprechpartner
                                    </div>
                                    <div className="flex flex-col gap-2.5">
                                        {active.customer.contactPersons.length ? (
                                            active.customer.contactPersons.map((p) => (
                                                <div key={p.id} className="flex items-center gap-2.5">
                                                    <Avatar name={`${p.firstName} ${p.lastName}`} size={26} />
                                                    <div>
                                                        <div className="text-[13.5px] font-normal">
                                                            {p.firstName} {p.lastName}
                                                        </div>
                                                        <div className="text-xs text-(--text-secondary)">
                                                            {p.email || "—"}
                                                        </div>
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
                            <Button variant="ghost" size="sm" onClick={() => setActiveId(null)}>
                                Schließen
                            </Button>
                            <span className="ml-auto" />
                            <Button
                                variant="border"
                                size="sm"
                                icon={<Pencil className="size-3.5" />}
                                onClick={() => {
                                    onEdit(active.customer);
                                    setActiveId(null);
                                }}
                            >
                                Bearbeiten
                            </Button>
                            <Button variant="primary" size="sm" onClick={() => openDetail(active.id)}>
                                Kunde öffnen
                            </Button>
                        </Drawer.Footer>
                    </>
                )}
            </Drawer>
        </>
    );
}
