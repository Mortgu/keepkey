import {Loader, Plus} from "lucide-react";
import Button from "@/components/button/button.tsx";
import {useState} from "react";
import {useForm} from "@tanstack/react-form";
import {z} from "zod";
import ProductItem, {type ProductItemProps} from "@/routes/user/_pathlessLayout/admin/-components/product-item.tsx";
import {useProducts} from "@/hooks/product.ts";

export default function ProductList() {
    const { products, isPending, error, createProduct } = useProducts();

    const [isAddingProduct, addProduct] = useState<boolean>(false);

    const productForm = useForm({
        defaultValues: {
            productName: "",
        },
        validators: {
            onChange: z.object({
                productName: z.string().min(1),
            }),
        },
        onSubmit: async ({ value }) => {
            await createProduct(value.productName);
        }
    })

    if (isPending) {
        return (
            <Loader className='animate-spin'/>
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
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Products <span
                    className='p-2 rounded-md bg-gray-200 text-sm flex items-center justify-center'>{products.length}</span>
                </h1>
                <Button onClick={() => addProduct(true)} size='sm'>Create <Plus className='size-4'/></Button>
            </div>
            <div className='grid gap-2'>
                {products.map((product: ProductItemProps) => (
                    <ProductItem key={product.id} {...product} />
                ))}
            </div>

            {isAddingProduct && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    productForm.handleSubmit(productForm);
                }} className="rounded-md mt-4 flex gap-4 p-2 border border-gray-300 hover:bg-gray-100 cursor-pointer">
                    <productForm.Field name='productName' children={(field) => (
                        <input id={field.name} name={field.name} className='flex-1 outline-none border border-gray-300 p-1 rounded-md'
                               value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}/>
                    )}/>
                    <productForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}  children={([canSubmit, isSubmitting]) => (
                        <Button disabled={!canSubmit} type='submit' size='sm'>
                            {isSubmitting && <Loader className='animate-spin' /> }
                            {!isSubmitting && ("Save")}
                        </Button>
                    )}/>
                    <Button onClick={() => addProduct(false)} type='button' size='sm' variant='secondary'>Cancel</Button>
                </form>
            )}
        </div>
    )
}