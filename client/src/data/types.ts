export interface Contract {
    id: string;
    name: string;
}

export interface ProductItem {
    id: string;
    name: string;

    createdAt: Date;
    updatedAt: Date;
};

export interface ShoppingCartItem extends ProductItem {
    quantity: number;
    duration: number;
    contract: Contract;

    product: ProductItem;

    price: number;
}
