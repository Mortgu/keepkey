import { Button, DataTable, type Column } from "@/components";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";
import type { Customer } from "@keepit/schemas";
import { useNavigate } from "@tanstack/react-router";
import { EllipsisVertical } from "lucide-react";
import { useState } from "react";

interface Props {
    customers: Array<Customer>;
}

interface TableFields {
    id: string;
    name: string;
    email: string;
    contacts: Array<string>;
    orders: string;
    createdAt: string;
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

export default function CustomerTable({ customers }: Props) {
    const navigate = useNavigate();

    const CUSTOMERS: Array<TableFields> = customers.map(customer => ({
        id: customer.id,
        name: customer.companyName,
        email: customer.email ?? "",
        contacts: customer.contactPersons.map(contact => `${contact.firstName} ${contact.lastName}`),
        orders: formatEur(customer.orders.reduce((sum, i) => sum + i.net_amount, 0)),
        createdAt: customer.createdAt,
    }));

    const [activeId, setActiveId] = useState<string | null>(null);
    const active = CUSTOMERS.find((c) => c.id === activeId) ?? null;

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
            )
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
            key: "orders",
            header: "Jahresumsatz",
            align: "right",
            sortable: true,
            sortValue: (c) => c.orders,
            render: (c) => c.orders
        },
        {
            key: "createdAt",
            header: "Erstellt Am",
            align: "left",
            sortable: true,
            sortValue: (c) => c.createdAt,
            render: (c) => formatDate(c.createdAt),
        },
        {
            key: "chevron",
            header: "",
            sortable: false,
            width: "36px",
            render: () => (
                <div className="flex justify-center">
                    <Button variant="ghost" icon={<EllipsisVertical className="size-4 text-(--border-200)" />} iconOnly size="xs" />
                </div>
            ),
        },
    ];

    return (
        <DataTable
            data={CUSTOMERS}
            columns={COLUMNS}
            rowKey={(c) => c.id}
            initialSort={{ key: "date", dir: "desc" }}
            onRowClick={() => {

            }}
        />

    )
}