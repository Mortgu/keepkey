import {createContext, type ReactNode, useContext, useState} from "react";
import {useAddToCart} from "@/hooks/checkout.ts";

export type CartItem = {
    id: string,
    name: string,
    price: number,
    quantity: number,
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    totalPrice: number;
    isPending: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const { mutate, isPending } = useAddToCart();

    const addToCart = (product: CartItem) => {
        mutate(product)
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, isPending, totalPrice }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}