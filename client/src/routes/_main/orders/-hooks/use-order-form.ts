import { useCreateOrder, useUpdateOrder } from "@/hooks";
import { createOrderSchema, type Order } from "@keepit/schemas";
import { useForm } from "@tanstack/react-form";

interface Props {
    currentOrder?: Order;
    currentOfferId: string;
    setOpen: (value: boolean) => void;
}

export default function useOrderForm({ currentOrder, currentOfferId, setOpen }: Props) {
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

            setOpen(false);
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