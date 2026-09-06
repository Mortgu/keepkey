import { useTranslation } from "react-i18next";
import { useOfferModalContext } from "./offer-modal-context";
import { OFFER_MODAL_FORM_ID } from "./offer-modal-policy";
import type { HeaderField } from "./offer-modal-policy";
import type { SyntheticEvent } from "react";
import type { Language } from "@keepit/schemas";
import { getFormError } from "@/lib/utils";
import { useContracts, useCustomers, useLocale, useStandardDurations, useSuppliers, useUsers } from "@/hooks";
import { localized } from "@/lib/i18n-content";
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
    const locale = useLocale();
    const { form, policy } = useOfferModalContext();

    const { customers } = useCustomers();
    const { users } = useUsers();
    const { suppliers } = useSuppliers();
    const { contracts } = useContracts();
    const { durations } = useStandardDurations();

    const sortedDurations = [...durations].sort((a, b) => a.months - b.months);

    const shows = (field: HeaderField) => policy.header[field] !== "hidden";
    const locked = (field: HeaderField) => policy.header[field] === "readonly";

    const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    const handleCustomerChange = (id: string) => {
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
                            <Select
                                label={t("offerModal.customer")}
                                value={field.state.value}
                                disabled={locked("customerId")}
                                error={getFormError(field.state.meta.errors)}
                                options={customers.map(customer => ({
                                    value: customer.id,
                                    label: customer.companyName,
                                }))}
                                onValueChange={(customerId) => {
                                    handleCustomerChange(customerId);
                                    field.handleChange(customerId);
                                }}
                            />
                        )} />
                    )}

                    {/* Ihr Ansprechpartner */}
                    {shows("contactPersonId") && (
                        <form.Field name="contactPersonId" children={(field) => (
                            <form.Subscribe selector={(s) => s.values.customerId} children={(customerId) => {
                                const customer = customers.find((c) => c.id === customerId);
                                const contacts = customer?.contactPersons || [];

                                return (
                                    <Select
                                        label={t("offerModal.contact")}
                                        value={field.state.value}
                                        disabled={locked("contactPersonId")}
                                        error={getFormError(field.state.meta.errors)}
                                        options={contacts.length > 0
                                            ? contacts.map(contact => ({
                                                value: contact.id,
                                                label: `${contact.firstName} ${contact.lastName}`,
                                            }))
                                            : [{ value: "", label: "-" }]}
                                        onValueChange={field.handleChange}
                                    />
                                )
                            }} />
                        )} />
                    )}

                    {/* Unser Ansprechpartner */}
                    {shows("userId") && (
                        <form.Field name="userId" children={(field) => (
                            <Select
                                label={t("offerModal.employee")}
                                value={field.state.value}
                                disabled={locked("userId")}
                                error={getFormError(field.state.meta.errors)}
                                options={users.length > 0
                                    ? users.map(user => ({
                                        value: user.id,
                                        label: `${user.firstName} ${user.lastName}`,
                                    }))
                                    : [{ value: "", label: "-" }]}
                                onValueChange={field.handleChange}
                            />
                        )} />
                    )}

                </div>


                {/* Vertrag und Laufzeit gelten für alle Positionen gemeinsam.
                    Beide sind hier wählbar, *bevor* eine Position existiert —
                    das ist erst möglich, seit die Laufzeiten global gepflegt
                    werden und nicht mehr am Tarif des Produkts hängen. */}
                <div className="flex items-center gap-4">
                    {shows("contractId") && (
                        <form.Field name="contractId" children={(field) => (
                            <Select
                                label={t("offerModal.contract")}
                                value={field.state.value}
                                disabled={locked("contractId")}
                                error={getFormError(field.state.meta.errors)}
                                options={contracts.length > 0
                                    ? contracts.map(contract => ({
                                        value: contract.id,
                                        label: localized(contract.translations, locale, "name"),
                                    }))
                                    : [{ value: "", label: "-" }]}
                                onValueChange={field.handleChange}
                            />
                        )} />
                    )}

                    {/* Gesperrt als Klartext: die Laufzeit einer Erweiterung
                        muss nicht in den heutigen Standardlaufzeiten stehen. */}
                    {shows("duration_months") && (
                        <form.Field name="duration_months" children={(field) => (
                            locked("duration_months") ? (
                                <Input
                                    label={t("offerModal.duration")}
                                    value={`${field.state.value} ${t("common.months")}`}
                                    disabled
                                    readOnly
                                />
                            ) : (
                                <Select<number>
                                    label={t("offerModal.duration")}
                                    value={field.state.value}
                                    error={getFormError(field.state.meta.errors)}
                                    options={sortedDurations.length > 0
                                        ? sortedDurations.map(duration => ({
                                            value: duration.months,
                                            label: `${duration.months} ${t("common.months")}`,
                                        }))
                                        : [{ value: 0, label: "Keine Standardlaufzeit definiert!" }]}
                                    onValueChange={field.handleChange}
                                />
                            )
                        )} />
                    )}
                </div>

                <div className="flex items-center gap-4">
                    {/* QuoteId */}
                    {shows("quoteId") && (
                        <form.Field name="quoteId" children={(field) => (
                            <Input label={t("offerModal.quoteId")} value={field.state.value} disabled={locked("quoteId")}
                                prefix="AG"
                                onChange={(e) => field.handleChange(e.target.value)}
                                error={getFormError(field.state.meta.errors)} />
                        )} />
                    )}

                    {/* Lieferant */}
                    {shows("supplierId") && (
                        <form.Field name="supplierId" children={(field) => (
                            <Select
                                label={t("offerModal.supplierId")}
                                value={field.state.value}
                                disabled={locked("supplierId")}
                                error={getFormError(field.state.meta.errors)}
                                options={suppliers.map(supplier => ({
                                    value: supplier.id,
                                    label: supplier.name,
                                }))}
                                onValueChange={field.handleChange}
                            />
                        )} />
                    )}

                    {/* PaymentTerm */}
                    {shows("paymentTerm") && (
                        <form.Field name="paymentTerm" children={(field) => (
                            <Input label={t("offerModal.paymentTerm")} value={String(field.state.value)}
                                selectOnFocus
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
                            <Select
                                label={t("offerModal.language")}
                                value={field.state.value}
                                disabled={locked("language")}
                                options={[
                                    { value: "DE", label: "Deutsch" },
                                    { value: "EN", label: "Englisch" },
                                ]}
                                onValueChange={(language) => field.handleChange(language as Language)}
                            />
                        )} />
                    )}
                </div>


            </div>
        </form>
    )
}
