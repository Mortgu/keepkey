import { useState } from "react";
import { Link } from "@tanstack/react-router";

import CustomerModal from "./customer-modal";

import type {
    Customer
} from "@keepit/schemas";
import { formatDate } from "@/lib/format";

import { useCreateCustomerContact, useDeleteCustomer, useModal } from "@/hooks";

interface CustomerListItemProps {
    customer: Customer;
}

export default function CustomerListItem({ customer }: CustomerListItemProps) {
    const editModal = useModal<Customer>();

    const { deleteCustomer, isDeletingCustomer } = useDeleteCustomer();
    const { createCustomerContact } = useCreateCustomerContact();

    const [addContact, setAddContact] = useState<boolean>(false);

    const contactPersons = customer.contactPersons;

    return (
        <div className="border border-(--border) rounded-md overflow-hidden">
            <Link to="/customers/$customerId" params={{ customerId: customer.id }} className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-(--page-bg)">
                <div className="grid gap-1">
                    <div className="hover:text-(--primary)">
                        <h1 className="text-md">{customer.companyName}</h1>
                    </div>
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
                        <p className="font-mono text-md">{customer.orders.length}</p>
                    </div>
                    <div className="grid gap-1 text-right pl-6">
                        <p className="text-xs text-gray-400">Bestellungen</p>
                        <p className="font-mono text-md">{customer.orders.length}</p>
                    </div>
                </div>
            </Link>

            {/*<Collapsable label="Ansprechpartner" className="w-full bg-(--subtle-50) justify-between rounded-none">
                <div className="grid">
                    <div className="flex justify-end  mx-4 py-3">
                        <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />}
                            onClick={() => setAddContact(true)} disabled={addContact}>
                            Kontaktperson hinzufügen
                        </Button>
                    </div>

                    {addContact && (
                        <ContactPersonForm
                            saveFn={(data: CreateContactInput) => {
                                createCustomerContact({
                                    id: customer.id,
                                    input: {
                                        salutation: data.salutation,
                                        firstName: data.firstName,
                                        lastName: data.lastName,
                                        email: data.email || "",
                                        customerId: customer.id,
                                    },
                                });
                                setAddContact(false);
                            }}
                            cancelFn={() => setAddContact(false)}
                            currentCustomerId={customer.id}
                        />
                    )}



                    {contactPersons.length === 0 && !addContact && (
                        <p className="text-sm text-(--fg-3)">Keine Ansprechpartner.</p>
                    )}

                    {contactPersons.map((cp) => (
                        <ContactListItem key={cp.id} cp={cp} currentCustomerId={customer.id} />
                    ))}
                </div>
            </Collapsable>*/}

            {editModal.isOpen && (
                <CustomerModal key={editModal.key} currentCustomer={editModal.data} onClose={editModal.close} />
            )}


            {/*<div className="flex items-center justify-between px-2 py-2 border-t border-(--border)">
                <div className="flex items-center gap-2">
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="xs"
                        icon={<Pen className="size-3.5" />}
                        iconOnly
                        onClick={() => editModal.open(customer)}
                    />

                    <Button
                        variant="secondary"
                        size="xs"
                        loading={isDeletingCustomer}
                        icon={<Trash className="size-3.5" />}
                        iconOnly
                        onClick={() => deleteCustomer({ customerId: customer.id })}
                        danger
                    />
                </div>
            </div>*/}
        </div>
    );
}
