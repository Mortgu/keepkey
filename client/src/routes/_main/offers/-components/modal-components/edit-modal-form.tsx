import { useForm } from "@tanstack/react-form";
import type { z } from 'zod';
import type { CreateOfferFlatRatesInput, CreateOfferPositionInput } from "@/types";
import type { ZodObject, ZodRawShape } from "better-auth";

type Props<T extends ZodRawShape> = {
    schema: ZodObject<T>;
    defaultValues: z.output<ZodObject<T>>,

    offerPositions: Array<CreateOfferPositionInput>;
    offerFlatRates: Array<CreateOfferFlatRatesInput>;
};

export default function useOfferEditForm<T extends ZodRawShape>({ schema, defaultValues, offerPositions, offerFlatRates }: Props<T>) {
    // const { createOffer, isCreatingOffer, errorCreatingOffer } = useOfferHook();

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
            /* await createOffer({
                offer: value as CreateOfferInput,
                positions: offerPositions,
                flatRates: offerFlatRates,
            });*/
        }
    })
}