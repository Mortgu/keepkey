import { Pen, Plus } from "lucide-react";
import { useState } from "react";
import ContactListItem from "../../-components/contact-list-item";
import ContactPersonForm from "../../-components/contact-person-form";
import CustomerModal from "../../-components/customer-modal";
import type { Contact, CreateContactInput, Customer } from "@keepit/schemas";
import { formatDate } from "@/lib/format";
import { useCreateCustomerContact, useModal } from "@/hooks";
import { Button, Collapsable } from "@/components";

interface Props {
    customer: Customer;
}

export default function CustomerDetailHeader({ customer }: Props) {
    const editModal = useModal<Customer>();
    const { createCustomerContact } = useCreateCustomerContact();
    const [addContact, setAddContact] = useState(false);

    return (
        <div className="border border-(--border) rounded-md">
            <div className="flex items-start justify-between px-4 py-3">
                <div className="grid gap-1">
                    <h1 className="text-xl font-medium">{customer.companyName}</h1>
                    <p className="text-sm text-gray-500">
                        {customer.customerId || "—"} · Erstellt {formatDate(customer.createdAt)}
                    </p>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1 mt-2 text-sm font-light">
                        {customer.email && (
                            <div className="flex items-center gap-1">
                                <label className="text-(--text-secondary)">E-Mail:</label>
                                <span>{customer.email}</span>
                            </div>
                        )}
                        {customer.invoiceEmail && (
                            <div className="flex items-center gap-1">
                                <label className="text-(--text-secondary)">Rechnungs-E-Mail:</label>
                                <span>{customer.invoiceEmail}</span>
                            </div>
                        )}
                        {customer.phone && (
                            <div className="flex items-center gap-1">
                                <label className="text-(--text-secondary)">Telefon:</label>
                                <span>{customer.phone}</span>
                            </div>
                        )}
                    </div>
                    {(customer.street || customer.city || customer.zip) && (
                        <p className="text-sm text-(--text-secondary) mt-1">
                            {[customer.street, [customer.zip, customer.city].filter(Boolean).join(" ")].filter(Boolean).join(", ")}
                        </p>
                    )}
                    <p className="text-sm text-(--text-secondary) mt-1">
                        {customer.language} · {customer.currency} · {customer.taxRate}%
                    </p>
                </div>

                <Button variant="secondary" size="sm" icon={<Pen className="size-3.5" />} iconOnly
                    onClick={() => editModal.open(customer)} />
            </div>

            <Collapsable label="Ansprechpartner" className="w-full bg-(--subtle-50) justify-between rounded-none">
                <div className="grid">
                    <div className="flex justify-end mx-4 py-3">
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

                    {customer.contactPersons.length === 0 && !addContact && (
                        <p className="text-sm text-(--fg-3) mx-4 pb-3">Keine Ansprechpartner.</p>
                    )}

                    {customer.contactPersons.map((cp: Contact) => (
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
