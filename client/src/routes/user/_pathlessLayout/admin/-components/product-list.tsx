import {getProducts} from "@/data/products.ts";
import {ArrowLeft, ChevronDown, Loader, Pen, Plus, Trash} from "lucide-react";
import {useQuery} from "@tanstack/react-query";
import {Link} from '@tanstack/react-router'
import Button from "@/components/button/button.tsx";

type Product = {
    id: string;
    name: string;
    quantity: number;
}

export default function ProductList() {
    const {data, isPending, error} = useQuery({
        queryKey: ['products'],
        queryFn: getProducts,
    });

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
                    className='p-2 rounded-md bg-gray-200 text-sm flex items-center justify-center'>{data.length}</span>
                </h1>
                <Button size='sm'>Create <Plus className='size-4'/></Button>
            </div>
            {data.map((product: Product) => (
                <div key={product.id} className="flex items-center justify-between  rounded-md border p-2 border-gray-300">
                    <a className='flex-1' params={{productId: product.id}}>
                        {product.name}
                    </a>
                    <Button size='sm' variant='ghost'>
                        <Pen className='size-4'/>
                    </Button>
                    <Button size='sm' variant='ghost'>
                        <Trash className='size-4'/>
                    </Button>
                </div>
            ))}
        </div>
    )
}