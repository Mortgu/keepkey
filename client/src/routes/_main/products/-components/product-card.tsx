import type { ProductItem } from "@/data/types";

interface ProductCardProps {
    product: ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
    return (
        <div className='border border-(--border) rounded-md overflow-hidden'>

            {/* Product Header */}
            <div className='flex items-center justify-between p-2'>
                <div>
                    <h1 className="font-normal text-lg">{product.name}</h1>
                    <p className="text-sm">{product.description}</p>
                </div>
            </div>

        </div>


    )
}