import { Input, Select } from "@/components";
import { useCustomers, useSuppliers, useUsers } from "@/hooks";
import { getFormError } from "@/lib/utils";
import type { Language } from "@/types";
import { type ChangeEvent, type SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";
import type { OfferFormApi } from "../../-hooks/use-offer-form";

interface Props {
    form: OfferFormApi;
}

export default function FormOfferModal({ form }: Props) {
    const { t } = useTranslation();

    const { customers } = useCustomers();
    const { users } = useUsers();
    const { suppliers } = useSuppliers();

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    const handleCustomerChange = (event: ChangeEvent<HTMLSelectElement>) => {
        const id = event.target.value;
        const customer = customers.find(c => c.id === id);

        form.setFieldValue("contactPersonId", customer?.contactPersons[0]?.id || "");

        if (customer?.language) {
            form.setFieldValue("language", customer.language);
        }
    }

    return (
        <form id="offer-modal-form" onSubmit={handleSubmit}>
            <div className="grid gap-4">

                <div className="flex items-center gap-4">

                    {/* Kunde */}
                    <form.Field name="customerId" children={(field) => (
                        <Select label={t("offerModal.customer")} value={field.state.value} onChange={(e) => {
                            handleCustomerChange(e);
                            field.handleChange(e.target.value)
                        }} error={getFormError(field.state.meta.errors)}>
                            {customers.map(customer => (
                                <option id={customer.id} value={customer.id}>
                                    {customer.companyName}
                                </option>
                            ))}
                        </Select>
                    )} />

                    {/* Ihr Ansprechpartner */}
                    <form.Field name="contactPersonId" children={(field) => (
                        <form.Subscribe selector={(s) => s.values.customerId} children={(customerId) => {
                            const customer = customers.find((c) => c.id === customerId);
                            const contacts = customer?.contactPersons || [];

                            return (
                                <Select label={t("offerModal.contact")} value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    error={getFormError(field.state.meta.errors)}>
                                    {contacts.map(contact => (
                                        <option key={contact.id} value={contact.id}>
                                            {contact.firstName} {contact.lastName}
                                        </option>
                                    ))}

                                    {contacts.length === 0 && <option value="">-</option>}
                                </Select>
                            )
                        }} />
                    )} />

                    {/* Unser Ansprechpartner */}
                    <form.Field name="userId" children={(field) => (
                        <Select label={t("offerModal.employee")} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}
                            error={getFormError(field.state.meta.errors)}>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                </option>
                            ))}

                            {users.length === 0 && <option value="">-</option>}
                        </Select>
                    )} />

                </div>


                <div className="flex items-center gap-4">
                    {/* QuoteId */}
                    <form.Field name="quoteId" children={(field) => (
                        <Input label={t("offerModal.quoteId")} value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}
                            error={getFormError(field.state.meta.errors)} />
                    )} />

                    {/* Lieferant */}
                    <form.Field name="supplierId" children={(field) => (
                        <Select label={t("offerModal.supplierId")} value={String(field.state.value)}
                            error={getFormError(field.state.meta.errors)} onChange={(e) => field.handleChange(e.target.value)}>
                            {suppliers.map(supplier => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </Select>
                    )} />

                    {/* PaymentTerm */}
                    <form.Field name="paymentTerm" children={(field) => (
                        <Input label={t("offerModal.paymentTerm")} value={String(field.state.value)} onChange={(e) => field.handleChange(e.target.value)}
                            error={getFormError(field.state.meta.errors)} />
                    )} />
                </div>

                <div className="flex items-center gap-4">
                    <form.Field name="validUntil" children={(field) => (
                        <Input label={t("offerModal.validUntil")} type="date" value={field.state.value?.split("T")[0] ?? ""}
                            error={getFormError(field.state.meta.errors)}
                            onBlur={field.handleBlur} onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    field.handleChange(null);
                                    return;
                                }
                                field.handleChange(`${val}T00:00:00.000Z`);
                            }}
                        />
                    )} />

                    <form.Field name="requestFrom" children={(field) => (
                        <Input label={t("offerModal.requestFrom")} type="date" value={field.state.value?.split("T")[0] ?? ""}
                            error={getFormError(field.state.meta.errors)}
                            onBlur={field.handleBlur} onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    field.handleChange(null);
                                    return;
                                }
                                field.handleChange(`${val}T00:00:00.000Z`);
                            }}
                        />
                    )} />

                    <form.Field name="language" children={(field) => (
                        <Select label={t("offerModal.language")} value={field.state.value} onChange={(e) => field.handleChange(e.target.value as Language)}>
                            <option value="DE">Deutsch</option>
                            <option value="EN">Englisch</option>
                        </Select>
                    )} />
                </div>


            </div>
        </form>
    )
}