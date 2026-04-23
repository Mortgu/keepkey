import Button from "@/components/button/button";
import ModalDialog from "@/components/modal";
import { useForm } from "@tanstack/react-form";
import { Loader } from "lucide-react";
import { z } from "zod";

interface OrderModalProps {
    open: boolean;
    cancelFn: () => void;
    submitFn: () => void;
    currentOrder?: any | null;
}

const orderSchema = z.object({
    voucherId: z.string(),
    date: z.date(),
    paymentTerm: z.string(),
    validUntil: z.date(),
    customerId: z.string(),
    supplierId: z.string(),
    requestFrom: z.string(),
});

const emptyOrder = {
    id: "",
    createdAt: new Date(),
    orderPositions: [],
    paymentTerm: "30 Days"
};

export default function OrderModal({ open, cancelFn, submitFn, currentOrder }: OrderModalProps) {
    const orderForm = useForm({
        defaultValues: currentOrder || emptyOrder,
        validators: {
            onChange: orderSchema,
        },
        onSubmit: ({ value }) => {
            submitFn();
        }
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        orderForm.handleSubmit();
    }

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">Neue Bestellung erstellen</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="order-form" onSubmit={handleSubmit} className="grid gap-4">


                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={cancelFn} type='button' size='sm' variant='secondary'>Cancel</Button>
                <orderForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button form='order-form' disabled={!canSubmit} type='submit' size='sm'>
                        {isSubmitting ? <Loader className="size-4" /> : 'Save'}
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    )
}