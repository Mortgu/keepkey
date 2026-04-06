import Button from "@/components/button/button";
import type { ProductItem, ProductItemPricing } from "@/data/types";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import ProductModal from "./product-modal";
import { authClient } from "@/lib/auth-client";

interface ProductCardProps {
    product: ProductItem;
}

const findMaxQuantity = (pricings: ProductItemPricing[]) => {
    let match: ProductItemPricing = pricings[0];
    pricings.map((pricing: ProductItemPricing) => {
        pricing.max_quantity >= match?.max_quantity && (match = pricing);
    });
    return match;
};

export default function ProductCard({ product }: ProductCardProps) {
    const [isOpen, setOpen] = useState(false);
    const { data: session } = authClient.useSession();

    const handleOpenModal = () => {
        if (!session || !session.user) {
            window.location.assign('/login');
            return;
        }

        setOpen(true);
    }

    return (
        <div className='border border-gray-300 rounded-md overflow-hidden'>

            {/* Product Header */}
            <div className='flex items-center justify-between p-2'>
                <div>
                    <h1 className="font-normal text-lg">{product.name}</h1>
                    <p className="text-sm">{product.description}</p>
                </div>

                <div>
                    <Button size='sm' variant='secondary' className=''
                        onClick={handleOpenModal}>
                        <ShoppingBag className='size-4' />
                        Hinzufügen
                    </Button>
                </div>
            </div>


            {/* Product Modal */}
            {isOpen && (
                <ProductModal product={product} setOpen={setOpen} />
            )}

        </div>


    )
}