import {createContext, type ReactNode, useContext, useState} from "react";

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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);

    const addToCart = (product: CartItem) => {
        setItems((prev) => {
            const existing = prev.find(item => item.id === product.id);

            if (existing) {
                return prev.map(item =>
                    item.id === product.id ? { ...item, quantity: existing.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });
    }

    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addToCart, totalPrice }}>
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