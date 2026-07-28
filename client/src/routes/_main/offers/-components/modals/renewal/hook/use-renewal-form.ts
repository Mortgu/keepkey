import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { Offer } from "@keepit/schemas";

interface Props {
    offer: Offer;
    closeFn: () => void;
}

const inputDate = (value?: string) => value?.slice(0, 10) ?? "";

const addMonths = (date: string, months: number): string => {
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
};

const maxDuration = (durations: Array<number>): number =>
    durations.reduce((a, b) => Math.max(a, b), 0);

const renewalPositionSchema = z.object({
    productId: z.string(),
    contractId: z.string(),
    duration_months: z.number().int().positive(),
    quantity: z.number().int().positive(),
    free_months: z.number().int().min(0),
    optional: z.boolean(),
    total_cents: z.number().int(),
    eur_user_month: z.number().int(),
    discount_cents: z.number().int(),
});

const renewalFlatrateSchema = z.object({
    flatRateId: z.string(),
    quantity: z.number().int().positive(),
    total_cents: z.number().int(),
});

const renewalFormSchema = z.object({
    quoteId: z.string().min(1),
    startDate: z.string(),
    validUntil: z.string(),
    positions: z.array(renewalPositionSchema),
    flatrates: z.array(renewalFlatrateSchema),
});

export type RenewalFormValues = z.infer<typeof renewalFormSchema>;

export default function useRenewalForm({ offer, closeFn }: Props) {
    const defaultStart = new Date().toISOString().slice(0, 10);
    const maxPosDuration = maxDuration(offer.offerPositions.map((p) => p.duration_months));

    const form = useForm({
        defaultValues: {
            quoteId: "",
            startDate: defaultStart,
            validUntil: addMonths(defaultStart, maxPosDuration || 12),
            positions: offer.offerPositions.map((op) => ({
                productId: op.productId,
                contractId: op.contractId,
                duration_months: op.duration_months,
                free_months: op.free_months,
                quantity: op.quantity,
                optional: op.optional,
                total_cents: op.total_cents,
                eur_user_month: op.eur_user_month,
                discount_cents: op.discount_cents,
            })),
            flatrates: offer.offerFlatRates.map((fr) => ({
                flatRateId: fr.flatRateId,
                quantity: fr.quantity,
                total_cents: fr.total_cents,
            })),
        } satisfies RenewalFormValues,
        validators: {
            onMount: renewalFormSchema,
            onChange: renewalFormSchema,
        },
        onSubmit: () => {
            closeFn();
        },
    });

    return { form };
}

export type RenewalFormApi = ReturnType<typeof useRenewalForm>["form"];