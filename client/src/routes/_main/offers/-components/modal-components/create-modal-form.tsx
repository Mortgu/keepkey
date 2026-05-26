import { useForm } from "@tanstack/react-form";
import type { OfferProductInput } from "./offer-product-form";
import type { CreateOfferFlatRatesInput, CreateOfferInput, CreateOfferPositionInput } from "@/types";
import { useOfferHook } from "@/hooks";
import type { ZodObject, ZodRawShape } from "better-auth";
import { z } from 'zod';

type Props<T extends ZodRawShape> = {
    schema: ZodObject<T>;
    defaultValues: z.output<ZodObject<T>>,

    offerPositions: CreateOfferPositionInput[];
    offerFlatRates: CreateOfferFlatRatesInput[];
};

export default function useOfferCreateForm<T extends ZodRawShape>({ schema, defaultValues, offerPositions, offerFlatRates }: Props<T>) {
    //const { createOffer, isCreatingOffer, errorCreatingOffer } = useOfferHook();

    return useForm({
        defaultValues: defaultValues,
        validators: {
            onChange: schema as any,
            onMount: schema as any,
        },
        onSubmit: async ({ value }) => {
            console.log({
                offer: value,
                positions: offerPositions,
                flatRates: offerFlatRates,
            });
            /*await createOffer({
                offer: value as CreateOfferInput,
                positions: offerPositions,
                flatRates: offerFlatRates,
            });*/
        }
    })
}