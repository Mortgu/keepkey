export interface Contract {
    id: string;
    name: string;
}

export interface ProductItem {
    id: string;
    name: string;

    published: boolean,

    description: string;
    link: string;

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

export interface DocumentJob {
    id: string;
    orderId: string;
    type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    createdAt: string;
    updatedAt: string;
}
