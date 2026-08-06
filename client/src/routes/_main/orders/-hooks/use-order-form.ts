import { useCreateOrder, useUpdateOrder } from "@/hooks";
import { createOrderSchema, type Order } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";

interface Props {
    currentOrder?: Order;
    closeFn: () => void;
}

export default function useOrderForm({ currentOrder, closeFn }: Props) {
    const { createOrder } = useCreateOrder();
    const { updateOrder } = useUpdateOrder();

    const form = useForm({
        defaultValues: currentOrder ?? { id: '', orderId: '' },
        validators: {
            onMount: createOrderSchema,
            onChange: createOrderSchema,
        },
        onSubmit: async ({ value }) => {
            if (currentOrder) {
                /* await updateOrder({
                     orderId: currentOrder.id,
                     input: value,
                 })*/
            } else {
                createOrder({ ...value });
            }

            closeFn();
        }
    });

    return { form };
}

export type OrderFormApi = ReturnType<typeof useOrderForm>['form'];