import Button from "@/components/button/button.tsx";
import {Loader, Pen, Plus, Trash} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {useForm} from "@tanstack/react-form";
import {z} from "zod";
import {useState} from "react";
import {getContractsAction} from "@/data/contracts.ts";
import {useProducts} from "@/hooks/product.ts";

export type ProductItemProps = {
    id: string;
    name: string;
    quantity: number;
    price: number;
    productPricing: [{
        contract: {
            name: string;
        },
        product: {
            name: string;
            updatedAt: Date;
        }
        max_quantity: number;
        min_quantity: number;
        duration: number;
        price: number;
    }];
}

export default function ProductItem(product: ProductItemProps) {
    const { deleteProduct, isDeleting } = useProducts();
    const [isAddingPricing, addPricing] = useState<boolean>(false);

    const { data: contracts } = useQuery({
        queryKey: ['contracts'],
        queryFn: getContractsAction,
    });

    const pricingForm = useForm({
        defaultValues: {
            contractId: "",
            min_quantity: 1,
            max_quantity: 1,
            duration: 1,
            price: 1.0,
        },
        validators: {
            onChange: z.object({
                contractId: z.string().min(1),
                min_quantity: z.int(),
                max_quantity: z.int(),
                duration: z.int(),
                price: z.float32(),
            })
        },
        onSubmit: async ({ value }) => {
            const response = await fetch(`http://localhost:3000/api/pricing/${product.id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ ...value })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error("Failed to create new pricing!");
            }

            addPricing(false);
            window.location.reload();

            return result;
        }
    })

    return (
        <div className='border border-gray-300 rounded-md overflow-hidden'>

            {/* Product Header */}
            <div className='flex items-center justify-between p-2'>
                <p>{product.name}</p>
                <div>
                    <Button size='sm' variant='ghost'>
                        <Pen className='size-4' />
                    </Button>
                    <Button onClick={() => deleteProduct(product.id)} size='sm' variant='ghost'>
                        {isDeleting && <Loader className='size-4 animate-spin' /> }
                        {!isDeleting && <Trash className='size-4' /> }
                    </Button>
                </div>
            </div>

            {/* Product Body */}

            {product.productPricing.map((pricing, index) => (
                <div key={index} className='flex items-center p-2 border-t border-gray-200'>
                    <p className='flex-1'>{pricing?.contract?.name}</p>
                    <p className='flex-1'>{pricing?.min_quantity}-{pricing.max_quantity}</p>
                    <p className='flex-1'>{pricing?.duration}</p>
                    <p className='flex-1'>{pricing?.price} €</p>
                    <Button size='sm' variant='ghost'>
                        <Pen className='size-4'/>
                    </Button>
                    <Button size='sm' variant='ghost'>
                        <Trash className='size-4'/>
                    </Button>
                </div>
            ))}

            {/* Add Pricing Form */}
            {isAddingPricing && (
                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    pricingForm.handleSubmit(pricingForm);
                }} className="border-t gap-2 border-gray-200 py-2 px-2 flex flex-wrap items-center justify-between">
                    <pricingForm.Field name='contractId' children={(field) => (
                        <select id={field.name} name={field.name} defaultValue={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)} className="flex-[2] h-9 px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 text-sm bg-gray-50">
                            {contracts.map((contract: any) => (
                                <option key={contract.id} value={contract.id}>{contract.name}</option>
                            ))}
                        </select>
                    )} />

                    <pricingForm.Field name='min_quantity' children={(field) => (
                        <input id={field.name} value={field.state.value} type="number" className='flex-1 min-w-0 h-9 outline-none border border-gray-300 p-1 rounded-md text-sm' placeholder="min-seats"
                               onChange={(e) => field.handleChange(parseInt(e.target.value))} />
                    )} />
                    <pricingForm.Field name='max_quantity' children={(field) => (
                        <input id={field.name} value={field.state.value} type="number" className='flex-1 min-w-0 h-9 outline-none border border-gray-300 p-1 rounded-md text-sm' placeholder="max-seats"
                               onChange={(e) => field.handleChange(parseInt(e.target.value))} />
                    )} />
                    <pricingForm.Field name='duration' children={(field) => (
                        <input id={field.name} value={field.state.value} type="number" className='flex-1 min-w-0 h-9 outline-none border border-gray-300 p-1 rounded-md text-sm' placeholder="duration"
                               onChange={(e) => field.handleChange(parseInt(e.target.value))} />
                    )} />
                    <pricingForm.Field name='price' children={(field) => (
                        <input id={field.name} value={field.state.value} type="number" step="0.01" className='flex-1 min-w-0 h-9 outline-none border border-gray-300 p-1 rounded-md text-sm' placeholder="price"
                               onChange={(e) => field.handleChange(parseFloat(e.target.value))} />
                    )} />

                    <div className="flex gap-1 shrink-0">
                        <pricingForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                            <Button disabled={!canSubmit} type='submit' size='sm' variant='primary'>
                                {isSubmitting && <Loader className='animate-spin' /> }
                                {!isSubmitting && ("Save")}
                            </Button>
                        )} />
                        <Button onClick={() => addPricing(false)} type='button' size='sm' variant='secondary'>Cancel</Button>
                    </div>
                </form>
            )}

            <div className="border-t border-gray-200 py-2 px-2 flex items-center justify-between">
                <p></p>
                <p></p>
                <button onClick={() => addPricing(true)} className='flex items-center justify-between gap-2 cursor-pointer'>
                    <Plus className='size-4'/>
                    <p>Hinzufügen</p>
                </button>
            </div>

        </div>
    );
}