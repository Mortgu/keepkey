import { Loader, Plus } from "lucide-react";
import Button from "@/components/button/button.tsx";
import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { z } from "zod";
import ProductItem, { type ProductItemProps } from "@/routes/user/_pathlessLayout/admin/-components/product-item.tsx";
import { useProducts } from "@/hooks/product.ts";
import Modal from "@/components/modal.tsx";

export default function ProductList() {
    const { products, isPending, error, createProduct } = useProducts();

    const [isAddingProduct, addProduct] = useState<boolean>(false);

    const productForm = useForm({
        defaultValues: {
            productName: "",
            description: "",
            link: "",
        },
        validators: {
            onChange: z.object({
                productName: z.string().min(1),
                description: z.string(),
                link: z.string(),
            }),
        },
        onSubmit: async ({ value }) => {
            await createProduct(value.productName);
        }
    })

    if (isPending) {
        return (
            <Loader className='animate-spin' />
        )
    }

    if (error) {
        return (
            <div className='p-2 bg-red-200 border border-red-400 rounded-lg'>
                <p className="text-lg">Error</p>
                <p>{error.message}</p>
            </div>
        )
    }

    return (
        <div>
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Products ({products.length})</h1>
                <Button onClick={() => addProduct(true)} size='sm'>Create <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>
                {products.map((product: ProductItemProps) => (
                    <ProductItem key={product.id} {...product} />
                ))}
            </div>

            {isAddingProduct && (
                <Modal>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        productForm.handleSubmit(productForm);
                    }} className="rounded-md flex flex-col gap-4 p-2 cursor-pointer">
                        <productForm.Field name='productName' children={(field) => (
                            <input id={field.name} name={field.name} className='flex-1 outline-none border border-gray-300 p-1 rounded-md'
                                value={field.state.value} placeholder="Produkt Name" onChange={(e) => field.handleChange(e.target.value)} />
                        )} />
                        <productForm.Field name='description' children={(field) => (
                            <textarea id={field.name} name={field.name} className='flex-1 outline-none border border-gray-300 p-1 rounded-md'
                                value={field.state.value} placeholder="Produkt Beschreibung" onChange={(e) => field.handleChange(e.target.value)} />
                        )} />
                        <productForm.Field name='link' children={(field) => (
                            <input id={field.name} name={field.name} className='flex-1 outline-none border border-gray-300 p-1 rounded-md'
                                value={field.state.value} placeholder="https://www..." onChange={(e) => field.handleChange(e.target.value)} />
                        )} />
                        <div className='flex items-center gap-2 w-full'>
                            <Button className="flex-1" onClick={() => addProduct(false)} type='button' size='sm' variant='secondary'>Cancel</Button>
                            <productForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                                <Button className="flex-1" disabled={!canSubmit} type='submit' size='sm'>
                                    {isSubmitting && <Loader className='animate-spin' />}
                                    {!isSubmitting && ("Save")}
                                </Button>
                            )} />
                        </div>
                    </form>
                </Modal>
            )}
        </div>
    )
}