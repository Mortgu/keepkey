import { Link } from "@tanstack/react-router";
import { Pen, Trash, User } from "lucide-react";
import type { Customer } from "@keepit/schemas";
import { useState, type SyntheticEvent } from "react";
import { formatDate } from "@/lib/format";
import { useDeleteCustomer } from "@/hooks";
import { Button } from "@/components";
import ContactPersonModal from "./contact-person-modal";

interface Props {
    customer: Customer;
    onEdit: (customer: Customer) => void;
    onCreateOffer: () => void;
    onCreateOrder: () => void;
}

export default function CustomerListItem({ customer, onEdit, onCreateOffer, onCreateOrder }: Props) {
    const { deleteCustomer, isDeletingCustomer } = useDeleteCustomer();

    const [open, setOpen] = useState(false);

    const handleDeleteCustomer = (event: SyntheticEvent<HTMLButtonElement>) => {
        event.preventDefault();

        if (confirm(`Möchten Sie den Kunden ${customer.companyName} wirklich löschen?`)) {
            deleteCustomer({ customerId: customer.id });
        }

        return;
    }

    return (
        <div className="border border-(--border) rounded-md overflow-hidden">
            <Link to="/customers/$customerId" params={{ customerId: customer.id }} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-(--page-bg)">
                <div className="grid gap-1">
                    <h1 className="text-md">{customer.companyName}</h1>
                    <p className="text-xs text-gray-500">
                        {formatDate(customer.createdAt || "")}
                    </p>
                </div>

                <div className="flex items-center">
                    <div className="grid gap-1 text-right border-r border-(--border) pr-6">
                        <p className="text-xs text-gray-400">Ansprechpartner</p>
                        <p className="text-md">
                            {customer.contactPersons.length ? (
                                <span>
                                    {customer.contactPersons[0]?.firstName ?? ""} {customer.contactPersons[0]?.lastName ?? ""}
                                    {customer.contactPersons.length > 1 && (
                                        <span className="font-mono text-(--text-secondary)"> +{customer.contactPersons.length - 1}</span>
                                    )}
                                </span>
                            ) : (
                                <span>-</span>
                            )}

                        </p>
                    </div>
                    <div className="grid gap-1 text-right border-r border-(--border) px-6">
                        <p className="text-xs text-gray-400">Angebote</p>
                        <p className="font-mono text-md">{customer._count.offers}</p>
                    </div>
                    <div className="grid gap-1 text-right pl-6">
                        <p className="text-xs text-gray-400">Bestellungen</p>
                        <p className="font-mono text-md">{customer._count.orders}</p>
                    </div>
                </div>
            </Link>


            <div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">
                <div className="flex items-center gap-2">
                    <Button size="xs" variant="border" onClick={onCreateOffer}>Angebot erstellen</Button>
                    <Button size="xs" variant="border" onClick={onCreateOrder}>Bestellung erstellen</Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="border"
                        size="xs"
                        icon={<Pen size={14} />}
                        iconOnly
                        onClick={() => onEdit(customer)}
                    />

                    <Button
                        variant="border"
                        size="xs"
                        icon={<User size={14} />}
                        iconOnly
                        onClick={() => setOpen(true)}
                    />

                    <Button
                        variant="border"
                        size="xs"
                        loading={isDeletingCustomer}
                        icon={<Trash size={14} />}
                        iconOnly
                        onClick={handleDeleteCustomer}
                    />
                </div>
            </div>

            {open && (
                <ContactPersonModal
                    onClose={() => setOpen(false)}
                    currentCustomerId={customer.id}
                />
            )}
        </div>
    );
}
