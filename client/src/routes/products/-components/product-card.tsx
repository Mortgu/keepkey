import Button from "@/components/button/button";
import type { ProductItem } from "@/data/types";
import { ShoppingBag } from "lucide-react";
import { useState } from "react";
import ProductModal from "./product-modal";
import { authClient } from "@/lib/auth-client";

interface ProductCardProps {
    product: ProductItem;
}

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
                <p>{product.name}</p>
                <div>
                    <Button size='sm' variant='secondary' className='aspect-square'
                        onClick={handleOpenModal}>
                        <ShoppingBag className='size-4' />
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