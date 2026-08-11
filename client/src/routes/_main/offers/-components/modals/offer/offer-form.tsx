import { useTranslation } from "react-i18next";
import type { ChangeEvent, SyntheticEvent } from "react";
import type { OfferFormApi } from "../../../-hooks/use-offer-form";

import type { Language } from "@keepit/schemas";
import { getFormError } from "@/lib/utils";
import { useCustomers, useSuppliers, useUsers } from "@/hooks";
import { Input, Select } from "@/components";
import { useQuoteIdCheck } from "../../../-hooks/use-quote-check";

interface Props {
    form: OfferFormApi;
    /** Belegnummer ist festgeschrieben, weil bereits ein Dokument dazu existiert. */
    quoteIdLocked?: boolean;
    /** Der Vorschlag wird gerade geholt. */
    isLoadingQuoteId?: boolean;
    /** false = NextCloud war beim Vorschlagen nicht erreichbar. */
    quoteIdCloudChecked?: boolean;
}

export type OfferFormTypes = "create" | "edit" | "renewal";

export default function FormOfferModal({ form, quoteIdLocked, isLoadingQuoteId, quoteIdCloudChecked = true }: Props) {
    const { t } = useTranslation();

    const { customers } = useCustomers();
    const { users } = useUsers();
    const { suppliers } = useSuppliers();

    const { quoteIdConflict, quoteIdCloudChecked: checkedOnBlur, checkingQuoteId, checkQuoteId, clearQuoteIdWarning } = useQuoteIdCheck();

    // Die Formatprüfung macht schon das zod-Schema — hier nur melden, was dort niemand sehen kann.
    const quoteIdWarning =
        quoteIdConflict === "db" ? t("offerModal.quoteIdTaken")
            : quoteIdConflict === "cloud" ? t("offerModal.quoteIdCloudConflict")
                : (!quoteIdCloudChecked || !checkedOnBlur) ? t("offerModal.quoteIdCloudUnavailable")
                    : undefined;

    const quoteIdWarningTooltip =
        quoteIdConflict === "db" ? t("offerModal.quoteIdTakenHint")
            : quoteIdConflict === "cloud" ? t("offerModal.quoteIdCloudConflictHint")
                : quoteIdWarning ? t("offerModal.quoteIdCloudUnavailableHint")
                    : undefined;

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
                                <option key={customer.id} id={customer.id} value={customer.id}>
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
                        <Input label={t("offerModal.quoteId")} value={field.state.value}
                            disabled={quoteIdLocked}
                            loading={isLoadingQuoteId || checkingQuoteId}
                            onChange={(e) => {
                                clearQuoteIdWarning();
                                field.handleChange(e.target.value);
                            }}
                            onBlur={() => {
                                field.handleBlur();
                                if (!quoteIdLocked) void checkQuoteId(field.state.value);
                            }}
                            error={getFormError(field.state.meta.errors)}
                            warning={quoteIdLocked ? t("offerModal.quoteIdLocked") : quoteIdWarning}
                            warningTooltip={quoteIdLocked ? t("offerModal.quoteIdLockedHint") : quoteIdWarningTooltip} />
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