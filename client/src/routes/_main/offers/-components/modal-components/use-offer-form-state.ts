import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

import { useAuth } from "@/context/auth";
import { findOfferFilesByIdAction } from "@/data/nextcloud";
import { getPrice } from "@/data/products";
import { useOfferManager } from "@/hooks/offers/offer-mutations";
import type {
    CreateOfferInput, GetOfferFlatrate, Offer,
    OfferFlatRate,
    OfferPosition, User
} from "@/types";
import type { z } from "zod";
import { offerSchema } from "../offer-utils";
import type { OfferProductInput } from "./offer-product-form";


type OfferFormValues = z.infer<typeof offerSchema>;

type OfferFormDefaultSources = {
    customers: Array<{ id: string; contactPersons: Array<{ id: string }> }>;
    suppliers: Array<{ id: string }>;
    user: User | null | undefined;
    locale: "DE" | "EN";
};

const getFormDefaults = (
    currentOffer: Offer | undefined,
    sources: OfferFormDefaultSources,
): OfferFormValues => {
    if (currentOffer !== undefined) {
        return {
            customerId: currentOffer.customerId,
            contactPersonId: currentOffer.contactPersonId,
            userId: currentOffer.userId,
            quoteId: currentOffer.quoteId,
            language: currentOffer.language,
            supplierId: currentOffer.supplierId ?? null,
            paymentTerm: currentOffer.paymentTerm,
            validUntil: currentOffer.validUntil ?? null,
            requestFrom: currentOffer.requestFrom ?? null,
        };
    }

    return {
        customerId: sources.customers[0]?.id ?? "",
        contactPersonId: sources.customers[0]?.contactPersons[0]?.id ?? "",
        userId: sources.user?.id ?? "",
        quoteId: "",
        language: sources.locale,
        supplierId: sources.suppliers[0]?.id ?? null,
        paymentTerm: "30 Tage",
        validUntil: null,
        requestFrom: null,
    };
};

const toOfferProductInput = (pos: OfferPosition): OfferProductInput => ({
    productId: pos.productId,
    contractId: pos.contractId,
    duration_months: pos.duration_months,
    quantity: pos.quantity,
    optional: pos.optional ?? false,
    total_cents: typeof pos.total_cents === "number" ? pos.total_cents : 0,
});

const toOfferFlatRateInput = (fr: OfferFlatRate): GetOfferFlatrate => ({
    flatRateId: fr.flatRateId,
    flatRate: fr.flatRate,
    offerId: fr.offerId,
    quantity: fr.quantity,
    total_cents: typeof fr.total_cents === "number" ? fr.total_cents : 0,
});

interface UseOfferFormStateProps {
    currentOffer?: Offer;
    onClose: () => void;
    customers: OfferFormDefaultSources["customers"];
    suppliers: OfferFormDefaultSources["suppliers"];
    locale: OfferFormDefaultSources["locale"];
}

