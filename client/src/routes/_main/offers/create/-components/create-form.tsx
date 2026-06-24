import type { ContactPerson, Customer, Offer, Supplier, User } from "@/types";
import { useOfferFormState } from "../../-components/modal-components/use-offer-form-state";
import { useCustomers, useLocale, useSupplierHook, useUserHook } from "@/hooks";
import type { SyntheticEvent } from "react";
import { Input, Select } from "@/components";
import { useTranslation } from "react-i18next";
import { getFormError } from "@/lib/utils";
import FlatRateModalSection from "../../-components/modal-components/flat-rate-section";
import ProductModalSection from "../../-components/modal-components/product-section";

type Props = {
    currentOffer?: Offer;
}

export default function CreateOfferForm({ currentOffer }: Props) {
    const { customers } = useCustomers();
    const { suppliers } = useSupplierHook();
    const { users } = useUserHook();
    const locale = useLocale();

    const { t } = useTranslation();

    const state = useOfferFormState({
        currentOffer: currentOffer,
        onClose: () => { },
        customers,
        suppliers,
        locale,
    });

    const { form } = state;

    const handleFormSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    }

    return (
        <form id="offer-form" onSubmit={handleFormSubmit} className="grid gap-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <form.Field name="customerId" children={(field) => (
                    <div className="flex-1 min-w-60">
                        <Select label="Kunde" error={getFormError(field.state.meta.errors)} value={field.state.value}
                            onChange={(e) => {
                                const newCustomerId = e.target.value;
                                field.handleChange(newCustomerId);
                                const newCustomer = customers.find(
                                    (c: Customer) => c.id === newCustomerId,
                                );
                                form.setFieldValue(
                                    "contactPersonId",
                                    newCustomer?.contactPersons[0]?.id ?? "",
                                );
                            }}
                        >
                            {customers.map((customer: Customer) => (
                                <option key={customer.id} value={customer.id}>
                                    {customer.companyName}
                                </option>
                            ))}
                            {customers.length <= 0 && <option value="">None</option>}
                        </Select>
                    </div>
                )} />

                <form.Field name="contactPersonId" children={(field) => (
                    <div className="flex-1 min-w-60">
                        <form.Subscribe
                            selector={(s) => s.values.customerId}
                            children={(customerId) => {
                                const selectedCustomer = customers.find(
                                    (c: Customer) => c.id === customerId,
                                );
                                const contactPersons =
                                    selectedCustomer?.contactPersons ?? [];

                                return (
                                    <Select
                                        label="Ansprechpartner Kunde"
                                        value={field.state.value}
                                        error={getFormError(field.state.meta.errors)}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        disabled={!customerId}
                                    >
                                        {contactPersons.map((cp: ContactPerson) => (
                                            <option key={cp.id} value={cp.id}>
                                                {cp.firstName} {cp.lastName}
                                            </option>
                                        ))}
                                        {contactPersons.length <= 0 && (
                                            <option value="">None</option>
                                        )}
                                    </Select>
                                );
                            }}
                        />
                    </div>
                )} />

                <form.Field name="userId" children={(field) => (
                    <div className="flex-1">
                        <Select label="Unser Ansprechpartner" value={field.state.value} error={getFormError(field.state.meta.errors)}
                            onChange={(e) => field.handleChange(e.target.value)}>
                            {users.map((user: User) => (
                                <option key={user.id} value={user.id}>
                                    {user.firstName} {user.lastName}
                                </option>
                            ))}
                            {users.length <= 0 && <option value="">None</option>}
                        </Select>
                    </div>
                )} />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
                <form.Field name="quoteId" children={(field) => (
                    <div className="flex-1 grid gap-2 items-center">
                        <Input label="AG-Nr." value={field.state.value} warning={state.quoteIdWarning ?? getFormError(field.state.meta.errors)}
                            warningTooltip={state.checkingQuoteId ? "Prüfe..." : undefined}
                            onChange={(e) => {
                                field.handleChange(e.target.value);
                                state.clearQuoteIdWarning();
                            }}
                            onBlur={() => state.checkQuoteId(field.state.value)}
                        />
                    </div>
                )} />


                <form.Field name="supplierId" children={(field) => (
                    <div className="flex-1 grid gap-2 items-center">
                        <Select
                            label="Lieferant"
                            value={(field.state.value as string | null) ?? ""}
                            error={getFormError(field.state.meta.errors)}
                            onChange={(e) => field.handleChange(e.target.value || null)}
                        >
                            <option value="">None</option>
                            {suppliers.map((supplier: Supplier) => (
                                <option key={supplier.id} value={supplier.id}>
                                    {supplier.name}
                                </option>
                            ))}
                        </Select>
                    </div>
                )} />

                <form.Field name="paymentTerm" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <Input
                            label="Zahlungsbedingung"
                            size="sm"
                            placeholder="Zahlungsbedingung..."
                            error={getFormError(field.state.meta.errors)}
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    </div>
                )} />
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
                <form.Field name="validUntil" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <Input
                            label="Angebot gültig bis"
                            type="date"
                            size="sm"
                            placeholder="Gültig bis..."
                            error={getFormError(field.state.meta.errors)}
                            value={field.state.value?.split("T")[0] ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    field.handleChange(null);
                                    return;
                                }
                                field.handleChange(`${val}T00:00:00.000Z`);
                            }}
                        />
                    </div>
                )} />

                <form.Field name="requestFrom" children={(field) => (
                    <div className="flex-1 grid gap-2">
                        <Input
                            label="Ihre Anfrage vom"
                            type="date"
                            size="sm"
                            placeholder="Ihre Anfrage vom..."
                            error={getFormError(field.state.meta.errors)}
                            value={field.state.value?.split("T")[0] ?? ""}
                            onBlur={field.handleBlur}
                            onChange={(e) => {
                                const val = e.target.value;
                                if (!val) {
                                    field.handleChange(null);
                                    return;
                                }
                                field.handleChange(`${val}T00:00:00.000Z`);
                            }}
                        />
                    </div>
                )} />
            </div>

            <div className="flex gap-4">
                <div className="flex-1">
                    <ProductModalSection
                        offerProducts={state.offerProducts}
                        onAdd={state.addProduct}
                        onUpdate={state.updateProduct}
                        onRemove={state.removeProduct}
                        onPriceChange={state.updateProductPrice}
                    />
                </div>

                <div className="flex-1">
                    <FlatRateModalSection
                        offerFlatRates={state.offerFlatRates}
                        onAdd={state.addFlatRate}
                        onRemove={state.removeFlatRate}
                    />
                </div>
            </div>
        </form>
    )
}