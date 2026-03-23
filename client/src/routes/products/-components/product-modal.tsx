import Button from "@/components/button/button";
import Modal from "@/components/modal";
import { useContracts } from "@/hooks/contract";
import type { ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item";
import { useForm } from "@tanstack/react-form";
import { Loader } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import { z } from "zod";
import {useShoppingCart} from "@/hooks/shopping-cart.ts";
import {authClient} from "@/lib/auth-client.ts";

type ProductModalProps = {
    product: ProductItemProps,
    onSubmit?: () => void,
    setOpen: Dispatch<SetStateAction<boolean>>,
}

export default function ProductModal({ product, onSubmit, setOpen }: ProductModalProps) {
    const { contracts, isPending } = useContracts();
    const { addToShoppingCart } = useShoppingCart();
    const { data: session } = authClient.useSession();

    const form = useForm({
        defaultValues: {
            contractId: contracts[0]?.id || "",
            quantity: 1,
            duration: 1,
        },
        validators: {
            onChange: z.object({
                contractId: z.string().min(1),
                quantity: z.int(),
                duration: z.int(),
            }),
        },
        onSubmit: async ({ value }) => {
            const item = {
                ...value,
                productId: product.id,
                userId: session?.user?.id,
            }
            //console.log(product, value);
            console.log(item);

            setOpen(false);
            return await addToShoppingCart(item);
        },
    })

    return (
        <Modal>

            {/* Display selected product */}
            <div className="flex items-center justify-between p-2 border border-gray-300 rounded-md overflow-hidden">
                <p>{product.name}</p>
            </div>


            <form onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                form.handleSubmit();
            }} className="grid gap-4">
                {/* Display contract selection */}
                <form.Field name='contractId' children={(field) => (
                    <select defaultValue={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)} className="w-full px-3 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 text-sm bg-gray-50">
                        {contracts.map((contract: any) => (
                            <option key={contract.id} value={contract.id}>{contract.name}</option>
                        ))}
                    </select>
                )} />

                {/* Quantity and duration */}


                <div className="flex gap-2">
                    <form.Field name="quantity" children={(field) => (
                        <input id={field.name} name={field.name} value={field.state.value} className="flex-1 px-3 py-3 rounded-md border border-gray-200 text-sm bg-gray-50"
                            placeholder="quantity" onChange={(e) => field.handleChange(parseInt(e.target.value))} />
                    )} />
                    <form.Field name="duration" children={(field) => (
                        <select defaultValue={field.state.value}
                            onChange={(e) => field.handleChange(parseInt(e.target.value))} className="w-full px-3 py-3 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 text-sm bg-gray-50">
                            <option value={1}>1 Jahr</option>
                            <option value={2}>2 Jahre</option>
                            <option value={3}>3 Jahre</option>
                        </select>
                    )} />


                </div>

                {/* Submit / Cancel */}
                <div className="flex gap-2">
                    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button disabled={!canSubmit} className="flex-1">
                                {isSubmitting && <Loader className="size-4 animate-spin" />}
                                {!isSubmitting && "Hinzufügen"}
                            </Button>
                        )} />

                    <Button onClick={() => setOpen(false)} className="flex-1" variant="secondary">Abbrechen</Button>
                </div>
            </form>

        </Modal>
    )
}