export function useOfferFormState(props: UseOfferFormStateProps) {
    const { currentOffer, onClose, customers, suppliers, locale } = props;

    const isEdit = currentOffer !== undefined;
    const { user } = useAuth();

    const {
        createOffer,
        isCreatingOffer,
        errorCreatingOffer,

        updateOffer,
        isUpdatingOffer,
        errorUpdatingOffer,
    } = useOfferManager();

    const [offerProducts, setOfferProducts] = useState<Array<OfferProductInput>>(
        currentOffer?.offerPositions.map(toOfferProductInput) ?? [],
    );
    const [offerFlatRates, setOfferFlatRates] = useState<Array<GetOfferFlatrate>>(
        currentOffer?.offerFlatRates.map(toOfferFlatRateInput) ?? [],
    );

    const [quoteIdWarning, setQuoteIdWarning] = useState<string | undefined>(undefined);
    const [checkingQuoteId, setCheckingQuoteId] = useState(false);
    const [submitError, setSubmitError] = useState<Error | undefined>(undefined);

    const { mutateAsync: fetchPrice } = useMutation({
        mutationKey: ["price"],
        mutationFn: (args: {
            productId: string;
            contractId: string;
            quantity: number;
            duration: number;
        }) => getPrice(args.productId, args.contractId, args.duration, args.quantity),
    });

    const resolvePrice = async (data: OfferProductInput): Promise<OfferProductInput> => {
        const total_cents = await fetchPrice({
            productId: data.productId,
            contractId: data.contractId,
            quantity: data.quantity,
            duration: data.duration_months,
        });

        return { ...data, total_cents: typeof total_cents === "number" ? total_cents : 0 };
    };

    const addProduct = async (data: OfferProductInput) => {
        const priced = await resolvePrice(data);

        console.log(priced)
        setOfferProducts((prev) => [...prev, priced]);
    };

    const updateProduct = async (index: number, data: OfferProductInput) => {
        const priced = await resolvePrice(data);
        setOfferProducts((prev) => prev.map((p, i) => (i === index ? priced : p)));
    };

    const updateProductPrice = (index: number, price: number) => {
        setOfferProducts((prev) =>
            prev.map((p, i) => (i === index ? { ...p, total_cents: price } : p)),
        );
    };

    const removeProduct = (index: number) => {
        setOfferProducts((prev) => prev.filter((_, i) => i !== index));
    };

    const addFlatRate = (data: GetOfferFlatrate) => {
        setOfferFlatRates((prev) => [...prev, data]);
    };

    const removeFlatRate = (index: number) => {
        setOfferFlatRates((prev) => prev.filter((_, i) => i !== index));
    };

    const clearQuoteIdWarning = () => setQuoteIdWarning(undefined);

    const checkQuoteId = async (id: string) => {
        if (!id) {
            setQuoteIdWarning(undefined);
            return;
        }
        setCheckingQuoteId(true);
        try {
            const result = await findOfferFilesByIdAction(id);
            setQuoteIdWarning(result.found ? "Datei existiert bereits" : undefined);
        } catch {
            setQuoteIdWarning(undefined);
        } finally {
            setCheckingQuoteId(false);
        }
    };

    const form = useForm({
        defaultValues: getFormDefaults(currentOffer, { customers, suppliers, user, locale }),
        validators: {
            onChange: offerSchema,
            onMount: offerSchema,
        },
        onSubmit: async ({ value }) => {
            setSubmitError(undefined);
            try {
                if (currentOffer) {
                    await updateOffer({
                        offerId: currentOffer.id,
                        offer: value as CreateOfferInput,
                        positions: offerProducts.map(op => ({
                            productId: op.productId,
                            contractId: op.contractId,
                            duration_months: op.duration_months,
                            quantity: op.quantity,
                            optional: op.optional,
                        })),
                        flatrates: offerFlatRates.map(fr => ({
                            quantity: fr.quantity,
                            flatRateId: fr.flatRateId,
                        }))
                    })

                } else {

                    await createOffer({
                        offer: value as CreateOfferInput,
                        positions: offerProducts.map(op => ({
                            productId: op.productId,
                            contractId: op.contractId,
                            duration_months: op.duration_months,
                            quantity: op.quantity,
                            optional: op.optional,
                        })),
                        flatrates: offerFlatRates.map(fr => ({
                            quantity: fr.quantity,
                            flatRateId: fr.flatRateId,
                        }))
                    });
                }
                onClose();
            } catch (exception) {
                setSubmitError(exception as Error);
            }
        },
    });

    const submit = async () => {
        await form.handleSubmit();
    };

    const error = submitError ?? errorCreatingOffer ?? errorUpdatingOffer ?? undefined;

    return {
        isEdit,
        form,
        submit,
        error,
        offerProducts,
        addProduct,
        updateProduct,
        removeProduct,
        updateProductPrice,
        offerFlatRates,
        addFlatRate,
        removeFlatRate,
        quoteIdWarning,
        checkingQuoteId,
        checkQuoteId,
        clearQuoteIdWarning,

        fetchPrice
    };
}
