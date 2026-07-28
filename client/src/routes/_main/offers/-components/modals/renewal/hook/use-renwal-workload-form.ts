import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import type { OfferPosition } from "@keepit/schemas";

interface Props {
    workload: OfferPosition;
    closeFn: () => void;
}

const workloadItemFromSchema = z.object({
    quantity: z.number().int().positive(),
    free_months: z.number().int(),
});

export default function useRenewalWorkloadForm({ closeFn, workload }: Props) {
    const form = useForm({
        defaultValues: {
            quantity: workload.quantity,
            free_months: workload.free_months,
        },
        validators: {
            onMount: workloadItemFromSchema,
            onChange: workloadItemFromSchema,
        },
        onSubmit: async ({ value }) => {
            console.log(value);
            closeFn();
        }
    });

    return { form };
}

export type RenewalWorkloadFormApi = ReturnType<typeof useRenewalWorkloadForm>["form"];