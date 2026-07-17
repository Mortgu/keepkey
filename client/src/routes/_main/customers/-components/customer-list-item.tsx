import { Pen, Plus, Trash } from "lucide-react";
import { useState } from "react";

import ContactListItem from "./contact-list-item";
import ContactPersonForm from "./contact-person-form";
import CustomerModal from "./customer-modal";

import type { CreateCustomerContactInput, Customer } from "@/types";
import { formatDate } from "@/lib/format";

import { useCreateCustomerContact, useDeleteCustomer, useModal } from "@/hooks";
import { Button, Collapsable } from "@/components";

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
        <div className="border border-(--border) rounded-md ">
            <div className="flex items-center justify-between px-4 py-3">
                <div className="grid gap-0">
                    <h1 className="text-md">{customer.companyName}</h1>
                    <p className="text-sm text-gray-500">
                        {customer.customerId} · {formatDate(customer.createdAt || "")}
                    </p>
                </div>

                <div className="flex items-center gap-12">
                    <p className="text-sm text-gray-500">
                        {customer.orders.length} Bestellungen
                    </p>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" icon={<Pen className="size-3.5" />}
                            iconOnly onClick={() => editModal.open(customer)} />

                        <Button variant="secondary" size="sm" loading={isDeletingCustomer}
                            icon={<Trash className="size-3.5" />} iconOnly
                            onClick={() => deleteCustomer({ customerId: customer.id })} />
                    </div>
                </div>
            </div>

            <Collapsable label="Ansprechpartner" className="w-full bg-(--subtle-50) justify-between rounded-none">
                <div className="grid">
                    <div className="flex justify-end  mx-4 py-3">
                        <Button size="sm" variant="secondary" icon={<Plus className="size-3.5" />}
                            onClick={() => setAddContact(true)} disabled={addContact}>
                            Kontaktperson hinzufügen
                        </Button>
                    </div>

                    {addContact && (
                        <ContactPersonForm
                            saveFn={(data: CreateCustomerContactInput) => {
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
            </Collapsable>

            {editModal.isOpen && (
                <CustomerModal key={editModal.key} currentCustomer={editModal.data} onClose={editModal.close} />
            )}
        </div>
    );
}
