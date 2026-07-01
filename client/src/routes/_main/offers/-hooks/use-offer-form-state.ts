import { useForm, useStore } from "@tanstack/react-form";
import { offerFormSchema } from "../-schemas/offer-form-schema";
import type { CreateOfferInput, Customer, Language, Offer, Supplier, User } from "@/types";
import { useState } from "react";
import { useLocale } from "@/hooks";
import { useOfferProducts } from "./use-offer-product";
import { useOfferManager } from "@/hooks/offers/offer-mutations";
import { useQuoteIdCheck } from "./use-quote-check";

interface Props {
    closeFn: () => void;

    currentOffer: Offer | undefined;

    customers: Array<Customer>;
    suppliers: Array<Supplier>;
    users: Array<User>;
}

type OfferFormDefaultSources = {
    customers: Array<{
        id: string;
        language: Language;
        contactPersons: Array<{
            id: string;
        }>;
    }>;
    suppliers: Array<{
        id: string;
    }>;
    users: Array<User>;
    locale: "DE" | "EN";
}

function getFormDefaults(currentOffer: Offer | undefined, sources: OfferFormDefaultSources) {
    const { customers, suppliers, users, locale } = sources;

    return {
        customerId: currentOffer?.customerId ?? customers[0]?.id ?? "",
        contactPersonId: currentOffer?.contactPersonId ?? customers[0]?.contactPersons[0]?.id ?? "",
        userId: currentOffer?.userId ?? users[0]?.id ?? "",
        quoteId: currentOffer?.quoteId ?? "",
        paymentTerm: currentOffer?.paymentTerm ?? "30 Tage",
        validUntil: currentOffer?.validUntil ?? null,
        requestFrom: currentOffer?.requestFrom ?? null,
        featureComparison: currentOffer?.featureComparison ?? false,

        // Bewusst weiterhin modusabhängig, siehe Erklärung oben:
        language: currentOffer ? customers[0]?.language ?? locale : locale,
        supplierId: currentOffer ? currentOffer.supplierId ?? null : suppliers[0]?.id ?? null,
    }
}

export default function useOfferFormState(props: Props) {
    const { closeFn, currentOffer, customers, suppliers, users } = props;

    const [isEdit, setEdit] = useState<boolean>(currentOffer !== undefined);
    const [submitException, setSubmitException] = useState<Error | undefined>(undefined);

    const locale = useLocale();

    const { createOffer, errorCreatingOffer, updateOffer, errorUpdatingOffer } = useOfferManager();

    const form = useForm({
        defaultValues: getFormDefaults(currentOffer, {
            customers, suppliers, users, locale,
        }),
        validators: {
            onChange: offerFormSchema,
            onMount: offerFormSchema,
        },
        onSubmit: async ({ value }) => {
            setSubmitException(undefined);

            try {
                const payload = {
                    offer: value as CreateOfferInput,
                    positions: products.offerProducts.map(op => ({
                        productId: op.productId,
                        contractId: op.contractId,
                        duration_months: op.duration_months,
                        quantity: op.quantity,
                        optional: op.optional,
                    })),
                    flatrates: products.offerFlatRates.map(fr => ({
                        quantity: fr.quantity,
                        flatRateId: fr.flatRateId,
                    })),
                };

                if (currentOffer) {
                    await updateOffer({ offerId: currentOffer.id, ...payload });
                } else {
                    await createOffer(payload);
                }

                closeFn();
            } catch (exception: any) {
                setSubmitException(exception as Error);
            }
        }
    });

    const customerId = useStore(form.store, (s) => s.values.customerId);
    const featureComparison = useStore(form.store, (s) => s.values.featureComparison);
    const toggleFeatureComparison = (value: boolean) => form.setFieldValue("featureComparison", value);

    const products = useOfferProducts(currentOffer, customerId);
    const quoteId = useQuoteIdCheck();

    const submit = async () => {
        await form.handleSubmit();
    };

    const error = submitException ?? errorCreatingOffer ?? errorUpdatingOffer ?? undefined;

    return {
        isEdit,
        form,
        submit,
        error,
        customerId,
        featureComparison,
        toggleFeatureComparison,
        ...products,
        ...quoteId,
    };
}