import { useTranslation } from "react-i18next";
import { useOfferModalContext } from "./offer-modal-context";
import { OFFER_MODAL_FORM_ID } from "./offer-modal-policy";
import type { HeaderField } from "./offer-modal-policy";
import type { ChangeEvent, SyntheticEvent } from "react";
import type { Language } from "@keepit/schemas";
import { getFormError } from "@/lib/utils";
import { useCustomers, useSuppliers, useUsers } from "@/hooks";
import { Input, Select } from "@/components";

/** Der Datumsteil eines ISO-Zeitstempels, wie ihn `<input type="date">` erwartet. */
const asDateInput = (value: string | null) => value?.split("T")[0] ?? "";

/** Ein Tagesdatum als ISO-Zeitstempel — leer bedeutet „nicht gesetzt". */
const fromDateInput = (value: string) => (value ? `${value}T00:00:00.000Z` : null);

/**
 * Der Angebotskopf. Welche Felder editierbar sind, entscheidet die Policy des
 * Angebotstyps: In abgeleiteten Angeboten stammt der Kopf aus dem Quellangebot
 * und bleibt nur zur Ansicht stehen.
 */
export default function HeaderForm() {
    const { t } = useTranslation();
    const { form, policy } = useOfferModalContext();

    const { customers } = useCustomers();
    const { users } = useUsers();
    const { suppliers } = useSuppliers();

    const shows = (field: HeaderField) => policy.header[field] !== "hidden";
    const locked = (field: HeaderField) => policy.header[field] === "readonly";

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
        <form id={OFFER_MODAL_FORM_ID} onSubmit={handleSubmit}>
            <div className="grid gap-4">

                <div className="flex items-center gap-4">

                    {/* Kunde */}
                    {shows("customerId") && (
                        <form.Field name="customerId" children={(field) => (
                            <Select label={t("offerModal.customer")} value={field.state.value} disabled={locked("customerId")}
                                onChange={(e) => {
                                    handleCustomerChange(e);
                                    field.handleChange(e.target.value)
                                }} error={getFormError(field.state.meta.errors)}>
                                {customers.map(customer => (
                                    <option key={customer.id} id={customer.id} value={customer.id}>
                                        {customer.companyName}
                                    </option>
                                ))}
                            </Select>
                        )} />
                    )}

                    {/* Ihr Ansprechpartner */}
                    {shows("contactPersonId") && (
                        <form.Field name="contactPersonId" children={(field) => (
                            <form.Subscribe selector={(s) => s.values.customerId} children={(customerId) => {
                                const customer = customers.find((c) => c.id === customerId);
                                const contacts = customer?.contactPersons || [];

                                return (
                                    <Select label={t("offerModal.contact")} value={field.state.value}
                                        disabled={locked("contactPersonId")}
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
                    )}

                    {/* Unser Ansprechpartner */}
                    {shows("userId") && (
                        <form.Field name="userId" children={(field) => (
                            <Select label={t("offerModal.employee")} value={field.state.value} disabled={locked("userId")}
                                onChange={(e) => field.handleChange(e.target.value)}
                                error={getFormError(field.state.meta.errors)}>
                                {users.map(user => (
                                    <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName}
                                    </option>
                                ))}

                                {users.length === 0 && <option value="">-</option>}
                            </Select>
                        )} />
                    )}

                </div>


                <div className="flex items-center gap-4">
                    {/* QuoteId */}
                    {shows("quoteId") && (
                        <form.Field name="quoteId" children={(field) => (
                            <Input label={t("offerModal.quoteId")} value={field.state.value} disabled={locked("quoteId")}
                                onChange={(e) => field.handleChange(e.target.value)}
                                error={getFormError(field.state.meta.errors)} />
                        )} />
                    )}

                    {/* Lieferant */}
                    {shows("supplierId") && (
                        <form.Field name="supplierId" children={(field) => (
                            <Select label={t("offerModal.supplierId")} value={String(field.state.value)}
                                disabled={locked("supplierId")}
                                error={getFormError(field.state.meta.errors)} onChange={(e) => field.handleChange(e.target.value)}>
                                {suppliers.map(supplier => (
                                    <option key={supplier.id} value={supplier.id}>
                                        {supplier.name}
                                    </option>
                                ))}
                            </Select>
                        )} />
                    )}

                    {/* PaymentTerm */}
                    {shows("paymentTerm") && (
                        <form.Field name="paymentTerm" children={(field) => (
                            <Input label={t("offerModal.paymentTerm")} value={String(field.state.value)}
                                disabled={locked("paymentTerm")}
                                onChange={(e) => field.handleChange(e.target.value)}
                                error={getFormError(field.state.meta.errors)} />
                        )} />
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {shows("validUntil") && (
                        <form.Field name="validUntil" children={(field) => (
                            <Input label={t("offerModal.validUntil")} type="date" value={asDateInput(field.state.value)}
                                disabled={locked("validUntil")}
                                error={getFormError(field.state.meta.errors)}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(fromDateInput(e.target.value))}
                            />
                        )} />
                    )}

                    {shows("requestFrom") && (
                        <form.Field name="requestFrom" children={(field) => (
                            <Input label={t("offerModal.requestFrom")} type="date" value={asDateInput(field.state.value)}
                                disabled={locked("requestFrom")}
                                error={getFormError(field.state.meta.errors)}
                                onBlur={field.handleBlur}
                                onChange={(e) => field.handleChange(fromDateInput(e.target.value))}
                            />
                        )} />
                    )}

                    {shows("language") && (
                        <form.Field name="language" children={(field) => (
                            <Select label={t("offerModal.language")} value={field.state.value} disabled={locked("language")}
                                onChange={(e) => field.handleChange(e.target.value as Language)}>
                                <option value="DE">Deutsch</option>
                                <option value="EN">Englisch</option>
                            </Select>
                        )} />
                    )}
                </div>


            </div>
        </form>
    )
}
