import React, { useEffect, useState } from "react";
import { Pen, Settings, Trash, Users } from "lucide-react";
import { toast } from 'react-toastify';
import { useForm } from "@tanstack/react-form";
import CustomerModal from "./customer-modal";
import ContactPersonModal from "./contact-person-modal";
import type { SyntheticEvent } from "react";

import type { Customer } from "@/types";
import { formatDate } from "@/lib/format";

import { useDeleteCustomer, useModal } from "@/hooks";
import { Button, Drawer, Textarea } from "@/components";
import { api } from "@/lib/api-client.ts";

interface CustomerListItemProps {
    customer: Customer;
}

export default function CustomerListItem({ customer }: CustomerListItemProps) {
    const editModal = useModal<Customer>();
    const contactModal = useModal();

    const { deleteCustomer, isDeletingCustomer, errorDeletingCustomer } = useDeleteCustomer();

    const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

    useEffect(() => {
        toast.error(errorDeletingCustomer?.message)
    }, [errorDeletingCustomer]);

    const customerSettingsForm = useForm({
        defaultValues: {
            salutation: customer.salutation ?? "",
        },
        validators: {},
        onSubmit: async ({ value }) => {
            await api<void>(`/api/customers/${customer.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(value),
            })
        }
    });

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        await customerSettingsForm.handleSubmit();
    }

    return (
        <React.Fragment>
            <div className="flex items-center justify-between px-4 py-3 border border-(--border) rounded-md">
                <div className="grid gap-0">
                    <h1 className="text-md">{customer.companyName}</h1>
                    <p className="text-sm text-gray-500">
                        {customer.customerId} · {formatDate(customer.createdAt || "")}
                    </p>
                </div>

                <div className="flex items-center gap-12">
                    <p className="text-sm text-gray-500">
                        {customer.orders?.length ?? 0} Bestellungen
                    </p>

                    <div className="flex items-center gap-2">
                        <Button variant="secondary" size="sm" icon={<Pen className="size-3.5" />}
                            iconOnly onClick={() => editModal.open(customer)} />

                        <Button variant="secondary" size="sm" icon={<Users className="size-3.5" />}
                            iconOnly onClick={() => contactModal.open()} />

                        <Button variant="secondary" size="sm" icon={<Settings className="size-3.5" />}
                            iconOnly onClick={() => setDrawerOpen(true)} />

                        <Button variant="secondary" size="sm" loading={isDeletingCustomer}
                            icon={<Trash className="size-3.5" />} iconOnly
                            onClick={() => deleteCustomer({ customerId: customer.id })} />
                    </div>
                </div>
            </div>

            {editModal.isOpen && (
                <CustomerModal key={editModal.key} currentCustomer={editModal.data} onClose={editModal.close} />
            )}

            {contactModal.isOpen && (
                <ContactPersonModal key={contactModal.key} onClose={contactModal.close}
                    currentCustomerId={customer.id}
                    currentContactPersons={customer.contactPersons ?? []} />
            )}


            <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} wide>
                <Drawer.Header eyebrow="" title="Kunden Einstellungen" subtitle="" />
                <Drawer.Body>
                    <form id="customer-settings-form" onSubmit={handleSubmit}>
                        <div>

                            <customerSettingsForm.Field name="salutation" children={(field) => (
                                <Textarea id={field.name} size="sm" rows={5} label="Salutation"
                                    placeholder="Personalisierte Anrede"
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)} />

                            )} />
                        </div>

                    </form>

                </Drawer.Body>
                <Drawer.Footer>
                    <customerSettingsForm.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button form="customer-settings-form" type="submit" size="sm" disabled={!canSubmit}
                                loading={isSubmitting}>
                                Speichern
                            </Button>
                        )} />
                </Drawer.Footer>
            </Drawer>
        </React.Fragment>
    );
}
