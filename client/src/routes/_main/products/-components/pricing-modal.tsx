import { Button, Input, ModalDialog, Select } from "@/components";
import { MultiDropdown } from "@/components/filters/multi-dropdown";
import { useProductHook } from "@/hooks";
import type { Product } from "@/types";
import { useForm } from "@tanstack/react-form";
import { useMemo, useState, type SyntheticEvent } from "react";
import { z } from 'zod';

interface PricingModalProps {
    open: boolean;
    cancelFn: () => void,
}

const pricingFormSchema = z.object({
    products: z.array(z.string()).min(1, "Required!")
})

export default function PricingModal({ open, cancelFn }: PricingModalProps) {
    const { products } = useProductHook();


    const [productFilter, setProductFilter] = useState<string[]>([]);
    const productFilterOptions = useMemo(() =>
        products.map((c: Product) => ({
            value: c.id,
            label: c.name
        })),
        [products])

    const pricingForm = useForm({
        defaultValues: {
            products: productFilter
        },
        validators: {
            onChange: pricingFormSchema,
            onMount: pricingFormSchema,
        },
        onSubmit: ({ value }) => {
            console.log(value)
        }
    });

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        pricingForm.handleSubmit();
    }

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">
                    Preistabelle hinzufügen
                </h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="pricing-form" onSubmit={handleSubmit}>
                    <pricingForm.Field name="products" children={(field) => (
                        <MultiDropdown label="Produkte" options={productFilterOptions}
                            values={productFilter} onChange={(e) => {
                                setProductFilter(e);
                                field.handleChange(e);
                            }} />
                    )} />
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>

                <Button onClick={cancelFn} type="button" size="sm" variant="secondary">
                    Abbrechen
                </Button>

                <pricingForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button form="pricing-form" type="submit" size="sm" disabled={!canSubmit} loading={isSubmitting}>
                        Speichern
                    </Button>
                )} />

            </ModalDialog.Footer>
        </ModalDialog>
    )
}