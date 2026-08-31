import { useCreateOrder, useUpdateOrder } from "@/hooks";
import { createOrderSchema, type Order } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";

interface Props {
    currentOrder?: Order;
    currentOfferId: string;
    /** Läuft, sobald die Bestellung angelegt ist. */
    onDone: () => void;
}

export default function useOrderForm({ currentOrder, currentOfferId, onDone }: Props) {
    const { createOrder } = useCreateOrder();
    const { updateOrder } = useUpdateOrder();

    const form = useForm({
        defaultValues: currentOrder ?? { id: currentOfferId, orderId: '' },
        validators: {
            onMount: createOrderSchema,
            onChange: createOrderSchema,
        },
        onSubmit: async ({ value }) => {
            if (currentOrder) {

            } else {
                createOrder(value);
            }

            console.log(value)

            onDone();
        }
    });

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    return { form, handleSubmit };
}

export type OrderFormApi = ReturnType<typeof useOrderForm>['form'];